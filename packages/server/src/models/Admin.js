const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  realName: { type: String, required: true },
  avatar: { type: String },
  phone: { type: String },
  email: { type: String },
  
  role: { type: String, enum: ['super_admin', 'admin', 'pharmacist', 'store_manager'], required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  
  permissions: [{ type: String }],
  
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  lastLoginTime: { type: Date },
  lastLoginIp: { type: String }
}, {
  timestamps: true
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
