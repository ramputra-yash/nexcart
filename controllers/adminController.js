const Business = require('../models/Business');
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcrypt');

module.exports.createAdmin = (req, res) => {
    res.render('adminAccount');
}
module.exports.createAdminPost = async (req, res) => {
    let { name, email, password, businessName } = req.body;
    let business = await Business.findOne({ email });
    if (business) {
        return res.render('adminAccount', { error: 'Business already exists' });
    }
    password = await bcrypt.hash(password, 12);
    business = await Business.create({ name, email, password, businessName, createdBy: req.cookies.user_id });
    let user = await User.findOne({ _id: req.cookies.user_id });
    user.businessId = business._id;
    await user.save();
    res.cookie('business_id', business._id);
    res.redirect('/admin/dashboard');
}

module.exports.loginAdmin = (req, res) => {
    res.render('adminLogin');
}

module.exports.loginAdminPost = async (req, res) => {
    let { email, password } = req.body;
    let business = await Business.findOne({ email });
    if (!business) {
        return res.render('adminLogin', { error: 'Business not found' });
    }
    let isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
        return res.render('adminLogin', { error: 'Invalid password' });
    }
    res.cookie('business_id', business._id);
    res.redirect('/admin/dashboard');
}

module.exports.dashboardAdmin = async (req, res) => {
    let business = await Business.findOne({ _id: req.cookies.business_id }).populate('products');
    let user = await User.findOne({ _id: business.createdBy }).populate('businessId');
    res.render('adminDashboard', { business, user });
}

module.exports.createProduct = async (req, res) => {
    let { product_name, product_description, product_old_price, product_new_price, product_image, category } = req.body;
    let business = await Business.findOne({ _id: req.cookies.business_id });
    let user = await User.findOne({ _id: business.createdBy });
    let product = await Product.create({ product_name, product_description, product_old_price, product_new_price, product_image: req.file.path, category, businessId: business._id });
    
    business.products.push(product._id);
    await business.save();

    res.redirect('/admin/dashboard');
}

module.exports.updateProduct = async (req, res) => {
    let { product_name, product_description, product_old_price, product_new_price, category } = req.body;
    let product = await Product.findOneAndUpdate({ _id: req.params.id }, { product_name, product_description, product_old_price, product_new_price, category }, { new: true });
    res.redirect('/admin/dashboard');
}

module.exports.deleteProduct = async (req, res) => {
    let product = await Product.findOneAndDelete({ _id: req.params.id });
    let business = await Business.findOne({ _id: req.cookies.business_id });
    business.products = business.products.filter(product => product._id.toString() !== req.params.id);
    await business.save();
    res.redirect('/admin/dashboard');
}