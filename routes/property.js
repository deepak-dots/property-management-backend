const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");

// -------------------- OLD LOCAL UPLOAD CODE (KEEP AS COMMENT) --------------------
/*
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define and create uploads directory
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
*/

// -------------------- NEW CLOUDINARY UPLOAD --------------------
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "property-images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// -------------------- ROUTES --------------------
router.get("/", propertyController.getProperties);
router.get("/:id", propertyController.getPropertyById);

// multiple image upload
router.post("/", upload.array("images", 10), propertyController.createProperty);
router.put("/:id", upload.array("images", 10), propertyController.updateProperty);

// other routes
router.post("/:id/duplicate", propertyController.duplicateProperty || ((req, res) => res.status(501).json({ message: "Not implemented" })));
router.delete("/:id", propertyController.deleteProperty || ((req, res) => res.status(501).json({ message: "Not implemented" })));
router.get("/:id/related", propertyController.getRelatedProperties || ((req, res) => res.status(501).json({ message: "Not implemented" })));

module.exports = router;
