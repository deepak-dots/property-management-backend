// routes/property.js
const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");

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

// -------------------- NEW ROUTE: Geocode Address --------------------
router.get("/geocode", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: "Address is required" });

    const coords = await propertyController.geocodeAddress(address);
    if (!coords) return res.status(404).json({ error: "Could not geocode address" });

    res.json({ coordinates: coords }); // [lng, lat]
  } catch (err) {
    console.error("Geocode error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// compare route
router.get("/compare-properties", propertyController.compare);

// NEW: nearby (place BEFORE '/:id')
router.post("/nearby", propertyController.getNearbyProperties);

// get all / get by ID
router.get("/", propertyController.getProperties);
router.get("/:id", propertyController.getPropertyById);

// create / update with file upload
router.post("/", upload.array("images", 10), propertyController.createProperty);
router.put("/:id", upload.array("images", 10), propertyController.updateProperty);

// duplicate / delete / related
router.post("/:id/duplicate", propertyController.duplicateProperty || ((req, res) => res.status(501).json({ message: "Not implemented" })));
router.delete("/:id", propertyController.deleteProperty || ((req, res) => res.status(501).json({ message: "Not implemented" })));
router.get("/:id/related", propertyController.getRelatedProperties || ((req, res) => res.status(501).json({ message: "Not implemented" })));

module.exports = router;
