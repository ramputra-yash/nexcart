const User = require('../models/User');

module.exports.isLoggedIn = async (req, res, next) => {
    const user = await User.findOne({_id: req.cookies.user_id});
    if(!user){
        return res.redirect('/');
    }
    req.user = user;
    return next();
}

