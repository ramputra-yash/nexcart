const express = require('express');
const router = express.Router();
const { index } = require('../controllers/indexController');
const { cart } = require('../controllers/indexController');
const { products } = require('../controllers/indexController');
const { product } = require('../controllers/indexController');
const { search } = require('../controllers/indexController');
const { myaccount } = require('../controllers/indexController');
const { isLoggedIn } = require('../middlewares/isLoggedIn');
const { addToCart } = require('../controllers/indexController');
const { updateQuantity } = require('../controllers/indexController');
const { createOrder } = require('../controllers/indexController');
const { success } = require('../controllers/indexController');
const { failed } = require('../controllers/indexController');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

router.get('/', index);
router.get('/allproducts', async (req, res) => {
    const products = await Product.find();
    res.json(products);
})
router.get('/cart', isLoggedIn, cart);
router.post('/cart/addtocart', isLoggedIn, addToCart);
router.get('/cart/count', async (req, res) => {
    const cart = await Cart.findOne({ userId: req.cookies.user_id });
    res.json({ count: cart.products.length });
})
router.post('/cart/update', isLoggedIn, updateQuantity);
router.get('/products/:category', isLoggedIn, products);
router.get('/product/:product_id', isLoggedIn, product);
router.get('/search', isLoggedIn, search);
router.get('/myaccount', isLoggedIn, myaccount);
router.post('/create-order', isLoggedIn, createOrder);
router.get('/payment/success', success);
router.get('/payment/failed', failed);

module.exports = router;
