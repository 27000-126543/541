const { Order, Store, StoreMedicine, Medicine, StockRecord, User, Promotion } = require('../models');
const { success, error, paginate, asyncHandler } = require('../middlewares/response');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const dayjs = require('dayjs');

exports.createOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    storeId,
    type,
    items,
    addressId,
    pickupTime,
    promotionId,
    couponId,
    prescriptionId,
    remark,
    useInsurance
  } = req.body;
  
  const store = await Store.findById(storeId);
  if (!store) {
    return error(res, '门店不存在');
  }
  
  if (type === 'delivery' && !store.supportsDelivery) {
    return error(res, '该门店不支持配送');
  }
  if (type === 'pickup' && !store.supportsPickup) {
    return error(res, '该门店不支持自提');
  }
  
  let address = null;
  if (type === 'delivery') {
    address = user.addresses.id(addressId);
    if (!address) {
      return error(res, '收货地址不存在');
    }
  }
  
  let orderItems = [];
  let goodsAmount = 0;
  
  for (const item of items) {
    const medicine = await Medicine.findById(item.medicineId);
    if (!medicine) {
      return error(res, `药品不存在`);
    }
    
    const storeMed = await StoreMedicine.findOne({ storeId, medicineId: item.medicineId });
    if (!storeMed || storeMed.availableStock < item.quantity) {
      return error(res, `${medicine.name}库存不足`);
    }
    
    const price = storeMed.price || medicine.price;
    const subtotal = price * item.quantity;
    goodsAmount += subtotal;
    
    orderItems.push({
      medicineId: medicine._id,
      medicineName: medicine.name,
      specification: medicine.specification,
      manufacturer: medicine.manufacturer,
      price,
      originalPrice: medicine.originalPrice || price,
      quantity: item.quantity,
      subtotal,
      image: medicine.coverImage,
      isPrescription: medicine.type === 'prescription'
    });
  }
  
  let deliveryFee = 0;
  if (type === 'delivery') {
    if (goodsAmount < store.freeDeliveryAmount) {
      deliveryFee = store.deliveryFee;
    }
  }
  
  let discountAmount = 0;
  let memberDiscount = 0;
  let promotion = null;
  
  if (promotionId) {
    promotion = await Promotion.findById(promotionId);
    if (promotion && promotion.status === 'active') {
      discountAmount = calculatePromotionDiscount(promotion, goodsAmount);
    }
  }
  
  const memberLevelInfo = user.memberLevelInfo;
  memberDiscount = goodsAmount * (1 - memberLevelInfo.discount);
  
  let insurancePay = 0;
  if (useInsurance && user.medicalInsurance.isBound) {
    insurancePay = Math.min(user.medicalInsurance.balance, goodsAmount * 0.5);
  }
  
  const totalDiscount = discountAmount + memberDiscount;
  const payAmount = goodsAmount + deliveryFee - totalDiscount - insurancePay;
  const selfPay = payAmount;
  
  const orderNo = generateOrderNo();
  
  let pickupCode = null;
  if (type === 'pickup') {
    pickupCode = Math.random().toString().slice(2, 8);
  }
  
  const order = await Order.create({
    orderNo,
    userId: user._id,
    storeId,
    type,
    items: orderItems,
    goodsAmount,
    deliveryFee,
    discountAmount,
    memberDiscount,
    insurancePay,
    selfPay,
    payAmount,
    address: type === 'delivery' ? {
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail
    } : null,
    pickupCode,
    pickupTime: pickupTime ? new Date(pickupTime) : null,
    promotionId,
    couponId,
    prescriptionId,
    hasPrescription: !!prescriptionId,
    status: config.orderStatus.PENDING_PAYMENT,
    remark,
    memberPointsEarned: Math.floor(payAmount / 10)
  });
  
  for (const item of items) {
    await StoreMedicine.findOneAndUpdate(
      { storeId, medicineId: item.medicineId },
      {
        $inc: {
          availableStock: -item.quantity,
          lockedStock: item.quantity
        }
      }
    );
  }
  
  success(res, {
    orderId: order._id,
    orderNo: order.orderNo,
    payAmount: order.payAmount
  }, '订单创建成功');
});

exports.getOrderList = asyncHandler(async (req, res) => {
  const user = req.user;
  const { status, page = 1, pageSize = 10 } = req.query;
  
  const query = { userId: user._id };
  if (status && status !== 'all') {
    query.status = status;
  }
  
  const skip = (page - 1) * pageSize;
  
  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize))
      .populate('storeId', 'name phone address'),
    Order.countDocuments(query)
  ]);
  
  paginate(res, orders, total, Number(page), Number(pageSize));
});

exports.getOrderDetail = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  
  const order = await Order.findOne({ _id: id, userId: user._id })
    .populate('storeId', 'name phone address longitude latitude')
    .populate('prescriptionId');
  
  if (!order) {
    return error(res, '订单不存在');
  }
  
  success(res, order);
});

exports.payOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { payMethod = 'wechat' } = req.body;
  
  const order = await Order.findOne({ _id: id, userId: user._id });
  if (!order) {
    return error(res, '订单不存在');
  }
  
  if (order.status !== config.orderStatus.PENDING_PAYMENT) {
    return error(res, '订单状态不正确');
  }
  
  order.status = order.type === 'pickup' ? config.orderStatus.PAID : config.orderStatus.PROCESSING;
  order.payMethod = payMethod;
  order.payTime = new Date();
  
  await order.save();
  
  for (const item of order.items) {
    await StoreMedicine.findOneAndUpdate(
      { storeId: order.storeId, medicineId: item.medicineId },
      { $inc: { lockedStock: -item.quantity } }
    );
    
    await Medicine.findByIdAndUpdate(item.medicineId, {
      $inc: { salesCount: item.quantity }
    });
    
    await StockRecord.create({
      type: 'outbound',
      storeId: order.storeId,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: -item.quantity,
      referenceNo: order.orderNo,
      reason: '订单出库',
      operator: 'system'
    });
  }
  
  const pointsToAdd = Math.floor(order.payAmount / 10);
  user.memberPoints += pointsToAdd;
  user.yearlyConsumption += order.payAmount;
  
  const newLevel = calculateMemberLevel(user.yearlyConsumption);
  if (newLevel !== user.memberLevel) {
    user.memberLevel = newLevel;
    const levelInfo = config.memberLevels[newLevel];
    user.freeConsultationCount = levelInfo.freeConsultation;
  }
  
  await user.save();
  
  if (order.type === 'delivery') {
    order.logisticsTracks.push({
      status: 'processing',
      description: '订单已支付，门店正在备货中'
    });
    await order.save();
  }
  
  success(res, {
    orderId: order._id,
    status: order.status,
    pickupCode: order.pickupCode
  }, '支付成功');
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { reason } = req.body;
  
  const order = await Order.findOne({ _id: id, userId: user._id });
  if (!order) {
    return error(res, '订单不存在');
  }
  
  if (![config.orderStatus.PENDING_PAYMENT, config.orderStatus.PAID, config.orderStatus.PROCESSING].includes(order.status)) {
    return error(res, '当前状态不能取消订单');
  }
  
  order.status = config.orderStatus.CANCELLED;
  order.cancelReason = reason;
  order.cancelTime = new Date();
  
  await order.save();
  
  for (const item of order.items) {
    let stockInc = item.quantity;
    let lockedDec = 0;
    
    if (order.status === config.orderStatus.PENDING_PAYMENT) {
      lockedDec = item.quantity;
    }
    
    await StoreMedicine.findOneAndUpdate(
      { storeId: order.storeId, medicineId: item.medicineId },
      {
        $inc: {
          availableStock: stockInc,
          lockedStock: -lockedDec
        }
      }
    );
  }
  
  success(res, null, '订单已取消');
});

exports.confirmReceive = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  
  const order = await Order.findOne({ _id: id, userId: user._id });
  if (!order) {
    return error(res, '订单不存在');
  }
  
  if (order.type === 'delivery' && order.status !== config.orderStatus.SHIPPED) {
    return error(res, '订单状态不正确');
  }
  if (order.type === 'pickup' && order.status !== config.orderStatus.PAID) {
    return error(res, '订单状态不正确');
  }
  
  order.status = order.type === 'delivery' ? config.orderStatus.DELIVERED : config.orderStatus.PICKED_UP;
  
  if (order.type === 'delivery') {
    order.deliveryInfo.actualDeliveryTime = new Date();
    order.logisticsTracks.push({
      status: 'delivered',
      description: '订单已送达，感谢您的购买'
    });
  }
  
  await order.save();
  
  success(res, null, '确认收货成功');
});

function generateOrderNo() {
  const now = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.random().toString().slice(2, 8);
  return `PH${now}${random}`;
}

function calculatePromotionDiscount(promotion, amount) {
  if (promotion.type === 'full_reduction') {
    const tiers = promotion.rules.fullReduction?.tiers || [];
    tiers.sort((a, b) => b.threshold - a.threshold);
    for (const tier of tiers) {
      if (amount >= tier.threshold) {
        return tier.discount;
      }
    }
  }
  if (promotion.type === 'discount') {
    const rate = promotion.rules.discount?.discountRate || 1;
    return amount * (1 - rate);
  }
  return 0;
}

function calculateMemberLevel(yearlyConsumption) {
  const levels = config.memberLevels;
  if (yearlyConsumption >= levels.diamond.minAmount) return 'diamond';
  if (yearlyConsumption >= levels.gold.minAmount) return 'gold';
  if (yearlyConsumption >= levels.silver.minAmount) return 'silver';
  return 'normal';
}
