// controllers/favoritesController.js

const User = require("../models/User");

// Get all favorites for the logged-in user
exports.getFavorites = async (req, res) => {
  try {
    console.log('Fetching favorites for user:', req.user.id);

    // Find user and populate favorites
    const user = await User.findById(req.user.id).populate("favorites");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.favorites);
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Toggle favorite (add/remove)
exports.toggleFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "Property ID is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.favorites.findIndex(fav => fav.toString() === propertyId);

    if (index > -1) {
      // Property exists in favorites → remove it
      user.favorites.splice(index, 1);
      console.log('Removed favorite:', propertyId);
    } else {
      // Property not in favorites → add it
      user.favorites.push(propertyId);
      console.log('Added favorite:', propertyId);
    }

    await user.save();

    // Return updated favorites populated
    const updatedUser = await User.findById(req.user.id).populate("favorites");
    res.json(updatedUser.favorites);
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Clear all favorites
exports.clearFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = [];
    await user.save();

    res.json([]);
  } catch (err) {
    console.error('Clear favorites error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
