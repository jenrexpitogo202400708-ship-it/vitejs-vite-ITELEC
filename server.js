// SoleMate backend (basic): Express + a db.json file for saving orders
import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SHIPPING_FEE = 100;
const SIZES = [38, 39, 40, 41, 42, 43, 44];

// ---------- Products ----------
const products = [
  { id: 1, brand: 'Adidas', name: 'Ultraboost Light', category: 'Running', price: 8999, emoji: '👟', color: '#e0f0ff' },
  { id: 2, brand: 'Adidas', name: 'Samba OG', category: 'Casual', price: 5999, emoji: '👟', color: '#f0e6d8' },
  { id: 3, brand: 'Adidas', name: 'Adilette Slides', category: 'Sandals', price: 1799, emoji: '🩴', color: '#e0f7e9' },
  { id: 4, brand: 'Nike', name: 'Air Max 90', category: 'Casual', price: 7499, emoji: '👟', color: '#ffe0e0' },
  { id: 5, brand: 'Nike', name: 'Pegasus 41', category: 'Running', price: 6999, emoji: '👟', color: '#fff4d6' },
  { id: 6, brand: 'Nike', name: 'Victori One Slide', category: 'Sandals', price: 1699, emoji: '🩴', color: '#e8e0f5' },
  { id: 7, brand: 'Anta', name: 'KT9 Basketball', category: 'Basketball', price: 4999, emoji: '🏀', color: '#ffe0e0' },
  { id: 8, brand: 'Anta', name: 'C37 Running', category: 'Running', price: 3299, emoji: '👟', color: '#e0eef5' },
  { id: 9, brand: 'Anta', name: 'Casual Lite', category: 'Casual', price: 2499, emoji: '👟', color: '#e0f7e9' },
  { id: 10, brand: 'New Balance', name: '574 Classic', category: 'Casual', price: 5499, emoji: '👟', color: '#f0e6d8' },
  { id: 11, brand: 'New Balance', name: 'Fresh Foam 880', category: 'Running', price: 7299, emoji: '👟', color: '#e0f0ff' },
  { id: 12, brand: 'New Balance', name: '550 Court', category: 'Casual', price: 6499, emoji: '👟', color: '#fff4d6' },
  { id: 13, brand: 'Converse', name: 'Chuck Taylor High', category: 'Casual', price: 3299, emoji: '👟', color: '#ffe0e0' },
  { id: 14, brand: 'Converse', name: 'Chuck 70 Low', category: 'Casual', price: 4299, emoji: '👟', color: '#e8e0f5' },
  { id: 15, brand: 'Converse', name: 'One Star Pro', category: 'Skate', price: 3999, emoji: '🛹', color: '#e0eef5' },
  { id: 16, brand: 'Puma', name: 'Suede Classic', category: 'Casual', price: 4199, emoji: '👟', color: '#e0f7e9' },
  { id: 17, brand: 'Puma', name: 'Velocity Nitro', category: 'Running', price: 5999, emoji: '👟', color: '#ffe0e0' },
  { id: 18, brand: 'Puma', name: 'Leadcat Slides', category: 'Sandals', price: 1299, emoji: '🩴', color: '#fff4d6' },
];

// ---------- Orders (saved in db.json) ----------
let orders = [];
if (fs.existsSync('db.json')) {
  try {
    orders = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  } catch (e) {
    orders = [];
  }
}
function saveOrders() {
  fs.writeFileSync('db.json', JSON.stringify(orders, null, 2));
}

// ---------- Routes ----------

// Check the server works
app.get('/api', (req, res) => {
  res.json({ app: 'SoleMate API', status: 'running' });
});

// Get all products (optional: ?brand=Nike&category=Running&search=air)
app.get('/api/products', (req, res) => {
  const { brand, category, search } = req.query;
  let list = products;
  if (brand && brand !== 'All') list = list.filter((p) => p.brand === brand);
  if (category && category !== 'All') list = list.filter((p) => p.category === category);
  if (search) {
    const text = String(search).toLowerCase();
    list = list.filter((p) => (p.brand + ' ' + p.name).toLowerCase().includes(text));
  }
  res.json(list);
});

// Get one product
app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Create an order. The server works out the prices, so customers cannot change them.
// Body: { items: [{ productId, size, qty }], delivery: { name, phone, address }, paymentMethod }
app.post('/api/orders', (req, res) => {
  const { items, delivery, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }
  if (!delivery || !delivery.name || !delivery.phone || !delivery.address) {
    return res.status(400).json({ error: 'Please fill in your delivery details' });
  }
  if (!['gcash', 'maya', 'card', 'cod'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  const orderItems = [];
  for (const item of items) {
    const product = products.find((p) => p.id === Number(item.productId));
    const qty = Number(item.qty);
    const size = Number(item.size);
    if (!product) return res.status(400).json({ error: 'Product not found' });
    if (!SIZES.includes(size)) return res.status(400).json({ error: 'Invalid size' });
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) return res.status(400).json({ error: 'Invalid quantity' });
    orderItems.push({ productId: product.id, name: product.brand + ' ' + product.name, size, qty, price: product.price });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const order = {
    id: 'SM-' + Math.floor(100000 + Math.random() * 900000),
    items: orderItems,
    delivery: { name: delivery.name, phone: delivery.phone, address: delivery.address },
    paymentMethod,
    subtotal,
    shipping: SHIPPING_FEE,
    total: subtotal + SHIPPING_FEE,
    paymentStatus: paymentMethod === 'cod' ? 'pay on delivery' : 'unpaid',
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  saveOrders();
  res.status(201).json(order);
});

// Pay for an order (MOCK: no real money is moved)
app.post('/api/orders/:id/pay', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.paymentMethod === 'cod') return res.status(400).json({ error: 'Cash on delivery does not need online payment' });
  if (order.paymentStatus === 'paid') return res.status(400).json({ error: 'Order is already paid' });

  order.paymentStatus = 'paid';
  order.paidAt = new Date().toISOString();
  saveOrders();
  res.json(order);
});

// Look up an order by its number (for tracking)
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// See all orders (for the shop owner while testing)
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.listen(PORT, () => {
  console.log('SoleMate API running on port ' + PORT);
});