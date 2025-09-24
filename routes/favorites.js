// routes/favorites.js

const express = require("express");
const { getFavorites, toggleFavorite, clearFavorites } = require('../controllers/favoritesController');
const { authenticateUser } = require("../middleware/userAuth");

const router = express.Router();

// Get all favorites
router.get('/', authenticateUser, getFavorites);

// Toggle favorite
router.post('/', authenticateUser, toggleFavorite);

// Clear favorites
router.delete('/', authenticateUser, clearFavorites);

module.exports = router;


