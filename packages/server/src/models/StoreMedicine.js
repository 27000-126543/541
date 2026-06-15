const mongoose = require('mongoose');

const storeMedicineSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  
  stock: { type: Number, default: 0 },
  lockedStock: { type: Number, default: 0 },
  availableStock: { type: Number, default: 0 },
  
  batchInfo: [{
    batchNumber: { type: String, required: true },
    productionDate: { type: Date },
    expiryDate: { type: Date },
    quantity: { type: Number, required: true },
    inStockDate: { type: Date, default: Date.now }
  }],
  
  price: { type: Number },
  isActive: { type: Boolean, default: true },
  
  lastRestockTime: { type: Date },
  lastStocktakeTime: { type: Date }
}, {
  timestamps: true
});

storeMedicineSchema.index({ storeId: 1, medicineId: 1 }, { unique: true });
storeMedicineSchema.index({ storeId: 1, availableStock: 1 });

module.exports = mongoose.model('StoreMedicine', storeMedicineSchema);
