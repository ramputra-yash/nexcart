// multerConfig.js
const multer = require('multer');
const path = require('path');

// Set Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');  // Folder where files will be stored
  },
  filename: function (req, file, cb) {
    // Unique file name: originalname + current date
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
});

module.exports = upload;
