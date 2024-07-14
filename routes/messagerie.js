const express = require('express');
const router = express.Router();
const messagerieController = require('../controllers/messagerie');

// Routes pour la messagerie
router.post('/create', messagerieController.createMessage); // Créer un nouveau message
router.get('/:userId1/:userId2', messagerieController.getMessagesBetweenUsers); // Récupérer les messages entre deux utilisateurs
router.get('/:userId', messagerieController.getUsersWithMessages); // Récupérer les messages entre deux utilisateurs
router.post('/add-contact', messagerieController.addContact); // Ajouter un contact
router.get('/last-message/:userId1/:userId2',messagerieController.getLastMessageBetweenUsers);
module.exports = router;
