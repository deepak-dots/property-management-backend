// routes/favorites.js

const express = require('express');
const { getFavorites, toggleFavorite, clearFavorites } = require('../controllers/favoritesController');
const { userAuth } = require('../middleware/userAuth');

const router = express.Router();

router.get('/', userAuth, getFavorites);
router.post('/', userAuth, toggleFavorite);
router.delete('/', userAuth, clearFavorites);

module.exports = router;