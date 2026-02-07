const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated } = require('../middleware/auth');

// All cart routes require authentication
router.use(isAuthenticated);

// Cart routes
router.get('/', cartController.show);
router.post('/add', cartController.addItem);
router.post('/update/:id', cartController.updateItem);
router.post('/remove/:id', cartController.removeItem);
router.post('/clear', cartController.clearCart);

module.exports = router;
