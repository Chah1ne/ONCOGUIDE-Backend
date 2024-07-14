const express = require('express');
const router = express.Router();
const curesController = require('../controllers/cures');

router.get('/getcuresbypatient/:patientId', curesController.getCuresByPatientId);
router.get('/getcuredatesbypatient/:patientId', curesController.getCureDatesByPatientId);
router.get('/getCureStateByPatientId/:patientId/:state', curesController.getCureStateByPatientId);
router.get('/getTreatmentProgress/:userId', curesController.getTreatmentProgress);
// router.get('/getTreatmentProgress/:patientId', curesController.getTreatmentProgress); // Si vous souhaitez utiliser "patientId" plutôt que "userId"

module.exports = router;
