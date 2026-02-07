const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/auth');

// Login routes
router.get('/login', isNotAuthenticated, authController.showLogin);
router.post('/login', isNotAuthenticated, authController.login);

// Register routes
router.get('/register', isNotAuthenticated, authController.showRegister);
router.post('/register', isNotAuthenticated, authController.register);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;
