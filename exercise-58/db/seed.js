const mongoose = require('mongoose');
const Fashion = require('./fashion.model');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/FashionData');

  await Fashion.insertMany([
    // Streetwear
    {
      title: 'Oversized Hoodie Set',
      details: 'Relaxed fit hoodie with matching joggers, cotton blend.',
      thumbnail: 'https://example.com/img/streetwear-hoodie.jpg',
      style: 'Streetwear',
      createdAt: new Date('2026-03-01T09:00:00.000Z'),
    },
    {
      title: 'Graphic Tee + Cargo Pants',
      details: 'Bold graphic tee paired with utility cargo pants.',
      thumbnail: 'https://example.com/img/streetwear-graphic-tee.jpg',
      style: 'Streetwear',
      createdAt: new Date('2026-03-02T10:30:00.000Z'),
    },
    {
      title: 'Chunky Sneaker Look',
      details: 'High-top sneakers with tapered denim and bomber jacket.',
      thumbnail: 'https://example.com/img/streetwear-sneaker.jpg',
      style: 'Streetwear',
      createdAt: new Date('2026-03-03T14:15:00.000Z'),
    },

    // Minimalist
    {
      title: 'Monochrome Linen Set',
      details: 'Breathable linen shirt and straight-leg trousers.',
      thumbnail: 'https://example.com/img/minimalist-linen.jpg',
      style: 'Minimalist',
      createdAt: new Date('2026-02-25T08:00:00.000Z'),
    },
    {
      title: 'Clean Knit Dress',
      details: 'Neutral-toned knit dress with subtle ribbing.',
      thumbnail: 'https://example.com/img/minimalist-knit.jpg',
      style: 'Minimalist',
      createdAt: new Date('2026-02-26T11:20:00.000Z'),
    },
    {
      title: 'Structured Blazer Fit',
      details: 'Single-breasted blazer with tailored trousers.',
      thumbnail: 'https://example.com/img/minimalist-blazer.jpg',
      style: 'Minimalist',
      createdAt: new Date('2026-02-27T16:45:00.000Z'),
    },

    // Vintage
    {
      title: '70s Denim Jacket',
      details: 'Classic washed denim with retro stitching.',
      thumbnail: 'https://example.com/img/vintage-denim.jpg',
      style: 'Vintage',
      createdAt: new Date('2026-02-20T13:05:00.000Z'),
    },
    {
      title: 'Polka Dot Midi Dress',
      details: 'Flowy midi dress inspired by 1950s silhouettes.',
      thumbnail: 'https://example.com/img/vintage-polka.jpg',
      style: 'Vintage',
      createdAt: new Date('2026-02-21T09:40:00.000Z'),
    },
    {
      title: 'Retro Leather Satchel',
      details: 'Brown leather satchel with brass hardware.',
      thumbnail: 'https://example.com/img/vintage-satchel.jpg',
      style: 'Vintage',
      createdAt: new Date('2026-02-22T17:10:00.000Z'),
    },
  ]);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});