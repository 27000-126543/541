const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNo: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  
  type: { type: String, enum: ['delivery', 'pickup'], required: true },
  
  items: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true },
    specification: { type: String },
    manufacturer: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    image: { type: String },
    isPrescription: { type: Boolean, default: false }
  }],
  
  goodsAmount: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  memberDiscount: { type: Number, default: 0 },
  insurancePay: { type: Number, default: 0 },
  selfPay: { type: Number, required: true },
  payAmount: { type: Number, required: true },
  
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  hasPrescription: { type: Boolean, default: false },
  
  address: {
    name: String,
    phone: String,
    province: String,
    city: String,
    district: String,
    detail: String
  },
  
  pickupCode: { type: String },
  pickupTime: { type: Date },
  
  deliveryInfo: {
    logisticsCompany: String,
    trackingNo: String,
    estimatedTime: Date,
    actualDeliveryTime: Date,
    courierName: String,
    courierPhone: String
  },
  
  logisticsTracks: [{
    time: { type: Date, default: Date.now },
    status: String,
    description: String
  }],
  
  status: { type: String, required: true, default: 'pending_payment' },
  
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  
  payMethod: { type: String, enum: ['wechat', 'alipay', 'insurance', 'balance'] },
  payTime: { type: Date },
  
  cancelReason: { type: String },
  cancelTime: { type: Date },
  
  remark: { type: String },
  
  memberPointsEarned: { type: Number, default: 0 }
}, {
  timestamps: true
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
