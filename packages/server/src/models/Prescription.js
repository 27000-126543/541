const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionNo: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number },
  patientGender: { type: String, enum: ['male', 'female'] },
  
  type: { type: String, enum: ['online', 'upload'], required: true },
  
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctorName: { type: String },
  
  uploadedImages: [{ type: String }],
  
  diagnosis: { type: String },
  symptoms: { type: String },
  
  medicines: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName: { type: String, required: true },
    specification: { type: String },
    dosage: { type: String },
    frequency: { type: String },
    quantity: { type: Number, required: true },
    days: { type: Number }
  }],
  
  drugInteractionCheck: {
    passed: { type: Boolean, default: false },
    warnings: [{ type: String }],
    checkedAt: { type: Date }
  },
  
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pharmacistName: { type: String },
  reviewRemark: { type: String },
  
  status: { type: String, required: true, default: 'pending' },
  
  expireDate: { type: Date },
  usedCount: { type: Number, default: 0 },
  maxUseCount: { type: Number, default: 1 },
  
  reviewedAt: { type: Date },
  rejectedReason: { type: String }
}, {
  timestamps: true
});

prescriptionSchema.index({ userId: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ doctorId: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
