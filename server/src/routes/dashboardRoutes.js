const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated, isAdmin);

router.get('/sales-over-time', dashboardController.getSalesOverTime);

router.get('/top-selling-products', dashboardController.getTopSellingProducts);

module.exports = router;
