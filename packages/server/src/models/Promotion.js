const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['full_reduction', 'group_buy', 'flash_sale', 'coupon', 'discount'], required: true },
  
  description: { type: String },
  bannerImage: { type: String },
  
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  status: { type: String, enum: ['draft', 'active', 'ended', 'cancelled'], default: 'draft' },
  
  rules: {
    fullReduction: {
      tiers: [{
        threshold: { type: Number },
        discount: { type: Number }
      }]
    },
    groupBuy: {
      groupSize: { type: Number },
      discountRate: { type: Number },
      duration: { type: Number }
    },
    flashSale: {
      startTime: Date,
      endTime: Date,
      discountRate: { type: Number },
      limitPerUser: { type: Number }
    },
    discount: {
      discountRate: { type: Number }
    }
  },
  
  applicableMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
  applicableCategories: [{ type: String }],
  excludeMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
  
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  
  useCount: { type: Number, default: 0 },
  maxUseCount: { type: Number },
  
  createdBy: { type: String }
}, {
  timestamps: true
});

promotionSchema.index({ type: 1, status: 1 });
promotionSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
