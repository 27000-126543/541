const { Prescription, Medicine, User } = require('../models');
const { success, error, paginate, asyncHandler } = require('../middlewares/response');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');

exports.uploadPrescription = asyncHandler(async (req, res) => {
  const user = req.user;
  const { patientName, patientAge, patientGender, images, medicines } = req.body;
  
  const prescriptionNo = generatePrescriptionNo();
  
  const prescription = await Prescription.create({
    prescriptionNo,
    userId: user._id,
    patientName,
    patientAge,
    patientGender,
    type: 'upload',
    uploadedImages: images,
    medicines: medicines || [],
    status: config.prescriptionStatus.PENDING,
    expireDate: dayjs().add(7, 'day').toDate()
  });
  
  success(res, {
    prescriptionId: prescription._id,
    prescriptionNo: prescription.prescriptionNo,
    status: prescription.status
  }, '处方已上传，等待审核');
});

exports.getPrescriptionList = asyncHandler(async (req, res) => {
  const user = req.user;
  const { status, page = 1, pageSize = 10 } = req.query;
  
  const query = { userId: user._id };
  if (status && status !== 'all') {
    query.status = status;
  }
  
  const skip = (page - 1) * pageSize;
  
  const [prescriptions, total] = await Promise.all([
    Prescription.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    Prescription.countDocuments(query)
  ]);
  
  paginate(res, prescriptions, total, Number(page), Number(pageSize));
});

exports.getPrescriptionDetail = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  
  const prescription = await Prescription.findOne({ _id: id, userId: user._id })
    .populate('doctorId', 'name title department');
  
  if (!prescription) {
    return error(res, '处方不存在');
  }
  
  success(res, prescription);
});

exports.reviewPrescription = asyncHandler(async (req, res) => {
  const admin = req.admin;
  const { id } = req.params;
  const { action, remark } = req.body;
  
  const prescription = await Prescription.findById(id);
  if (!prescription) {
    return error(res, '处方不存在');
  }
  
  if (prescription.status !== config.prescriptionStatus.PENDING && 
      prescription.status !== config.prescriptionStatus.REVIEWING) {
    return error(res, '处方状态不允许审核');
  }
  
  if (action === 'approve') {
    const checkResult = checkDrugInteractions(prescription.medicines);
    
    if (!checkResult.passed && checkResult.warnings.length > 0) {
      prescription.drugInteractionCheck = {
        passed: false,
        warnings: checkResult.warnings,
        checkedAt: new Date()
      };
      await prescription.save();
      return error(res, '存在药物相互作用风险，请确认后再审核', 1001);
    }
    
    prescription.status = config.prescriptionStatus.APPROVED;
    prescription.pharmacistId = admin._id;
    prescription.pharmacistName = admin.realName;
    prescription.reviewRemark = remark;
    prescription.reviewedAt = new Date();
    prescription.drugInteractionCheck = {
      passed: true,
      warnings: [],
      checkedAt: new Date()
    };
    
  } else if (action === 'reject') {
    prescription.status = config.prescriptionStatus.REJECTED;
    prescription.pharmacistId = admin._id;
    prescription.pharmacistName = admin.realName;
    prescription.rejectedReason = remark;
    prescription.reviewedAt = new Date();
  }
  
  await prescription.save();
  
  success(res, { status: prescription.status }, '审核完成');
});

exports.getAdminPrescriptionList = asyncHandler(async (req, res) => {
  const { status, page = 1, pageSize = 20, keyword } = req.query;
  
  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (keyword) {
    query.$or = [
      { prescriptionNo: { $regex: keyword, $options: 'i' } },
      { patientName: { $regex: keyword, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * pageSize;
  
  const [prescriptions, total] = await Promise.all([
    Prescription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .populate('userId', 'nickname phone'),
    Prescription.countDocuments(query)
  ]);
  
  paginate(res, prescriptions, total, Number(page), Number(pageSize));
});

exports.checkDrugInteractions = asyncHandler(async (req, res) => {
  const { medicineIds } = req.body;
  
  const medicines = await Medicine.find({ _id: { $in: medicineIds } });
  
  const mockMedicines = medicines.map(m => ({
    id: m._id,
    name: m.name,
    ingredients: m.mainIngredients || []
  }));
  
  const result = checkDrugInteractions(mockMedicines);
  
  success(res, result);
});

function generatePrescriptionNo() {
  const now = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.random().toString().slice(2, 6);
  return `RX${now}${random}`;
}

function checkDrugInteractions(medicines) {
  const warnings = [];
  const passed = true;
  
  const interactionPairs = [
    { drugs: ['阿司匹林', '布洛芬'], warning: '阿司匹林与布洛芬同服可能增加胃肠道出血风险' },
    { drugs: ['头孢', '酒精'], warning: '服用头孢类药物期间禁止饮酒，可能引起双硫仑反应' },
    { drugs: ['硝酸甘油', '西地那非'], warning: '硝酸甘油与西地那非同服可能导致严重低血压' }
  ];
  
  for (const pair of interactionPairs) {
    const found = pair.drugs.filter(drug => 
      medicines.some(m => m.name?.includes(drug))
    );
    if (found.length >= 2) {
      warnings.push(pair.warning);
    }
  }
  
  return {
    passed: warnings.length === 0,
    warnings
  };
}
