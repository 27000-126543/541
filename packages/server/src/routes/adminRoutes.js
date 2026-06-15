const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authAdmin } = require('../middlewares/auth');

router.post('/login', adminController.login);
router.get('/profile', authAdmin, adminController.getAdminInfo);
router.put('/password', authAdmin, adminController.updatePassword);

router.get('/list', authAdmin, adminController.getAdminList);
router.post('/', authAdmin, adminController.createAdmin);
router.put('/:id', authAdmin, adminController.updateAdmin);
router.delete('/:id', authAdmin, adminController.deleteAdmin);

module.exports = router;
