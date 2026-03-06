const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('./models/Product');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/exercise63_shopping_cart';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const dataPath = path.join(__dirname, 'data', 'products.json');
    const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Seeded ${products.length} products.`);
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
