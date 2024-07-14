const express = require('express');
const router = express.Router();
const educationController = require('../controllers/education');

// Routes pour l'éducation
router.post('/create', educationController.createEducation); // Créer une nouvelle expérience éducative
router.get('/sender/:senderId', educationController.getAllEducationsBySender); // Récupérer toutes les expériences éducatives d'un utilisateur spécifique (médecin)
router.put('/update/:id', educationController.updateEducation); // Mettre à jour une expérience éducative
router.delete('/delete/:id', educationController.deleteEducation); // Supprimer une expérience éducative
//router.post('/assign', educationController.assignCardsToUser); // affecter des cartes sélectionnées à un utilisateur


module.exports = router;
