// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const multer = require('multer');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Routes
router.get('/dashboard', adminController.getDashboard);
router.get('/brands', adminController.getBrands);
router.get('/categories', adminController.getCategories);
router.get('/products', adminController.getProducts);

router.get('/brands/:id', adminController.getBrandById);
router.post('/brands/add', authMiddleware, upload.single('logo'), adminController.addBrand);
router.put('/brands/:id', authMiddleware, upload.single('logo'), adminController.updateBrand);
router.delete('/brands/:id', authMiddleware, adminController.deleteBrand);

router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories/add', authMiddleware, upload.single('image'), adminController.addCategory);
router.put('/categories/:id', authMiddleware, upload.single('image'), adminController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminController.deleteCategory);

router.get('/products/:id', adminController.getProductById);
router.post('/products/add', authMiddleware, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'sketchImages', maxCount: 5 }
]), adminController.addProduct);
router.put('/products/:id', authMiddleware, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'sketchImages', maxCount: 5 }
]), adminController.updateProduct);
router.delete('/products/:id', authMiddleware, adminController.deleteProduct);

module.exports = router;