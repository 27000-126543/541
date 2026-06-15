const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 1 },
  sort: { type: Number, default: 0 },
  icon: { type: String },
  bannerImage: { type: String },
  description: { type: String },
  isShow: { type: Boolean, default: true },
  medicineType: { type: String, enum: ['otc', 'prescription', 'health', 'medical_device', 'others'] }
}, {
  timestamps: true
});

categorySchema.index({ parentId: 1, sort: 1 });

module.exports = mongoose.model('Category', categorySchema);
