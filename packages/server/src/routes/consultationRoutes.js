const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { authUser } = require('../middlewares/auth');

router.get('/doctors', consultationController.getDoctorList);
router.get('/doctors/:id', consultationController.getDoctorDetail);
router.get('/departments', consultationController.getDepartments);

router.post('/', authUser, consultationController.createConsultation);
router.get('/', authUser, consultationController.getConsultationList);
router.get('/:id', authUser, consultationController.getConsultationDetail);
router.post('/:id/messages', authUser, consultationController.sendMessage);
router.post('/:id/rate', authUser, consultationController.rateConsultation);

module.exports = router;
