const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  englishName: { type: String },
  brand: { type: String },
  
  category: { type: String, required: true },
  subCategory: { type: String },
  type: { type: String, enum: ['otc', 'prescription', 'health', 'medical_device', 'others'], required: true },
  
  specification: { type: String, required: true },
  dosage: { type: String },
  manufacturer: { type: String, required: true },
  approvalNumber: { type: String, required: true },
  
  mainIngredients: [{ type: String }],
  indications: { type: String },
  usageDosage: { type: String },
  adverseReactions: { type: String },
  contraindications: { type: String },
  precautions: { type: String },
  drugInteractions: { type: String },
  storage: { type: String },
  validityPeriod: { type: String },
  
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  costPrice: { type: Number },
  
  images: [{ type: String }],
  coverImage: { type: String },
  description: { type: String },
  richDescription: { type: String },
  
  tags: [{ type: String }],
  salesCount: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  
  isOnSale: { type: Boolean, default: true },
  isHot: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  
  sort: { type: Number, default: 0 },
  stockWarningThreshold: { type: Number, default: 10 },
  expiryWarningDays: { type: Number, default: 90 }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text' });
medicineSchema.index({ category: 1, type: 1 });
medicineSchema.index({ price: 1 });
medicineSchema.index({ salesCount: -1 });

module.exports = mongoose.model('Medicine', medicineSchema);
