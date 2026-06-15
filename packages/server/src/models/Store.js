const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  
  province: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  
  longitude: { type: Number },
  latitude: { type: Number },
  
  phone: { type: String, required: true },
  businessHours: {
    weekdays: { open: String, close: String },
    weekends: { open: String, close: String }
  },
  
  manager: { type: String },
  managerPhone: { type: String },
  
  businessLicense: { type: String },
  pharmacyLicense: { type: String },
  gspCertificate: { type: String },
  
  type: { type: String, enum: ['flagship', 'standard', 'community'], default: 'standard' },
  level: { type: Number, default: 1 },
  
  isOpen: { type: Boolean, default: true },
  supportsDelivery: { type: Boolean, default: true },
  supportsPickup: { type: Boolean, default: true },
  deliveryRadius: { type: Number, default: 5 },
  deliveryFee: { type: Number, default: 5 },
  freeDeliveryAmount: { type: Number, default: 99 },
  
  images: [{ type: String }],
  description: { type: String },
  
  status: { type: String, enum: ['active', 'closed', 'pending'], default: 'active' }
}, {
  timestamps: true
});

storeSchema.index({ city: 1 });
storeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', storeSchema);
