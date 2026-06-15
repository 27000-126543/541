const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authAdmin } = require('../middlewares/auth');

router.get('/dashboard', authAdmin, statsController.getDashboardStats);
router.get('/sales-trend', authAdmin, statsController.getSalesTrend);
router.get('/category-sales', authAdmin, statsController.getCategorySales);
router.get('/top-medicines', authAdmin, statsController.getTopMedicines);
router.get('/member-stats', authAdmin, statsController.getMemberStats);
router.get('/export/monthly', authAdmin, statsController.exportMonthlyReport);
router.get('/prediction', authAdmin, statsController.getPrediction);
router.get('/epidemic-trend', statsController.getEpidemicTrend);

module.exports = router;
