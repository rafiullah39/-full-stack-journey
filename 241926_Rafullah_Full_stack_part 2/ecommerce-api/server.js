const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const SIZES = ["S", "M", "L", "XL"];
const PAYMENTS = ["Cash on Delivery", "Card", "Bank Transfer"];
const emailRe = /^\S+@\S+\.\S+$/;
const phoneRe = /^[0-9+\-\s]{10,15}$/;

const seed = () => ({
  counters: { user: 0, product: 6, review: 3, order: 0, item: 0 },
  users: [],
  sessions: [],
  carts: {},
  orders: [],
  collections: [
    { id: 1, img: "col1", name: "Royal Shalwar Kameez", n: 28, tag: "Signature Line" },
    { id: 2, img: "col2", name: "Vintage Old-School Shirts", n: 16, tag: "Retro Revival" },
    { id: 3, img: "col3", name: "Heritage Silk Waistcoats", n: 22, tag: "Heirloom Zari" },
    { id: 4, img: "col4", name: "Vintage Wristwatches", n: 12, tag: "Old-School Time" },
    { id: 5, img: "col5", name: "Peshawari Chappals", n: 18, tag: "Hand-Stitched Leather" },
    { id: 6, img: "col6", name: "Retro Aviator Sunglasses", n: 14, tag: "70s Classics" },
    { id: 7, img: "col7", name: "Vintage Leather Jackets", n: 10, tag: "Heritage Outerwear" },
    { id: 8, img: "col8", name: "Karakul Caps & Pashmina Shawls", n: 20, tag: "Winter Heritage" }
  ],
  products: [
    { id: 1, img: "p1", image: "", name: "The Swat Valley Heirloomed Shalwar Kameez", category: "Shalwar Kameez", tag: "Bespoke Heritage", price: 38500, rating: 5.0, reviewCount: 102, desc: "Cream boski silk with tonal banarsi kameez detail." },
    { id: 2, img: "p2", image: "", name: "Old-School Retro Camp Collar Shirt", category: "Vintage Shirts", tag: "Vintage Classic", price: 18000, rating: 4.8, reviewCount: 89, desc: "1970s block-printed slub cotton in indigo & terracotta." },
    { id: 3, img: "p3", image: "", name: "Nawab Zari Embellished Raw Silk Waistcoat", category: "Waistcoats", tag: "Hand-Embroidered", price: 32500, rating: 5.0, reviewCount: 206, desc: "Midnight royal cobalt with antique gold dabka work." },
    { id: 4, img: "p4", image: "", name: "Peshawari Kurta with Hand-Pleated Shalwar", category: "Shalwar Kameez", tag: "Limited Batch", price: 25000, rating: 4.9, reviewCount: 76, desc: "Sage olive khaddar with authentic wide-cut chest canvas." },
    { id: 5, img: "p5", image: "", name: "Artisanal Cuban Linen Vintage Shirt", category: "Vintage Shirts", tag: "Pure Linen", price: 19800, rating: 4.9, reviewCount: 115, desc: "Saffron ochre pure linen with mother-of-pearl buttons." },
    { id: 6, img: "p6", image: "", name: "Imperial Jamawar Occasion Kameez Set", category: "Royal Kurtas", tag: "Bridal / Occasion", price: 48000, rating: 5.0, reviewCount: 170, desc: "Deep maroon & gold jacquard with pleated chudidar." }
  ],
  reviews: [
    { id: 1, productId: 1, userName: "Shahzad K. Malik", city: "Mayfair, London", rating: 5, title: "The Raw Collar Stiffness is Flawless", comment: "Finding a tailored Shalwar Kameez in London with authentic canvas fusing has always been nearly impossible. Rafi's Collection crafted mine to bespoke perfection.", createdAt: "2026-10-03T10:00:00.000Z" },
    { id: 2, productId: 2, userName: "Tariq Rehman", city: "Dubai DIFC", rating: 5, title: "Vintage Cuban Shirts with Pure Soul", comment: "The old-school camp collar shirt transports you directly to 1974. Heavy slub cotton, natural mother-of-pearl buttons, and shoulder drape that breathes effortlessly.", createdAt: "2026-10-02T10:00:00.000Z" },
    { id: 3, productId: 3, userName: "Ali Asghar", city: "Islamabad", rating: 5, title: "Wedding Waistcoat was the Highlight", comment: "Ordered the Nawab Zari Raw Silk Waistcoat for my brother's Nikah ceremony. The antique gold dabka work has real weight and heritage patina.", createdAt: "2026-10-01T10:00:00.000Z" }
  ]
});

function loadDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(seed(), null, 2));
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
let db = loadDb();

function saveDb() {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

const nextId = (key) => ++db.counters[key];
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });

const hashPw = (pw, salt = crypto.randomBytes(16).toString("hex")) => ({
  salt,
  hash: crypto.scryptSync(pw, salt, 64).toString("hex")
});
const checkPw = (pw, user) =>
  crypto.timingSafeEqual(crypto.scryptSync(pw, user.salt, 64), Buffer.from(user.hash, "hex"));

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

function newSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
  return token;
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const session = db.sessions.find((s) => s.token === token);
  const user = session && db.users.find((u) => u.id === session.userId);
  if (!user) return bad(res, "Please sign in first.", 401);
  req.user = user;
  req.token = token;
  next();
}

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

/* ---------- AUTH ---------- */
app.post("/api/auth/signup", (req, res) => {
  const name = str(req.body.name, 60);
  const email = str(req.body.email, 100).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!name || !email || !password) return bad(res, "Please fill in all fields.");
  if (!emailRe.test(email)) return bad(res, "Enter a valid email address.");
  if (password.length < 6) return bad(res, "Password must be at least 6 characters.");
  if (db.users.some((u) => u.email === email)) return bad(res, "This email is already registered. Try signing in.", 409);
  const { salt, hash } = hashPw(password);
  const user = { id: nextId("user"), name, email, salt, hash, createdAt: new Date().toISOString() };
  db.users.push(user);
  const token = newSession(user.id);
  saveDb();
  res.status(201).json({ token, user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const email = str(req.body.email, 100).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const user = db.users.find((u) => u.email === email);
  if (!user || !checkPw(password, user)) return bad(res, "Invalid email or password.", 401);
  const token = newSession(user.id);
  saveDb();
  res.json({ token, user: publicUser(user) });
});

app.get("/api/auth/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));

app.post("/api/auth/logout", auth, (req, res) => {
  db.sessions = db.sessions.filter((s) => s.token !== req.token);
  saveDb();
  res.json({ message: "Logged out." });
});

/* ---------- COLLECTIONS ---------- */
app.get("/api/collections", (req, res) => res.json(db.collections));

/* ---------- PRODUCTS (CRUD) ---------- */
function cleanProduct(b) {
  const name = str(b.name, 120);
  const category = str(b.category, 60);
  const price = Number(b.price);
  if (!name || !category) return { error: "Name and category are required." };
  if (!Number.isFinite(price) || price <= 0) return { error: "Price must be a positive number." };
  return {
    data: {
      name,
      category,
      price: Math.round(price),
      tag: str(b.tag, 40) || "New Arrival",
      desc: str(b.desc, 300),
      image: str(b.image, 500),
      img: str(b.img, 20)
    }
  };
}

app.get("/api/products", (req, res) => {
  let list = db.products;
  const { category, search } = req.query;
  if (category && category !== "All") list = list.filter((p) => p.category === category);
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }
  res.json(list);
});

app.get("/api/products/:id", (req, res) => {
  const p = db.products.find((x) => x.id === Number(req.params.id));
  if (!p) return bad(res, "Product not found.", 404);
  res.json(p);
});

app.post("/api/products", auth, (req, res) => {
  const c = cleanProduct(req.body);
  if (c.error) return bad(res, c.error);
  const product = { id: nextId("product"), ...c.data, rating: 0, reviewCount: 0 };
  db.products.push(product);
  saveDb();
  res.status(201).json(product);
});

app.put("/api/products/:id", auth, (req, res) => {
  const p = db.products.find((x) => x.id === Number(req.params.id));
  if (!p) return bad(res, "Product not found.", 404);
  const c = cleanProduct({ ...p, ...req.body });
  if (c.error) return bad(res, c.error);
  Object.assign(p, c.data);
  saveDb();
  res.json(p);
});

app.delete("/api/products/:id", auth, (req, res) => {
  const id = Number(req.params.id);
  if (!db.products.some((x) => x.id === id)) return bad(res, "Product not found.", 404);
  db.products = db.products.filter((x) => x.id !== id);
  db.reviews = db.reviews.filter((r) => r.productId !== id);
  Object.keys(db.carts).forEach((uid) => {
    db.carts[uid] = db.carts[uid].filter((i) => i.productId !== id);
  });
  saveDb();
  res.json({ message: "Product deleted." });
});

/* ---------- REVIEWS ---------- */
const withProductName = (r) => {
  const p = db.products.find((x) => x.id === r.productId);
  return { ...r, productName: p ? p.name : "" };
};
const newestFirst = (a, b) => (a.createdAt < b.createdAt ? 1 : -1);

app.get("/api/reviews", (req, res) => {
  res.json([...db.reviews].sort(newestFirst).map(withProductName));
});

app.get("/api/products/:id/reviews", (req, res) => {
  const id = Number(req.params.id);
  if (!db.products.some((p) => p.id === id)) return bad(res, "Product not found.", 404);
  res.json(db.reviews.filter((r) => r.productId === id).sort(newestFirst).map(withProductName));
});

app.post("/api/products/:id/reviews", auth, (req, res) => {
  const product = db.products.find((p) => p.id === Number(req.params.id));
  if (!product) return bad(res, "Product not found.", 404);
  const rating = Number(req.body.rating);
  const title = str(req.body.title, 100);
  const comment = str(req.body.comment, 1000);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return bad(res, "Rating must be between 1 and 5.");
  if (!title || !comment) return bad(res, "Please add a title and your review.");
  const review = {
    id: nextId("review"),
    productId: product.id,
    userName: req.user.name,
    city: "",
    rating,
    title,
    comment,
    createdAt: new Date().toISOString()
  };
  db.reviews.push(review);
  product.rating = Math.round(((product.rating * product.reviewCount + rating) / (product.reviewCount + 1)) * 10) / 10;
  product.reviewCount += 1;
  saveDb();
  res.status(201).json(withProductName(review));
});

/* ---------- CART (per logged-in user) ---------- */
function cartView(userId) {
  const items = (db.carts[userId] || [])
    .map((i) => {
      const product = db.products.find((p) => p.id === i.productId);
      return product ? { ...i, product, lineTotal: product.price * i.qty } : null;
    })
    .filter(Boolean);
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 50000 ? 0 : 500;
  return { items, subtotal, shipping, total: subtotal + shipping, count: items.reduce((s, i) => s + i.qty, 0) };
}

app.get("/api/cart", auth, (req, res) => res.json(cartView(req.user.id)));

app.post("/api/cart", auth, (req, res) => {
  const productId = Number(req.body.productId);
  const size = str(req.body.size, 4) || "M";
  const qty = req.body.qty === undefined ? 1 : Number(req.body.qty);
  if (!db.products.some((p) => p.id === productId)) return bad(res, "Product not found.", 404);
  if (!SIZES.includes(size)) return bad(res, "Invalid size.");
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) return bad(res, "Quantity must be between 1 and 10.");
  const cart = (db.carts[req.user.id] = db.carts[req.user.id] || []);
  const existing = cart.find((i) => i.productId === productId && i.size === size);
  if (existing) existing.qty = Math.min(existing.qty + qty, 10);
  else cart.push({ id: nextId("item"), productId, size, qty });
  saveDb();
  res.status(201).json(cartView(req.user.id));
});

app.put("/api/cart/:itemId", auth, (req, res) => {
  const cart = db.carts[req.user.id] || [];
  const item = cart.find((i) => i.id === Number(req.params.itemId));
  if (!item) return bad(res, "Cart item not found.", 404);
  if (req.body.size !== undefined) {
    const size = str(req.body.size, 4);
    if (!SIZES.includes(size)) return bad(res, "Invalid size.");
    const twin = cart.find((i) => i !== item && i.productId === item.productId && i.size === size);
    if (twin) {
      twin.qty = Math.min(twin.qty + item.qty, 10);
      db.carts[req.user.id] = cart.filter((i) => i !== item);
      saveDb();
      return res.json(cartView(req.user.id));
    }
    item.size = size;
  }
  if (req.body.qty !== undefined) {
    const qty = Number(req.body.qty);
    if (!Number.isInteger(qty) || qty > 10) return bad(res, "Quantity must be a whole number up to 10.");
    if (qty < 1) db.carts[req.user.id] = cart.filter((i) => i !== item);
    else item.qty = qty;
  }
  saveDb();
  res.json(cartView(req.user.id));
});

app.delete("/api/cart/:itemId", auth, (req, res) => {
  const cart = db.carts[req.user.id] || [];
  if (!cart.some((i) => i.id === Number(req.params.itemId))) return bad(res, "Cart item not found.", 404);
  db.carts[req.user.id] = cart.filter((i) => i.id !== Number(req.params.itemId));
  saveDb();
  res.json(cartView(req.user.id));
});

app.delete("/api/cart", auth, (req, res) => {
  db.carts[req.user.id] = [];
  saveDb();
  res.json(cartView(req.user.id));
});

/* ---------- CHECKOUT / ORDERS ---------- */
app.post("/api/orders", auth, (req, res) => {
  const d = req.body.delivery || {};
  const delivery = {
    name: str(d.name, 80),
    phone: str(d.phone, 20),
    email: str(d.email, 100),
    city: str(d.city, 60),
    zip: str(d.zip, 12),
    address: str(d.address, 250),
    note: str(d.note, 250)
  };
  const paymentMethod = str(req.body.paymentMethod, 30);
  if (!delivery.name || !delivery.phone || !delivery.email || !delivery.city || !delivery.address)
    return bad(res, "Please fill in name, phone, email, city and address.");
  if (!phoneRe.test(delivery.phone)) return bad(res, "Enter a valid phone number.");
  if (!emailRe.test(delivery.email)) return bad(res, "Enter a valid email address.");
  if (!PAYMENTS.includes(paymentMethod)) return bad(res, "Choose a valid payment method.");
  const view = cartView(req.user.id);
  if (!view.items.length) return bad(res, "Your cart is empty.");
  const order = {
    id: nextId("order"),
    orderNo: "RC-" + Math.floor(100000 + Math.random() * 900000),
    userId: req.user.id,
    items: view.items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      size: i.size,
      qty: i.qty,
      price: i.product.price,
      lineTotal: i.lineTotal
    })),
    subtotal: view.subtotal,
    shipping: view.shipping,
    total: view.total,
    delivery,
    paymentMethod,
    status: "Placed",
    createdAt: new Date().toISOString()
  };
  db.orders.push(order);
  db.carts[req.user.id] = [];
  saveDb();
  res.status(201).json(order);
});

app.get("/api/orders", auth, (req, res) => {
  res.json(db.orders.filter((o) => o.userId === req.user.id).sort(newestFirst));
});

app.get("/api/orders/:id", auth, (req, res) => {
  const order = db.orders.find((o) => o.id === Number(req.params.id) && o.userId === req.user.id);
  if (!order) return bad(res, "Order not found.", 404);
  res.json(order);
});

app.use("/api", (req, res) => bad(res, "Endpoint not found.", 404));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return bad(res, "Invalid JSON body.");
  console.error(err);
  bad(res, "Server error.", 500);
});

app.listen(PORT, () => {
  console.log(`Rafi's Collection running at http://localhost:${PORT}`);
});