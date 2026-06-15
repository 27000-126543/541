const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authAdmin } = require('../middlewares/auth');

router.get('/', promotionController.getPromotionList);
router.get('/:id', promotionController.getPromotionDetail);
router.get('/flash-sale/list', promotionController.getFlashSaleList);
router.get('/group-buy/list', promotionController.getGroupBuyList);
router.post('/calculate-discount', promotionController.calculateBestDiscount);

router.post('/', authAdmin, promotionController.createPromotion);
router.put('/:id', authAdmin, promotionController.updatePromotion);
router.delete('/:id', authAdmin, promotionController.deletePromotion);

module.exports = router;
