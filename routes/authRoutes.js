// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/admin/login', authController.getLogin);
router.post('/admin/login', authController.postLogin);
router.get('/admin/logout', authController.logout);
router.get('/admin/forgot-password', authController.getForgotPassword);
router.post('/admin/forgot-password', authController.postForgotPassword);
router.get('/admin/reset-password/:token', authController.getResetPassword);
router.post('/admin/reset-password/:token', authController.postResetPassword);

module.exports = router;