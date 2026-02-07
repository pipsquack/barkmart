const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Product routes
router.get('/', productController.list);
router.get('/:slug', productController.show);

module.exports = router;
