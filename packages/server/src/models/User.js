const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '' },
  avatar: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
  birthday: { type: Date },
  idCard: { type: String },
  realName: { type: String },
  isRealNameVerified: { type: Boolean, default: false },
  
  memberLevel: { type: String, default: 'normal' },
  memberPoints: { type: Number, default: 0 },
  yearlyConsumption: { type: Number, default: 0 },
  freeConsultationCount: { type: Number, default: 0 },
  
  healthProfile: {
    allergies: [{ type: String }],
    chronicDiseases: [{ type: String }],
    medicalHistory: [{ type: String }],
    bloodType: { type: String, enum: ['A', 'B', 'AB', 'O', 'unknown'], default: 'unknown' }
  },
  
  familyMembers: [{
    name: { type: String, required: true },
    relation: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'] },
    birthday: { type: Date },
    idCard: { type: String },
    allergies: [{ type: String }],
    chronicDiseases: [{ type: String }],
    medicalHistory: [{ type: String }]
  }],
  
  addresses: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    detail: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],
  
  medicalInsurance: {
    cardNumber: { type: String },
    insuredCity: { type: String },
    isBound: { type: Boolean, default: false },
    balance: { type: Number, default: 0 }
  },
  
  status: { type: String, enum: ['active', 'disabled'], default: 'active' }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('memberLevelInfo').get(function() {
  const config = require('../config');
  return config.memberLevels[this.memberLevel] || config.memberLevels.normal;
});

module.exports = mongoose.model('User', userSchema);
