const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authUser } = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/profile', authUser, userController.getUserInfo);
router.put('/profile', authUser, userController.updateUserInfo);

router.get('/health-profile', authUser, userController.getUserInfo);
router.put('/health-profile', authUser, userController.updateHealthProfile);

router.get('/family-members', authUser, userController.getFamilyMembers);
router.post('/family-members', authUser, userController.addFamilyMember);
router.put('/family-members/:id', authUser, userController.updateFamilyMember);
router.delete('/family-members/:id', authUser, userController.deleteFamilyMember);

router.get('/addresses', authUser, userController.getAddresses);
router.post('/addresses', authUser, userController.addAddress);
router.put('/addresses/:id', authUser, userController.updateAddress);
router.delete('/addresses/:id', authUser, userController.deleteAddress);

module.exports = router;
