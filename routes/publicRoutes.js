const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const apiController = require('../controllers/apiController');

router.get('/', publicController.getIndex);
// router.get('/:brand', publicController.getBrandPage);
// router.get('/:brand/category/:categoryId', publicController.getCategoryPage);
// router.get('/:brand/product/:productId', publicController.getProductPage);
// router.get('/:brand/products', publicController.getProductsPage);

module.exports = router;