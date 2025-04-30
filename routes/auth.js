const express = require('express');
const router = express.Router();
const passport = require('../config/googleStrategy');
const jwt = require('jsonwebtoken');

// Google Auth Route
router.get('/google', passport.authenticate('google',
    {
       scope: ['profile', 'email'], 
       prompt: 'select_account' // Force user to select an account
   }));

// Google Auth Callback Route
router.get('/google/callback',
   passport.authenticate('google', { failureRedirect: '/' }),
   (req, res) => {
       if (!req.user) return res.redirect('/');

       res.cookie('user_id', req.user._id, {
           maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration (7 days)
       });

       res.redirect('/'); // Redirect to chat page after login
   }
);

// Logout
router.get('/logout', (req, res) => {
   req.logout(() => {
       res.cookie('user_id', "", { maxAge: 0 });
       res.redirect('/');
   });
});

module.exports = router;