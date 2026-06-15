const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  consultationNo: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  userAvatar: { type: String },
  
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String },
  doctorAvatar: { type: String },
  department: { type: String },
  title: { type: String },
  
  type: { type: String, enum: ['text', 'video', 'phone'], default: 'text' },
  
  symptoms: { type: String, required: true },
  symptomImages: [{ type: String }],
  medicalHistory: { type: String },
  allergyHistory: { type: String },
  
  status: { type: String, required: true, default: 'pending' },
  
  messages: [{
    sender: { type: String, enum: ['user', 'doctor', 'system'], required: true },
    type: { type: String, enum: ['text', 'image', 'prescription', 'system'], default: 'text' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  diagnosis: { type: String },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  
  price: { type: Number, required: true, default: 0 },
  isFree: { type: Boolean, default: false },
  paid: { type: Boolean, default: false },
  payTime: { type: Date },
  
  rating: { type: Number },
  reviewContent: { type: String },
  reviewTime: { type: Date },
  
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number }
}, {
  timestamps: true
});

consultationSchema.index({ userId: 1, createdAt: -1 });
consultationSchema.index({ doctorId: 1, status: 1 });
consultationSchema.index({ status: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
