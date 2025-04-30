const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_name: String,
    product_description: String,
    product_old_price: Number,
    product_new_price: Number,
    product_image: String,
    category: String,
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;