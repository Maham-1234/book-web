const express = require('express');
const router = express.Router();
const {
  getProductTransactions,
  createManualTransaction,
} = require('../controllers/inventoryController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.use(isAuthenticated, isAdmin);

router.get('/product/:productId', getProductTransactions);

router.post('/', createManualTransaction);

module.exports = router;
