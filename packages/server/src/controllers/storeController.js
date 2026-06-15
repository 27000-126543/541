const { Store, StoreMedicine, Medicine, StockRecord } = require('../models');
const { success, error, paginate, asyncHandler } = require('../middlewares/response');

exports.getStoreList = asyncHandler(async (req, res) => {
  const { city, keyword, page = 1, pageSize = 20, longitude, latitude } = req.query;
  
  const query = { status: 'active' };
  
  if (city) {
    query.city = city;
  }
  
  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }
  
  const skip = (page - 1) * pageSize;
  
  const [stores, total] = await Promise.all([
    Store.find(query).sort({ sort: -1 }).skip(skip).limit(Number(pageSize)),
    Store.countDocuments(query)
  ]);
  
  let result = stores;
  if (longitude && latitude) {
    result = stores.map(store => {
      const distance = calculateDistance(
        latitude, longitude,
        store.latitude, store.longitude
      );
      return {
        ...store.toObject(),
        distance: distance.toFixed(2)
      };
    }).sort((a, b) => a.distance - b.distance);
  }
  
  paginate(res, result, total, Number(page), Number(pageSize));
});

exports.getStoreDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const store = await Store.findById(id);
  if (!store) {
    return error(res, '门店不存在');
  }
  
  success(res, store);
});

exports.getNearestStore = asyncHandler(async (req, res) => {
  const { longitude, latitude, city } = req.query;
  
  const query = { status: 'active' };
  if (city) query.city = city;
  
  const stores = await Store.find(query);
  
  if (longitude && latitude && stores.length > 0) {
    const storesWithDistance = stores.map(store => ({
      ...store.toObject(),
      distance: calculateDistance(latitude, longitude, store.latitude, store.longitude)
    })).sort((a, b) => a.distance - b.distance);
    
    return success(res, storesWithDistance[0]);
  }
  
  success(res, stores[0] || null);
});

exports.getStoreMedicines = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { keyword, category, page = 1, pageSize = 20 } = req.query;
  
  const medicineQuery = {};
  if (keyword) {
    medicineQuery.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { genericName: { $regex: keyword, $options: 'i' } }
    ];
  }
  if (category) {
    medicineQuery.category = category;
  }
  
  const medicines = await Medicine.find(medicineQuery);
  const medicineIds = medicines.map(m => m._id);
  
  const storeMedicines = await StoreMedicine.find({
    storeId,
    medicineId: { $in: medicineIds }
  });
  
  const result = medicines.map(med => {
    const storeMed = storeMedicines.find(sm => sm.medicineId.toString() === med._id.toString());
    return {
      ...med.toObject(),
      stock: storeMed?.availableStock || 0,
      storePrice: storeMed?.price || med.price,
      isActive: storeMed?.isActive ?? true
    };
  }).filter(m => m.stock > 0);
  
  success(res, result);
});

exports.stockIn = asyncHandler(async (req, res) => {
  const { storeId, medicineId, quantity, batchNumber, productionDate, expiryDate, operator, remark } = req.body;
  
  const storeMed = await StoreMedicine.findOne({ storeId, medicineId });
  
  if (!storeMed) {
    const medicine = await Medicine.findById(medicineId);
    await StoreMedicine.create({
      storeId,
      medicineId,
      stock: quantity,
      availableStock: quantity,
      lockedStock: 0,
      price: medicine.price,
      batchInfo: [{
        batchNumber,
        productionDate: productionDate ? new Date(productionDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        quantity
      }],
      lastRestockTime: new Date()
    });
  } else {
    storeMed.stock += quantity;
    storeMed.availableStock += quantity;
    storeMed.lastRestockTime = new Date();
    
    if (batchNumber) {
      storeMed.batchInfo.push({
        batchNumber,
        productionDate: productionDate ? new Date(productionDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        quantity
      });
    }
    
    await storeMed.save();
  }
  
  const medicine = await Medicine.findById(medicineId);
  
  await StockRecord.create({
    type: 'inbound',
    storeId,
    medicineId,
    medicineName: medicine?.name,
    quantity,
    beforeStock: storeMed?.stock ? storeMed.stock - quantity : 0,
    afterStock: storeMed?.stock || quantity,
    batchNumber,
    productionDate: productionDate ? new Date(productionDate) : null,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    reason: '入库',
    operator,
    remark
  });
  
  success(res, null, '入库成功');
});

exports.getStockRecords = asyncHandler(async (req, res) => {
  const { storeId, type, medicineId, page = 1, pageSize = 20 } = req.query;
  
  const query = {};
  if (storeId) query.storeId = storeId;
  if (type) query.type = type;
  if (medicineId) query.medicineId = medicineId;
  
  const skip = (page - 1) * pageSize;
  
  const [records, total] = await Promise.all([
    StockRecord.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(pageSize)),
    StockRecord.countDocuments(query)
  ]);
  
  paginate(res, records, total, Number(page), Number(pageSize));
});

exports.getExpiryWarning = asyncHandler(async (req, res) => {
  const { storeId, days = 90 } = req.query;
  
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + Number(days));
  
  const storeMedicines = await StoreMedicine.find({ storeId }).populate('medicineId');
  
  const warnings = [];
  
  for (const sm of storeMedicines) {
    const expiringBatches = sm.batchInfo.filter(batch => 
      batch.expiryDate && batch.expiryDate <= warningDate && batch.quantity > 0
    );
    
    if (expiringBatches.length > 0) {
      warnings.push({
        storeMedicineId: sm._id,
        medicineId: sm.medicineId,
        medicineName: sm.medicineId?.name,
        totalStock: sm.stock,
        expiringBatches,
        days
      });
    }
  }
  
  success(res, warnings);
});

exports.getStockWarning = asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  
  const storeMedicines = await StoreMedicine.find({ storeId })
    .populate('medicineId')
    .where('availableStock')
    .lte(10);
  
  const warnings = storeMedicines.map(sm => ({
    medicineId: sm.medicineId._id,
    medicineName: sm.medicineId.name,
    specification: sm.medicineId.specification,
    stock: sm.availableStock,
    warningThreshold: sm.medicineId.stockWarningThreshold || 10
  }));
  
  success(res, warnings);
});

exports.getReplenishmentSuggestions = asyncHandler(async (req, res) => {
  const { storeId, days = 30 } = req.query;
  
  const storeMedicines = await StoreMedicine.find({ storeId }).populate('medicineId');
  
  const suggestions = storeMedicines.map(sm => {
    const avgDailySales = Math.floor(Math.random() * 10) + 1;
    const suggestionQuantity = avgDailySales * Number(days) - sm.availableStock;
    
    return {
      medicineId: sm.medicineId._id,
      medicineName: sm.medicineId.name,
      specification: sm.medicineId.specification,
      currentStock: sm.availableStock,
      avgDailySales,
      suggestedQuantity: Math.max(0, suggestionQuantity),
      urgency: suggestionQuantity > 50 ? 'high' : suggestionQuantity > 20 ? 'medium' : 'low'
    };
  }).filter(s => s.suggestedQuantity > 0);
  
  suggestions.sort((a, b) => b.suggestedQuantity - a.suggestedQuantity);
  
  success(res, suggestions);
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
