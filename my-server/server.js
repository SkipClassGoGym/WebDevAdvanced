const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/exercise63_shopping_cart';

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration (MemoryStore is default - fine for learning, not production)
app.use(
  session({
    secret: 'exercise-63-shopping-cart',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  }),
);

// Initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});

// Serve static assets (custom CSS, images if added later)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Load HTML templates once at startup
const productsTemplate = fs.readFileSync(path.join(__dirname, 'views', 'products.html'), 'utf8');
const cartTemplate = fs.readFileSync(path.join(__dirname, 'views', 'cart.html'), 'utf8');

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getCartCount = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);

const getCartTotal = (cart) =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

const renderProductsPage = (products, cart) => {
  const cards = products
    .map((product) => {
      const imageUrl =
        product.image && product.image.trim().length > 0
          ? product.image
          : 'https://placehold.co/600x400?text=Product';

      return `
        <div class="col">
          <div class="card h-100 shadow-sm">
            <img src="${escapeHtml(imageUrl)}" class="card-img-top" alt="${escapeHtml(
        product.name,
      )}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${escapeHtml(product.name)}</h5>
              <p class="card-text text-muted">${escapeHtml(product.description)}</p>
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold">${formatPrice(product.price)}</span>
                  <span class="badge text-bg-secondary">${escapeHtml(product.category)}</span>
                </div>
                <form method="post" action="/add-to-cart/${product._id}">
                  <button type="submit" class="btn btn-primary w-100">ADD TO CART</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return productsTemplate
    .replace('{{PRODUCT_CARDS}}', cards || '<p class="text-muted">No products found.</p>')
    .replace('{{CART_COUNT}}', String(getCartCount(cart)));
};

const renderCartPage = (cart) => {
  const rows = cart
    .map((item) => {
      const imageUrl =
        item.image && item.image.trim().length > 0
          ? item.image
          : 'https://placehold.co/120x90?text=Item';

      return `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${escapeHtml(imageUrl)}" class="rounded" width="80" height="60" alt="${escapeHtml(
        item.name,
      )}">
              <div>
                <div class="fw-semibold">${escapeHtml(item.name)}</div>
                <div class="text-muted small">${escapeHtml(item.category)}</div>
              </div>
            </div>
          </td>
          <td class="text-end">${formatPrice(item.price)}</td>
          <td style="width: 140px;">
            <input
              type="number"
              name="quantities[${item._id}]"
              class="form-control"
              min="0"
              value="${item.quantity}"
            >
          </td>
          <td class="text-end">${formatPrice(item.price * item.quantity)}</td>
          <td class="text-end">
            <button
              type="submit"
              name="id"
              value="${item._id}"
              formaction="/remove-from-cart"
              formmethod="post"
              class="btn btn-outline-danger btn-sm"
            >
              Remove
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  const emptyRow = `
    <tr>
      <td colspan="5" class="text-center text-muted py-4">Your cart is empty.</td>
    </tr>
  `;

  return cartTemplate
    .replace('{{CART_ROWS}}', rows || emptyRow)
    .replace('{{CART_TOTAL}}', formatPrice(getCartTotal(cart)))
    .replace('{{CART_COUNT}}', String(getCartCount(cart)));
};

// Home page: products list (HTML)
app.get('/', async (req, res) => {
  const products = await Product.find().lean();
  res.send(renderProductsPage(products, req.session.cart));
});

// API: get all products from MongoDB
app.get('/products', async (req, res) => {
  const products = await Product.find().lean();
  res.json(products);
});

// Add to cart (stored in session)
app.post('/add-to-cart/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) {
    return res.status(404).send('Product not found');
  }

  const cart = req.session.cart;
  const existing = cart.find((item) => item._id === String(product._id));

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      _id: String(product._id),
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      quantity: 1,
    });
  }

  return res.redirect('/cart');
});

// Cart page: display items in session cart (HTML)
app.get('/cart', (req, res) => {
  res.send(renderCartPage(req.session.cart));
});

// Update quantities in cart
app.post('/update-cart', (req, res) => {
  const quantities = req.body.quantities || {};

  req.session.cart = req.session.cart
    .map((item) => {
      const rawQty = quantities[item._id];
      const nextQty = parseInt(rawQty, 10);
      if (Number.isNaN(nextQty)) {
        return item;
      }
      return { ...item, quantity: nextQty };
    })
    .filter((item) => item.quantity > 0);

  res.redirect('/cart');
});

// Remove item(s) from cart
app.post('/remove-from-cart', (req, res) => {
  const ids = [];
  if (req.body.id) {
    ids.push(req.body.id);
  }
  if (req.body.ids) {
    if (Array.isArray(req.body.ids)) {
      ids.push(...req.body.ids);
    } else {
      ids.push(req.body.ids);
    }
  }

  if (ids.length > 0) {
    req.session.cart = req.session.cart.filter((item) => !ids.includes(item._id));
  }

  res.redirect('/cart');
});

// Optional: simulate checkout (clears cart after "confirm")
app.post('/checkout', (req, res) => {
  console.log('Checkout confirmed. Cart data:', req.session.cart);
  req.session.cart = [];
  res.redirect('/cart');
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
