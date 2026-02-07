const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const upload = require('../config/multer');

// All admin routes require authentication and admin role
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Product management
router.get('/products', adminController.listProducts);
router.get('/products/create', adminController.showCreateProduct);
router.post('/products', upload.single('image'), adminController.createProduct);
router.get('/products/:id/edit', adminController.showEditProduct);
router.post('/products/:id', upload.single('image'), adminController.updateProduct);
router.post('/products/:id/delete', adminController.deleteProduct);

// Order management
router.get('/orders', adminController.listOrders);
router.get('/orders/:id', adminController.showOrder);
router.post('/orders/:id/status', adminController.updateOrderStatus);

// User management
router.get('/users', adminController.listUsers);

module.exports = router;
