const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notifs');

router.get('/getAllNotificationsForUser/:userId', notifController.getAllNotificationsForUser);

module.exports = router;
