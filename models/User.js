const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    profileImage: {
        type: String,
        default: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
