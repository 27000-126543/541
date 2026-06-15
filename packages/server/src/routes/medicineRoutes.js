const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getMedicineList);
router.get('/detail/:id', medicineController.getMedicineDetail);
router.get('/categories', medicineController.getCategories);
router.get('/recommend', medicineController.getRecommendMedicines);
router.get('/search', medicineController.searchMedicines);
router.get('/hot-keywords', medicineController.getHotKeywords);

module.exports = router;
