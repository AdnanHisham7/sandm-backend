const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/brands/:brandName/categories', apiController.getCategoriesByBrand);
router.get('/brands/:brandName/products', apiController.getProductsByBrand);
router.get('/products/:productId', apiController.getProduct);

module.exports = router;