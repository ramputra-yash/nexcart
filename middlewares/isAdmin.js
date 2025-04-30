const Business = require('../models/Business');

module.exports.isAdmin = async (req, res, next) => {
    if (!req.cookies.business_id) {
        return res.redirect('/admin/login');
    }
    let business = await Business.findOne({ _id: req.cookies.business_id });
    if (!business) {
        return res.redirect('/admin/login');
    }
    if (business.createdBy.toString() !== req.cookies.user_id) {
        return res.redirect('/admin/login');
    }
    next();
}

