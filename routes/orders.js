const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

// All order routes require authentication
router.use(isAuthenticated);

// Order routes
router.get('/', orderController.list);
router.get('/:id', orderController.show);

module.exports = router;
