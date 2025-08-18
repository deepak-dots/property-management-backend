// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');      
const propertyRoutes = require('./routes/property');
const authRoutes = require('./routes/auth');
const userRouter = require('./routes/user');
const quotesRouter = require('./routes/propertyQuotesForm');



const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

//app.use(cors()); 

const allowedOrigins = [
  "http://localhost:5000", // for local frontend
  "https://property-management-frontend.vercel.app/", // your deployed frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

app.use('/api/properties', propertyRoutes);

app.use("/api/quotes", quotesRouter);

app.get('/', (req, res) => {
  res.send('Property API running');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));

