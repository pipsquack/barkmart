const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { isAuthenticated } = require('../middleware/auth');

// All checkout routes require authentication
router.use(isAuthenticated);

// Checkout routes
router.get('/', checkoutController.show);
router.post('/process', checkoutController.processOrder);
router.get('/success/:orderNumber', checkoutController.success);

module.exports = router;
