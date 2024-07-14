const express = require('express');
const router = express.Router();
const CardAssignmentController = require('../controllers/CardAssignments');


router.post('/assign', CardAssignmentController.assignCardsToUser); // affecter des cartes sélectionnées à un utilisateur
router.get('/getUserCards', CardAssignmentController.getUserCards); // affecter des cartes sélectionnées à un utilisateur




module.exports = router;
