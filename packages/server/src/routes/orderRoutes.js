const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authUser } = require('../middlewares/auth');

router.post('/', authUser, orderController.createOrder);
router.get('/', authUser, orderController.getOrderList);
router.get('/:id', authUser, orderController.getOrderDetail);
router.post('/:id/pay', authUser, orderController.payOrder);
router.post('/:id/cancel', authUser, orderController.cancelOrder);
router.post('/:id/confirm', authUser, orderController.confirmReceive);

module.exports = router;
