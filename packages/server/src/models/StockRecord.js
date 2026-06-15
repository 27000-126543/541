const mongoose = require('mongoose');

const stockRecordSchema = new mongoose.Schema({
  type: { type: String, enum: ['inbound', 'outbound', 'adjust', 'stocktake'], required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  medicineName: { type: String },
  
  quantity: { type: Number, required: true },
  beforeStock: { type: Number },
  afterStock: { type: Number },
  
  batchNumber: { type: String },
  productionDate: { type: Date },
  expiryDate: { type: Date },
  
  referenceNo: { type: String },
  reason: { type: String },
  
  operator: { type: String },
  remark: { type: String }
}, {
  timestamps: true
});

stockRecordSchema.index({ storeId: 1, medicineId: 1, createdAt: -1 });
stockRecordSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('StockRecord', stockRecordSchema);
