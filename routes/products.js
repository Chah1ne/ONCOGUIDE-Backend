const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');

router.get('/getproductsbypatient/:userId', productsController.getProductsByPatientId);
router.get('/getnextsession/:userId', productsController.getNextSessionByPatientId);

module.exports = router;
