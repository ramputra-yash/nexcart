const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const axios = require('axios');

module.exports.index = async (req, res) => {
    const user = await User.findOne({_id: req.cookies.user_id});
    const products = await Product.find().sort({ createdAt: -1 }).limit(4).populate('businessId'); 
    if(user) {
        let business = await Business.findOne({_id: user.businessId});
        let isBusiness = req.cookies.business_id;
        let cart = await Cart.findOne({ userId: req.cookies.user_id });
        if(!cart) {
            cart = new Cart({ userId: req.cookies.user_id, products: [] });
            await cart.save();
        }
        res.render('index', { user, business, isBusiness, products, cart });
    } else {
        res.render('index', { user: null, business: null, isBusiness: null, products, cart: null });
    }
}
module.exports.cart = async (req, res) => {
    const user = await User.findOne({_id: req.cookies.user_id});
    let business = await Business.findOne({_id: user.businessId});
    let isBusiness = req.cookies.business_id;
    const cart = await Cart.findOne({ userId: req.cookies.user_id }).populate('products.productId');
    let total_price = 0;
    cart.products.forEach(product => {
        total_price += product.productId.product_new_price * product.quantity;
    });
    res.render('cart', { user, business, isBusiness, cart, total_price });
}
module.exports.addToCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.cookies.user_id;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User not logged in or user_id cookie missing' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: [{ productId, quantity: 1 } ] }, { new: true });
        } else {
            if (!cart.products.some(product => product.productId.equals(productId))) {
                cart.products.push({ productId, quantity: 1 });
            }
        }

        await cart.save();
        res.json({ success: true, message: 'Product added to cart successfully' });
    } catch (err) {
        console.error('Error in addToCart:', err); // ✅ Yeh print hoga terminal me
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
module.exports.updateQuantity = async (req, res) => {
    const { productId, action } = req.body;
    const userId = req.cookies.user_id;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
    );

    if (productIndex === -1) return res.status(404).json({ message: 'Product not in cart' });

    if (action === 'increase') {
        cart.products[productIndex].quantity += 1;
    } else if (action === 'decrease') {
        cart.products[productIndex].quantity -= 1;

        // ✅ Remove if quantity is now 0 or less
        if (cart.products[productIndex].quantity <= 0) {
            cart.products.splice(productIndex, 1);
        }
    }

    await cart.save();
    res.json({ success: true });
};

module.exports.products = async (req, res) => {
    const user = await User.findOne({_id: req.cookies.user_id});
    let business = await Business.findOne({_id: user.businessId});
    const products = await Product.find({ category: req.params.category }).populate('businessId'); 
    let isBusiness = req.cookies.business_id;
    const cart = await Cart.findOne({ userId: req.cookies.user_id });
    res.render('products', { user, business, isBusiness, products, cart });
}
module.exports.product = async (req, res) => {
    const product = await Product.findOne({_id: req.params.product_id}).populate('businessId');
    const products = await Product.find({ _id: { $ne: req.params.product_id }, category: product.category }).populate('businessId');
    const user = await User.findOne({_id: req.cookies.user_id});
    let business = await Business.findOne({_id: user.businessId});
    let isBusiness = req.cookies.business_id;
    const cart = await Cart.findOne({ userId: req.cookies.user_id });
    res.render('product', { user, business, isBusiness, product, products, cart });
}
module.exports.search = async (req, res) => {
    const user = await User.findOne({_id: req.cookies.user_id});
    let business = await Business.findOne({_id: user.businessId});
    let isBusiness = req.cookies.business_id;
    const cart = await Cart.findOne({ userId: req.cookies.user_id });
    res.render('search', { user, business, isBusiness, cart });
}
module.exports.myaccount = async (req, res) => {
    const user = await User.findOne({_id: req.cookies.user_id});
    let business = await Business.findOne({_id: user.businessId});
    let isBusiness = req.cookies.business_id;
    const payments = await Payment.find({ customerEmail: user.email }).sort({ createdAt: -1 }).populate('products.product');
    let cart = await Cart.findOne({ userId: req.cookies.user_id });
    if(!cart) {
        cart = new Cart({ userId: req.cookies.user_id, products: [] });
        await cart.save();
    }
    res.render('userAccount', { user, business, payments, isBusiness, cart });
}
module.exports.createOrder = async (req, res) => {
    const { phone, amount } = req.body;
    const user = await User.findOne({_id: req.cookies.user_id});
    const business = await Business.findOne({_id: user.businessId});
    const cart = await Cart.findOne({ userId: req.cookies.user_id });

    const orderId = "ORDER" + Date.now();

    const payload = {
       order_id: orderId,
       order_amount: parseFloat(amount),
       order_currency: "INR",
       customer_details: {
         customer_id: phone.replace(/\D/g, ""),  // ✅ sanitize to only digits
         customer_email: user.email,
         customer_phone: phone,
         customer_name: user.name
       },
       order_meta: {
        return_url: `https://nexcart-ybk1.onrender.com/payment/success?order_id=${orderId}`
      }
    };

    try{
        const response = await axios.post(
            `https://sandbox.cashfree.com/pg/orders`,
            payload,
            {
              headers: {
                "x-client-id": process.env.CASHFREE_APP_ID,
                "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                "x-api-version": "2022-01-01",
                "Content-Type": "application/json"
              }
            }
          );
      
          const order = response.data;

            // ✅ Validate and structure cart.products correctly
            if (!cart.products || !Array.isArray(cart.products) || cart.products.length === 0) {
                return res.status(400).send("Cart is empty or invalid.");
            }

            const structuredProducts = cart.products.map((item) => ({
                product: item.productId,  // ✅ Must be ObjectId
                quantity: item.quantity
            }));

          const payment = new Payment({
            orderId: orderId,
            orderAmount: parseFloat(amount),
            currency: "INR",
          
            customerId: phone.replace(/\D/g, ""),
            customerName: user.name,
            customerEmail: user.email,
            customerPhone: phone,
          
            products: structuredProducts,
            paymentLink: order.payment_link,
            status: 'PENDING',
        });
        await payment.save();
        res.redirect(order.payment_link);
    } catch (err) {
        console.log("Order creation failed", err.message);
        res.send("Order creation failed");
    }
}

module.exports.success = async (req, res) => {
    try {
        const { order_id } = req.query;
        const order = await Payment.findOne({ orderId: order_id });
        const user = await User.findOne({_id: req.cookies.user_id});
        const cart = await Cart.findOneAndUpdate({ userId: req.cookies.user_id }, { $set: { products: [] } });
        res.render('success', { order, user, cart });
        order.status = 'PAID';
        await order.save();
    } catch (err) {
        console.log("Error in success callback", err.message);
        res.status(500).send("Internal Server Error");
    }
}
module.exports.failed = async (req, res) => {
    const { order_id } = req.query;
    const order = await Payment.findOne({ orderId: order_id });
    res.render('failed', { order });
}