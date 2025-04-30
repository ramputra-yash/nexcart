const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  orderAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  customerId: { type: String, required: true },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String, required: true },

  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],

  paymentLink: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  paymentMode: { type: String },
  txTime: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

