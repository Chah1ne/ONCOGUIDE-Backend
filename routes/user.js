const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.put('/updateRefCh/:userId', userController.updateUserRefCh);
router.get('/getNomPrenomPatient/:userId', userController.getPatientNameAndSurname);
router.put('/:userId/password', userController.updateUserPassword);
router.put('/addIdManuallyWithBirthDate/:userId', userController.addIdManuallyWithBirthDate);
router.post('/email/sendVerificationCode', userController.sendVerificationCode);
router.post('/email/changeEmail', userController.changeEmail);
router.post('/password/sendVerificationCode', userController.sendPasswordResetCode);
router.post('/password/changePassword', userController.resetPassword);


module.exports = router;
