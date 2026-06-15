const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authAdmin } = require('../middlewares/auth');

router.get('/', storeController.getStoreList);
router.get('/nearest', storeController.getNearestStore);
router.get('/:id', storeController.getStoreDetail);
router.get('/:storeId/medicines', storeController.getStoreMedicines);

router.post('/stock-in', authAdmin, storeController.stockIn);
router.get('/stock/records', authAdmin, storeController.getStockRecords);
router.get('/stock/expiry-warning', authAdmin, storeController.getExpiryWarning);
router.get('/stock/warning', authAdmin, storeController.getStockWarning);
router.get('/stock/replenishment', authAdmin, storeController.getReplenishmentSuggestions);

module.exports = router;
