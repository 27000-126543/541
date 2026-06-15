const { Medicine, StoreMedicine, Store, Category } = require('../models');
const { success, error, paginate, asyncHandler } = require('../middlewares/response');

exports.getMedicineList = asyncHandler(async (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    keyword,
    category,
    type,
    sort = 'default',
    minPrice,
    maxPrice,
    isOnSale,
    storeId
  } = req.query;
  
  const query = {};
  
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { genericName: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (isOnSale !== undefined) {
    query.isOnSale = isOnSale === 'true';
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  
  let sortOption = { sort: -1, createdAt: -1 };
  switch (sort) {
    case 'price_asc':
      sortOption = { price: 1 };
      break;
    case 'price_desc':
      sortOption = { price: -1 };
      break;
    case 'sales':
      sortOption = { salesCount: -1 };
      break;
    case 'new':
      sortOption = { createdAt: -1 };
      break;
  }
  
  const skip = (page - 1) * pageSize;
  
  const [medicines, total] = await Promise.all([
    Medicine.find(query).sort(sortOption).skip(skip).limit(Number(pageSize)),
    Medicine.countDocuments(query)
  ]);
  
  let medicinesWithStock = medicines;
  
  if (storeId) {
    const storeMedicines = await StoreMedicine.find({
      storeId,
      medicineId: { $in: medicines.map(m => m._id) }
    });
    
    medicinesWithStock = medicines.map(med => {
      const storeMed = storeMedicines.find(sm => sm.medicineId.toString() === med._id.toString());
      return {
        ...med.toObject(),
        stock: storeMed?.availableStock || 0,
        storePrice: storeMed?.price || med.price
      };
    });
  }
  
  paginate(res, medicinesWithStock, total, Number(page), Number(pageSize));
});

exports.getMedicineDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { storeId } = req.query;
  
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    return error(res, '药品不存在');
  }
  
  const result = medicine.toObject();
  
  if (storeId) {
    const storeMed = await StoreMedicine.findOne({ storeId, medicineId: id });
    result.stock = storeMed?.availableStock || 0;
    result.storePrice = storeMed?.price || medicine.price;
  }
  
  const relatedMedicines = await Medicine.find({
    category: medicine.category,
    _id: { $ne: id }
  }).limit(10);
  
  result.relatedMedicines = relatedMedicines;
  
  success(res, result);
});

exports.getCategories = asyncHandler(async (req, res) => {
  const { type, parentId } = req.query;
  const query = { isShow: true };
  
  if (type) {
    query.medicineType = type;
  }
  
  if (parentId) {
    query.parentId = parentId;
  } else {
    query.level = 1;
  }
  
  const categories = await Category.find(query).sort({ sort: -1 });
  
  success(res, categories);
});

exports.getRecommendMedicines = asyncHandler(async (req, res) => {
  const { type = 'hot', limit = 10, storeId } = req.query;
  
  let query = { isOnSale: true };
  
  switch (type) {
    case 'hot':
      query.isHot = true;
      break;
    case 'new':
      query.isNew = true;
      break;
    case 'recommend':
      query.isRecommended = true;
      break;
  }
  
  const medicines = await Medicine.find(query)
    .sort({ salesCount: -1 })
    .limit(Number(limit));
  
  let result = medicines;
  
  if (storeId) {
    const storeMedicines = await StoreMedicine.find({
      storeId,
      medicineId: { $in: medicines.map(m => m._id) }
    });
    
    result = medicines.map(med => {
      const storeMed = storeMedicines.find(sm => sm.medicineId.toString() === med._id.toString());
      return {
        ...med.toObject(),
        stock: storeMed?.availableStock || 0,
        storePrice: storeMed?.price || med.price
      };
    });
  }
  
  success(res, result);
});

exports.searchMedicines = asyncHandler(async (req, res) => {
  const { keyword, page = 1, pageSize = 20, storeId } = req.query;
  
  if (!keyword) {
    return success(res, { list: [], total: 0 });
  }
  
  const query = {
    isOnSale: true,
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { genericName: { $regex: keyword, $options: 'i' } },
      { brand: { $regex: keyword, $options: 'i' } },
      { indications: { $regex: keyword, $options: 'i' } }
    ]
  };
  
  const skip = (page - 1) * pageSize;
  
  const [medicines, total] = await Promise.all([
    Medicine.find(query).sort({ salesCount: -1 }).skip(skip).limit(Number(pageSize)),
    Medicine.countDocuments(query)
  ]);
  
  let result = medicines;
  
  if (storeId) {
    const storeMedicines = await StoreMedicine.find({
      storeId,
      medicineId: { $in: medicines.map(m => m._id) }
    });
    
    result = medicines.map(med => {
      const storeMed = storeMedicines.find(sm => sm.medicineId.toString() === med._id.toString());
      return {
        ...med.toObject(),
        stock: storeMed?.availableStock || 0,
        storePrice: storeMed?.price || med.price
      };
    });
  }
  
  paginate(res, result, total, Number(page), Number(pageSize));
});

exports.getHotKeywords = asyncHandler(async (req, res) => {
  const hotKeywords = [
    '感冒', '发烧', '咳嗽', '头痛', '胃痛',
    '维生素', '钙片', '益生菌', '蛋白粉', '血压计',
    '板蓝根', '阿莫西林', '布洛芬', '连花清瘟', '藿香正气'
  ];
  
  success(res, hotKeywords);
});
