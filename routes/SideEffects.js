const express = require('express');
const router = express.Router();
const sideEffectsController = require('../controllers/SideEffects');
const authMiddleware = require('../middlewares/auth');
const verifyIdMiddleware = require('../middlewares/verifysideEffectId');

// Middleware to verify side effect ID
router.param('sideEffectId', verifyIdMiddleware);

// Routes for side effects
router.post('/save', sideEffectsController.saveSideEffects); // Save side effects
router.put('/:sideEffectId', authMiddleware.isDoctor, sideEffectsController.markSideEffectAsDone); // Mark side effect as done

// Routes accessible only to doctors
router.get('/getAllHistory/:doctorId', authMiddleware.isDoctor, sideEffectsController.getAllSideEffectsHistory); // Get all side effects history
router.get('/getAll/:doctorId', authMiddleware.isDoctor, sideEffectsController.getAllSideEffects); // Get all pending side effects

// Routes for doctor-patient association
router.post('/associateDoctorWithPatient', sideEffectsController.associateDoctorWithPatient); // Associate doctor with patient


module.exports = router;
