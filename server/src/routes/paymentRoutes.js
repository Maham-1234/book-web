const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.post('/create-intent', () => res.send('this is payment router'));

module.exports = router;
