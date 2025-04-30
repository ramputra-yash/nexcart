const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path')
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/mongodbConnect');
const session = require('express-session');
connectDB();


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport and session
const passport = require('./config/googleStrategy');
app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);

app.listen(process.env.PORT, () => {
    console.log('Server is running on http://localhost:3000');
})