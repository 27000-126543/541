const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authUser, authAdmin } = require('../middlewares/auth');

router.post('/upload', authUser, prescriptionController.uploadPrescription);
router.get('/', authUser, prescriptionController.getPrescriptionList);
router.get('/:id', authUser, prescriptionController.getPrescriptionDetail);
router.post('/check-interactions', authUser, prescriptionController.checkDrugInteractions);

router.get('/admin/list', authAdmin, prescriptionController.getAdminPrescriptionList);
router.post('/admin/:id/review', authAdmin, prescriptionController.reviewPrescription);

module.exports = router;
