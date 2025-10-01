require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const propertyRoutes = require('./routes/property');
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const quotesRouter = require('./routes/propertyQuotesForm'); // Quotes routes
const cloudinary = require("./utils/cloudinary");
const pageRoutes = require('./routes/page');
const favoritesRouter = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// ------------------ Connect MongoDB ------------------
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ------------------ CORS configuration ------------------
const allowedOrigins = [
  "http://localhost:3000", 
  "https://property-management-frontend-alpha.vercel.app",
  "https://property-management-frontend-rnk74c91c.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or server requests
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS error: This site ${origin} is not allowed.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------ Cloudinary Test ------------------
app.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------ Routes ------------------
app.use('/api/favorites', favoritesRouter);
app.use('/api/pages', pageRoutes);
app.use('/api/user', userRouter);

// **Admin routes for signup/login & protected routes**
app.use('/api/admin', adminRouter);

app.use('/api/properties', propertyRoutes);
app.use("/api/quotes", quotesRouter); // Quotes routes with optional auth

// ------------------ Root ------------------
app.get('/', (req, res) => {
  res.send('Property API running');
});

// ------------------ Start server ------------------
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
