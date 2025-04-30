const express = require('express');
const router = express.Router();
const { createAdmin, loginAdmin, dashboardAdmin, createAdminPost, loginAdminPost, createProduct, updateProduct, deleteProduct } = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/isAdmin');
const upload = require('../config/multer');
const Business = require('../models/Business');
router.get('/create', createAdmin);
router.post('/create', createAdminPost);

router.get('/login', loginAdmin);
router.post('/login', loginAdminPost);

router.get('/logout', (req, res) => {
    res.clearCookie('business_id');
    res.redirect('/admin/login');
});

router.get('/dashboard', isAdmin, dashboardAdmin);

router.post('/createproduct', isAdmin, upload.single('product_image'), createProduct);

router.post('/updateproduct/:id', isAdmin, updateProduct);

router.get('/deleteproduct/:id', isAdmin, deleteProduct);

router.post('/updateprofile', isAdmin, async (req, res) => {
    let { businessname } = req.body;
    let { business_id } = req.cookies;
    let business = await Business.findOneAndUpdate({ _id: business_id }, { businessName: businessname }, { new: true });
    res.redirect('/admin/dashboard');
});

module.exports = router;
