const mongoose = require('mongoose');
const Property = require('../models/Property');
require('dotenv').config();

async function fixCoordinates() {
  await mongoose.connect(process.env.MONGO_URI);
  const props = await Property.find({ "location.coordinates.0": { $gt: 90 } }); // lat stored first
  console.log('Fixing wrong coordinates:', props.length);

  for (let p of props) {
    const [lat, lng] = p.location.coordinates;
    p.location.coordinates = [lng, lat];
    await p.save();
    console.log(`Fixed ${p._id}`);
  }

  console.log('All done!');
  process.exit();
}

fixCoordinates();
