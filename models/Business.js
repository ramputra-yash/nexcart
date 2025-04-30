const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    businessName: String,
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;