// controllers/propertyController.js
require('dotenv').config();
const axios = require('axios');
const Property = require('../models/Property');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Helper: geocode address using Google Geocoding API (returns [lng, lat])
async function geocodeAddress(address) {
  if (!address || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return null;


  try {
    const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: { address, key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }
    });
    if (res.data && res.data.results && res.data.results.length) {
      const loc = res.data.results[0].geometry.location;
      return [loc.lng, loc.lat];
    }
  } catch (err) {
    console.warn("Geocode failed:", err.message);
  }
  return null;
}

// -------------------- GET ALL PROPERTIES --------------------
exports.getProperties = async (req, res) => {
  try {
    const {
      search, city, bhkType, furnishing, status,
      priceMin, priceMax, propertyType, transactionType,
      lat, lng, radius,
      limit: limitQuery, page: pageQuery
    } = req.query;

    const limit = parseInt(limitQuery) || 9;
    const page = parseInt(pageQuery) || 1;

    const filter = {};

    // Existing filters
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (city) filter.city = city;
    if (propertyType) filter.propertyType = propertyType;
    if (bhkType) filter.bhkType = bhkType;
    if (furnishing) filter.furnishing = furnishing;
    if (status) filter.status = status;
    if (transactionType) filter.transactionType = transactionType;
    if (priceMin) filter.price = { ...filter.price, $gte: Number(priceMin) };
    if (priceMax) filter.price = { ...filter.price, $lte: Number(priceMax) };

    // Radius filter
    if (lat && lng && radius) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      const radiusInMiles = Number(radius);
      const radiusInRadians = radiusInMiles / 3963.2;
      filter.location = {
        $geoWithin: { $centerSphere: [[longitude, latitude], radiusInRadians] }
      };
    }

    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// -------------------- GET BY ID --------------------
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.status(200).json(property);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// -------------------- CREATE PROPERTY --------------------
exports.createProperty = async (req, res) => {



  try {
    const {
      title, bhkType, furnishing, bedrooms, bathrooms, superBuiltupArea,
      developer, project, propertyType, transactionType, status,
      price, reraId, address, description, city, activeStatus,
      lat, lng
    } = req.body;

      // Normalize amenities (always array of strings)
      let { amenities } = req.body;
      if (!Array.isArray(amenities)) {
        if (typeof amenities === 'string') {
          if (amenities.startsWith('[') && amenities.endsWith(']')) {
            try {
              amenities = JSON.parse(amenities);
            } catch {
              amenities = [amenities];
            }
          } else {
            amenities = amenities.split(',').map(a => a.trim());
          }
        } else if (amenities == null) {
          amenities = [];
        } else {
          amenities = [String(amenities)];
        }
      }

    const images = req.files ? req.files.map(file => file.path) : [];

    const propertyData = {
      title,
      bhkType,
      furnishing,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      superBuiltupArea,
      developer,
      project,
      propertyType,
      transactionType,
      status,
      price: price ? Number(price) : undefined,
      reraId,
      address,
      description,
      city,
      activeStatus: activeStatus || 'Draft',
      images,
      amenities,
    };

    // ---- Handle Location ----
    let coordinates;

    if (lat !== undefined && lng !== undefined) {
      coordinates = [Number(lng), Number(lat)]; // lng, lat
    } else if (!lat && !lng && address) { // ✅ fallback geocode
      const geo = await geocodeAddress(address);
      if (geo && geo.length === 2) coordinates = geo;
    }

    if (coordinates) {
      propertyData.location = { type: "Point", coordinates };
    }

    const newProperty = new Property(propertyData);
    const savedProperty = await newProperty.save();

    res.status(201).json({ message: 'Property created!', property: savedProperty });
  } catch (err) {
    console.error("Create property error:", err);
    res.status(500).json({ message: 'Failed to create property', error: err.message });
  }
};

// -------------------- UPDATE PROPERTY --------------------
exports.updateProperty = async (req, res) => {


  try {
    const {
      title, bhkType, furnishing, bedrooms, bathrooms, superBuiltupArea,
      developer, project, transactionType, propertyType, status, price, reraId, address,
      description, city, activeStatus, existingImages, removedImages, lat, lng
    } = req.body;

    let { amenities } = req.body;
    if (!Array.isArray(amenities)) {
      if (typeof amenities === 'string') {
        if (amenities.startsWith('[') && amenities.endsWith(']')) {
          try {
            amenities = JSON.parse(amenities);
          } catch {
            amenities = [amenities];
          }
        } else {
          amenities = amenities.split(',').map(a => a.trim());
        }
      } else if (amenities == null) {
        amenities = [];
      } else {
        amenities = [String(amenities)];
      }
    }

    const existingImgs = existingImages
      ? (typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages)
      : [];
    const removedImgs = removedImages
      ? (typeof removedImages === 'string' ? JSON.parse(removedImages) : removedImages)
      : [];

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Delete removed images from Cloudinary
    for (let img of removedImgs) {
      try {
        const last = img.split('/').pop();
        const publicId = last.includes('.') ? last.substring(0, last.lastIndexOf('.')) : last;
        await cloudinary.uploader.destroy("property-images/" + publicId);
      } catch (e) {
        console.log("Cloudinary delete failed:", e.message);
      }
    }

    let updatedImages = property.images.filter(img => !removedImgs.includes(img));
    if (req.files && req.files.length > 0) {
      updatedImages = updatedImages.concat(req.files.map(f => f.path));
    }

    const updatedData = {
      title,
      bhkType,
      furnishing,
      bedrooms: bedrooms !== undefined ? Number(bedrooms) : undefined,
      bathrooms: bathrooms !== undefined ? Number(bathrooms) : undefined,
      superBuiltupArea,
      developer,
      project,
      propertyType,
      transactionType,
      status,
      price: price !== undefined ? Number(price) : undefined,
      reraId,
      address,
      description,
      city,
      activeStatus,
      images: updatedImages,
      amenities,
    };

    // ---- Handle Location ----
    let coordinates;
    if (lat !== undefined && lng !== undefined) {
      coordinates = [Number(lng), Number(lat)];
    } else if (!lat && !lng && address) { // ✅ fallback geocode
      const geo = await geocodeAddress(address);
      if (geo && geo.length === 2) coordinates = geo;
    }

    if (coordinates) {
      updatedData.location = { type: "Point", coordinates };
    }

    // Remove undefined fields
    Object.keys(updatedData).forEach(key => updatedData[key] === undefined && delete updatedData[key]);

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updatedProperty);
  } catch (err) {
    console.error("Update property error:", err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// -------------------- DUPLICATE PROPERTY --------------------
exports.duplicateProperty = async (req, res) => {
  try {
    const original = await Property.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Property not found' });

    const duplicateData = {
      ...original.toObject(),
      _id: undefined,
      title: (original.title || 'Property') + ' (Copy)',
      createdAt: new Date(),
      updatedAt: new Date(),
      location: original.location ? { ...original.location } : undefined,
    };

    const duplicate = new Property(duplicateData);
    await duplicate.save();

    res.status(201).json(duplicate);
  } catch (err) {
    console.error("Duplicate property error:", err);
    res.status(500).json({ message: 'Failed to duplicate property' });
  }
};

// -------------------- DELETE PROPERTY --------------------
exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Property not found' });

    if (deleted.images && deleted.images.length) {
      for (let img of deleted.images) {
        try {
          const urlParts = img.split('/');
          const last = urlParts[urlParts.length - 1];
          const publicId = last.includes('.') ? last.substring(0, last.lastIndexOf('.')) : last;
          await cloudinary.uploader.destroy("property-images/" + publicId);
        } catch (e) {
          console.log("Cloudinary delete failed:", e.message);
        }
      }
    }

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

// -------------------- RELATED PROPERTIES --------------------
exports.getRelatedProperties = async (req, res) => {
  try {
    const currentProperty = await Property.findById(req.params.id);
    if (!currentProperty) return res.status(404).json({ message: 'Property not found' });

    const related = await Property.find({
      _id: { $ne: currentProperty._id },
      city: currentProperty.city,
    }).limit(3);

    res.json(related);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching related properties' });
  }
};

// -------------------- COMPARE --------------------
exports.compare = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (ids.length === 0) {
      return res.status(400).json({ message: 'Please provide property IDs in ?ids=...' });
    }

    const properties = await Property.find({ _id: { $in: ids } });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- NEARBY PROPERTIES --------------------
exports.getNearbyProperties = async (req, res) => {
  try {
    let { lat, lng, maxDistance = 10000, limit = 20 } = req.body;

    if (!lat || !lng) return res.status(400).json({ message: "Latitude and Longitude required" });

    lat = Number(lat);
    lng = Number(lng);

    const results = await Property.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          maxDistance: maxDistance,
          spherical: true,
        }
      },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({ count: results.length, properties: results });
  } catch (err) {
    console.error("Nearby search error:", err);
    res.status(500).json({ message: "Error fetching nearby properties", error: err.message });
  }
};



// -------------------- ADD REVIEW --------------------
exports.addReview = async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Push new review
    property.reviews.push({ name, message, rating });

    // Recalculate average
    property.averageRating =
      property.reviews.reduce((acc, r) => acc + r.rating, 0) / property.reviews.length;

    await property.save();

    res.status(201).json({ message: 'Review added', averageRating: property.averageRating, reviews: property.reviews });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
