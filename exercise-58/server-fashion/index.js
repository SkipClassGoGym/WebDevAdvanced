const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Fashion = require('./models/Fashion');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/FashionData';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

app.get('/api/fashions', async (req, res, next) => {
  try {
    const fashions = await Fashion.find().sort({ createdAt: -1 });
    res.json(fashions);
  } catch (error) {
    next(error);
  }
});

app.get('/api/fashions/style/:style', async (req, res, next) => {
  try {
    const { style } = req.params;
    const fashions = await Fashion.find({ style }).sort({ createdAt: -1 });
    res.json(fashions);
  } catch (error) {
    next(error);
  }
});

app.get('/api/fashions/:id', async (req, res, next) => {
  try {
    const fashion = await Fashion.findById(req.params.id);
    if (!fashion) {
      return res.status(404).json({ message: 'Fashion not found' });
    }
    res.json(fashion);
  } catch (error) {
    next(error);
  }
});

app.post('/api/fashions', async (req, res, next) => {
  try {
    const fashion = await Fashion.create(req.body);
    res.status(201).json(fashion);
  } catch (error) {
    next(error);
  }
});

app.put('/api/fashions/:id', async (req, res, next) => {
  try {
    const fashion = await Fashion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fashion) {
      return res.status(404).json({ message: 'Fashion not found' });
    }
    res.json(fashion);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/fashions/:id', async (req, res, next) => {
  try {
    const fashion = await Fashion.findByIdAndDelete(req.params.id);
    if (!fashion) {
      return res.status(404).json({ message: 'Fashion not found' });
    }
    res.json({ message: 'Fashion deleted' });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ObjectId' });
  }

  res.status(500).json({ message: 'Server error', error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});