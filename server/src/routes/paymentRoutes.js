const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/create-payment-intent', isAuthenticated, createPaymentIntent);

module.exports = router;
