import { useState } from 'react';
import './App.css';

const PRODUCTS = [
  // Adidas
  { id: 1, brand: 'Adidas', name: 'Ultraboost Light', category: 'Running', price: 8999, emoji: '👟', color: '#e0f0ff' },
  { id: 2, brand: 'Adidas', name: 'Samba OG', category: 'Casual', price: 5999, emoji: '👟', color: '#f0e6d8' },
  { id: 3, brand: 'Adidas', name: 'Adilette Slides', category: 'Sandals', price: 1799, emoji: '🩴', color: '#e0f7e9' },
  // Nike
  { id: 4, brand: 'Nike', name: 'Air Max 90', category: 'Casual', price: 7499, emoji: '👟', color: '#ffe0e0' },
  { id: 5, brand: 'Nike', name: 'Pegasus 41', category: 'Running', price: 6999, emoji: '👟', color: '#fff4d6' },
  { id: 6, brand: 'Nike', name: 'Victori One Slide', category: 'Sandals', price: 1699, emoji: '🩴', color: '#e8e0f5' },
  // Anta
  { id: 7, brand: 'Anta', name: 'KT9 Basketball', category: 'Basketball', price: 4999, emoji: '🏀', color: '#ffe0e0' },
  { id: 8, brand: 'Anta', name: 'C37 Running', category: 'Running', price: 3299, emoji: '👟', color: '#e0eef5' },
  { id: 9, brand: 'Anta', name: 'Casual Lite', category: 'Casual', price: 2499, emoji: '👟', color: '#e0f7e9' },
  // New Balance
  { id: 10, brand: 'New Balance', name: '574 Classic', category: 'Casual', price: 5499, emoji: '👟', color: '#f0e6d8' },
  { id: 11, brand: 'New Balance', name: 'Fresh Foam 880', category: 'Running', price: 7299, emoji: '👟', color: '#e0f0ff' },
  { id: 12, brand: 'New Balance', name: '550 Court', category: 'Casual', price: 6499, emoji: '👟', color: '#fff4d6' },
  // Converse
  { id: 13, brand: 'Converse', name: 'Chuck Taylor High', category: 'Casual', price: 3299, emoji: '👟', color: '#ffe0e0' },
  { id: 14, brand: 'Converse', name: 'Chuck 70 Low', category: 'Casual', price: 4299, emoji: '👟', color: '#e8e0f5' },
  { id: 15, brand: 'Converse', name: 'One Star Pro', category: 'Skate', price: 3999, emoji: '🛹', color: '#e0eef5' },
  // Puma
  { id: 16, brand: 'Puma', name: 'Suede Classic', category: 'Casual', price: 4199, emoji: '👟', color: '#e0f7e9' },
  { id: 17, brand: 'Puma', name: 'Velocity Nitro', category: 'Running', price: 5999, emoji: '👟', color: '#ffe0e0' },
  { id: 18, brand: 'Puma', name: 'Leadcat Slides', category: 'Sandals', price: 1299, emoji: '🩴', color: '#fff4d6' },
];

const BRANDS = ['All', 'Adidas', 'Nike', 'Anta', 'New Balance', 'Converse', 'Puma'];
const CATEGORIES = ['All', 'Running', 'Casual', 'Basketball', 'Skate', 'Sandals'];
const SIZES = [38, 39, 40, 41, 42, 43, 44];
const peso = (n) => '₱' + n.toLocaleString();

export default function App() {
  const [screen, setScreen] = useState('home'); // home | detail | cart | checkout | success
  const [brand, setBrand] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderNo, setOrderNo] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', address: '', payment: 'gcash', card: '', expiry: '', cvv: '' });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = cart.length ? 100 : 0;
  const total = subtotal + shipping;

  const visible = PRODUCTS.filter(
    (p) =>
      (brand === 'All' || p.brand === brand) &&
      (category === 'All' || p.category === category) &&
      (p.name + ' ' + p.brand).toLowerCase().includes(search.toLowerCase())
  );

  function openProduct(p) {
    setSelected(p);
    setSize(null);
    setScreen('detail');
  }

  function addToCart() {
    if (!size) return alert('Please select a size');
    const key = selected.id + '-' + size;
    const exists = cart.find((i) => i.key === key);
    if (exists) {
      setCart(cart.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { key, id: selected.id, name: selected.brand + ' ' + selected.name, price: selected.price, emoji: selected.emoji, size, qty: 1 }]);
    }
    setScreen('cart');
  }

  function changeQty(key, delta) {
    setCart(cart.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  }

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // NOTE: This is a MOCK payment. A real app needs a backend + a payment gateway
  // (e.g. PayMongo, Xendit, Stripe) so card details never touch your own frontend.
  function placeOrder(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) return alert('Please fill in your delivery details');
    if (form.payment === 'card' && (!form.card || !form.expiry || !form.cvv)) return alert('Please fill in your card details');
    setOrderNo('SM-' + Math.floor(100000 + Math.random() * 900000));
    setScreen('success');
  }

  function newOrder() {
    setCart([]);
    setForm({ ...form, card: '', expiry: '', cvv: '' });
    setScreen('home');
  }

  return (
    <div className="phone">
      {/* ---------- Header ---------- */}
      <header className="header">
        {(screen === 'detail' || screen === 'cart' || screen === 'checkout') && (
          <button className="icon-btn" onClick={() => setScreen(screen === 'checkout' ? 'cart' : 'home')}>←</button>
        )}
        <h1>👟 SoleMate</h1>
        {screen !== 'success' && (
          <button className="icon-btn cart-btn" onClick={() => setScreen('cart')}>
            🛒{cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        )}
      </header>

      <main className="content">
        {/* ---------- Home ---------- */}
        {screen === 'home' && (
          <>
            <input className="search" placeholder="Search shoes..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <p className="label small-label">Brands</p>
            <div className="chips">
              {BRANDS.map((b) => (
                <button key={b} className={'chip' + (brand === b ? ' active' : '')} onClick={() => setBrand(b)}>
                  {b}
                </button>
              ))}
            </div>
            <p className="label small-label">Type</p>
            <div className="chips">
              {CATEGORIES.map((c) => (
                <button key={c} className={'chip' + (category === c ? ' active' : '')} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="grid">
              {visible.map((p) => (
                <div key={p.id} className="card" onClick={() => openProduct(p)}>
                  <div className="card-img" style={{ background: p.color }}>{p.emoji}</div>
                  <div className="card-brand">{p.brand}</div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-cat">{p.category}</div>
                  <div className="card-price">{peso(p.price)}</div>
                </div>
              ))}
              {visible.length === 0 && <p className="muted">No shoes found.</p>}
            </div>
          </>
        )}

        {/* ---------- Product detail ---------- */}
        {screen === 'detail' && selected && (
          <>
            <div className="detail-img" style={{ background: selected.color }}>{selected.emoji}</div>
            <p className="card-brand">{selected.brand}</p>
            <h2>{selected.name}</h2>
            <p className="muted">{selected.category}</p>
            <h3 className="price">{peso(selected.price)}</h3>
            <p className="label">Select size (EU)</p>
            <div className="sizes">
              {SIZES.map((s) => (
                <button key={s} className={'size' + (size === s ? ' active' : '')} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
            <button className="primary" onClick={addToCart}>Add to Cart</button>
          </>
        )}

        {/* ---------- Cart ---------- */}
        {screen === 'cart' && (
          <>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p className="muted">Your cart is empty.</p>
            ) : (
              <>
                {cart.map((i) => (
                  <div key={i.key} className="cart-item">
                    <div className="cart-emoji">{i.emoji}</div>
                    <div className="cart-info">
                      <strong>{i.name}</strong>
                      <span className="muted">Size {i.size}</span>
                      <span>{peso(i.price)}</span>
                    </div>
                    <div className="qty">
                      <button onClick={() => changeQty(i.key, -1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => changeQty(i.key, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="summary">
                  <div><span>Subtotal</span><span>{peso(subtotal)}</span></div>
                  <div><span>Shipping</span><span>{peso(shipping)}</span></div>
                  <div className="total"><span>Total</span><span>{peso(total)}</span></div>
                </div>
                <button className="primary" onClick={() => setScreen('checkout')}>Checkout</button>
              </>
            )}
          </>
        )}

        {/* ---------- Checkout ---------- */}
        {screen === 'checkout' && (
          <form onSubmit={placeOrder}>
            <h2>Checkout</h2>
            <p className="label">Delivery details</p>
            <input name="name" placeholder="Full name" value={form.name} onChange={updateForm} />
            <input name="phone" placeholder="Phone number" value={form.phone} onChange={updateForm} />
            <textarea name="address" placeholder="Delivery address" rows="3" value={form.address} onChange={updateForm} />

            <p className="label">Payment method</p>
            {[
              ['gcash', '📱 GCash'],
              ['maya', '💳 Maya'],
              ['card', '💳 Credit / Debit Card'],
              ['cod', '💵 Cash on Delivery'],
            ].map(([val, text]) => (
              <label key={val} className={'pay-option' + (form.payment === val ? ' active' : '')}>
                <input type="radio" name="payment" value={val} checked={form.payment === val} onChange={updateForm} />
                {text}
              </label>
            ))}

            {form.payment === 'card' && (
              <>
                <input name="card" placeholder="Card number" maxLength="19" value={form.card} onChange={updateForm} />
                <div className="row">
                  <input name="expiry" placeholder="MM/YY" maxLength="5" value={form.expiry} onChange={updateForm} />
                  <input name="cvv" placeholder="CVV" maxLength="4" value={form.cvv} onChange={updateForm} />
                </div>
              </>
            )}

            <div className="summary">
              <div className="total"><span>Total to pay</span><span>{peso(total)}</span></div>
            </div>
            <button className="primary" type="submit">
              {form.payment === 'cod' ? 'Place Order' : 'Pay ' + peso(total)}
            </button>
            <p className="muted small">Demo only: no real payment is processed.</p>
          </form>
        )}

        {/* ---------- Success ---------- */}
        {screen === 'success' && (
          <div className="success">
            <div className="big">✅</div>
            <h2>Order placed!</h2>
            <p>Order number</p>
            <h3>{orderNo}</h3>
            <p className="muted">Thank you, {form.name}. We'll deliver your shoes soon.</p>
            <button className="primary" onClick={newOrder}>Continue Shopping</button>
          </div>
        )}
      </main>
    </div>
  );
}