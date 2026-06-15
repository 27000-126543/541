const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  
  department: { type: String, required: true },
  title: { type: String, required: true },
  
  hospital: { type: String },
  practicingLicense: { type: String },
  idCard: { type: String },
  
  specialties: [{ type: String }],
  introduction: { type: String },
  
  consultationPrice: { type: Number, default: 0 },
  videoPrice: { type: Number, default: 0 },
  phonePrice: { type: Number, default: 0 },
  
  consultationCount: { type: Number, default: 0 },
  goodRate: { type: Number, default: 100 },
  averageRating: { type: Number, default: 5 },
  reviewCount: { type: Number, default: 0 },
  
  serviceStatus: { type: String, enum: ['online', 'busy', 'offline'], default: 'offline' },
  isVerified: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  
  status: { type: String, enum: ['active', 'disabled'], default: 'active' }
}, {
  timestamps: true
});

doctorSchema.index({ department: 1 });
doctorSchema.index({ serviceStatus: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
