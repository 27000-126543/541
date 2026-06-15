const { Consultation, Doctor, User, Prescription } = require('../models');
const { success, error, paginate, asyncHandler } = require('../middlewares/response');
const config = require('../config');
const dayjs = require('dayjs');

exports.getDoctorList = asyncHandler(async (req, res) => {
  const { department, keyword, page = 1, pageSize = 10, status } = req.query;
  
  const query = { status: 'active', isVerified: true };
  
  if (department) {
    query.department = department;
  }
  
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { title: { $regex: keyword, $options: 'i' } }
    ];
  }
  
  if (status) {
    query.serviceStatus = status;
  }
  
  const skip = (page - 1) * pageSize;
  
  const [doctors, total] = await Promise.all([
    Doctor.find(query).sort({ isRecommended: -1, consultationCount: -1 }).skip(skip).limit(Number(pageSize)),
    Doctor.countDocuments(query)
  ]);
  
  paginate(res, doctors, total, Number(page), Number(pageSize));
});

exports.getDoctorDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return error(res, '医生不存在');
  }
  
  success(res, doctor);
});

exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = [
    { id: 'internal', name: '内科', icon: '', doctors: 15 },
    { id: 'surgery', name: '外科', icon: '', doctors: 8 },
    { id: 'pediatrics', name: '儿科', icon: '', doctors: 6 },
    { id: 'gynecology', name: '妇科', icon: '', doctors: 5 },
    { id: 'dermatology', name: '皮肤科', icon: '', doctors: 4 },
    { id: 'ophthalmology', name: '眼科', icon: '', doctors: 3 },
    { id: 'dental', name: '口腔科', icon: '', doctors: 4 },
    { id: 'tcm', name: '中医科', icon: '', doctors: 5 },
    { id: 'pharmacy', name: '药剂科', icon: '', doctors: 3 },
    { id: 'psychology', name: '心理科', icon: '', doctors: 2 }
  ];
  
  success(res, departments);
});

exports.createConsultation = asyncHandler(async (req, res) => {
  const user = req.user;
  const { doctorId, type = 'text', symptoms, symptomImages, medicalHistory, allergyHistory, patientName } = req.body;
  
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return error(res, '医生不存在');
  }
  
  if (doctor.serviceStatus === 'offline') {
    return error(res, '医生当前不在线');
  }
  
  const consultationNo = generateConsultationNo();
  
  let price = doctor.consultationPrice;
  let isFree = false;
  
  if (user.freeConsultationCount > 0) {
    isFree = true;
    price = 0;
  }
  
  const consultation = await Consultation.create({
    consultationNo,
    userId: user._id,
    userName: user.nickname,
    userAvatar: user.avatar,
    doctorId,
    doctorName: doctor.name,
    doctorAvatar: doctor.avatar,
    department: doctor.department,
    title: doctor.title,
    type,
    symptoms,
    symptomImages: symptomImages || [],
    medicalHistory,
    allergyHistory,
    status: config.consultationStatus.PENDING,
    price,
    isFree,
    messages: [
      {
        sender: 'system',
        type: 'system',
        content: '咨询已创建，正在等待医生接诊...'
      }
    ]
  });
  
  if (isFree) {
    user.freeConsultationCount -= 1;
    await user.save();
  }
  
  success(res, {
    consultationId: consultation._id,
    consultationNo: consultation.consultationNo,
    price: consultation.price,
    isFree: consultation.isFree
  }, '咨询创建成功');
});

exports.getConsultationList = asyncHandler(async (req, res) => {
  const user = req.user;
  const { status, page = 1, pageSize = 10 } = req.query;
  
  const query = { userId: user._id };
  if (status && status !== 'all') {
    query.status = status;
  }
  
  const skip = (page - 1) * pageSize;
  
  const [consultations, total] = await Promise.all([
    Consultation.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    Consultation.countDocuments(query)
  ]);
  
  paginate(res, consultations, total, Number(page), Number(pageSize));
});

exports.getConsultationDetail = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  
  const consultation = await Consultation.findOne({ _id: id, userId: user._id });
  if (!consultation) {
    return error(res, '咨询不存在');
  }
  
  success(res, consultation);
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { content, type = 'text' } = req.body;
  
  const consultation = await Consultation.findOne({ _id: id, userId: user._id });
  if (!consultation) {
    return error(res, '咨询不存在');
  }
  
  if (![config.consultationStatus.IN_PROGRESS, config.consultationStatus.PENDING].includes(consultation.status)) {
    return error(res, '当前状态不能发送消息');
  }
  
  consultation.messages.push({
    sender: 'user',
    type,
    content
  });
  
  if (consultation.status === config.consultationStatus.PENDING) {
    consultation.status = config.consultationStatus.IN_PROGRESS;
    consultation.startTime = new Date();
  }
  
  await consultation.save();
  
  success(res, consultation.messages[consultation.messages.length - 1], '发送成功');
});

exports.rateConsultation = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { rating, reviewContent } = req.body;
  
  const consultation = await Consultation.findOne({ _id: id, userId: user._id });
  if (!consultation) {
    return error(res, '咨询不存在');
  }
  
  if (consultation.status !== config.consultationStatus.COMPLETED) {
    return error(res, '咨询未完成，不能评价');
  }
  
  consultation.rating = rating;
  consultation.reviewContent = reviewContent;
  consultation.reviewTime = new Date();
  
  await consultation.save();
  
  const doctor = await Doctor.findById(consultation.doctorId);
  if (doctor) {
    doctor.reviewCount += 1;
    doctor.averageRating = ((doctor.averageRating * (doctor.reviewCount - 1)) + rating) / doctor.reviewCount;
    doctor.goodRate = rating >= 4 ? Math.min(100, doctor.goodRate + 1) : doctor.goodRate;
    await doctor.save();
  }
  
  success(res, null, '评价成功');
});

function generateConsultationNo() {
  const now = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.random().toString().slice(2, 6);
  return `CS${now}${random}`;
}
