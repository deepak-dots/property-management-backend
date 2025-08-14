const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 
const propertyController = require('../controllers/propertyController');

// Define and create uploads directory
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for storing uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', upload.array('images', 10), propertyController.createProperty);
router.put('/:id', upload.array('images', 10), propertyController.updateProperty);
router.post('/:id/duplicate', propertyController.duplicateProperty);
router.delete('/:id', propertyController.deleteProperty);
router.get('/:id/related', propertyController.getRelatedProperties);



module.exports = router;
