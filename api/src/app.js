const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { authClient, configured, serviceClient } = require("./supabase");
const { authenticate } = require("./middleware/auth");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",").map((origin) => origin.trim()).filter(Boolean);

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "32kb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: "draft-8", legacyHeaders: false }));

const authLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });
const customer = authenticate("customer");
const admin = authenticate("admin");

function requireDatabase(req, res, next) {
  if (!configured || !serviceClient) {
    return res.status(503).json({ error: "Supabase is not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY." });
  }
  next();
}

function validEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validPassword(value) {
  return typeof value === "string" && value.length >= 8;
}

function toProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.categories?.name || "",
    category_slug: row.category_slug,
    price: row.price === null ? null : Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    image: row.image_url,
    description: row.description || "",
    stock: row.stock,
    active: row.is_active,
  };
}

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "logindustries-api", supabaseConfigured: configured });
});

app.get("/api/supabase-status", requireDatabase, async (req, res, next) => {
  try {
    const { count, error } = await serviceClient.from("products").select("id", { count: "exact", head: true });
    if (error) return next(error);
    res.json({ connected: true, productCount: count });
  } catch (error) { next(error); }
});

app.post("/api/auth/register", authLimiter, requireDatabase, async (req, res, next) => {
  const { email, password, fullName, phone } = req.body || {};
  if (!validEmail(email) || !validPassword(password)) {
    return res.status(400).json({ error: "Provide a valid email and a password of at least 8 characters." });
  }
  if (fullName !== undefined && (typeof fullName !== "string" || fullName.length > 120)) {
    return res.status(400).json({ error: "fullName must be 120 characters or fewer." });
  }
  if (phone !== undefined && (typeof phone !== "string" || phone.length > 32)) {
    return res.status(400).json({ error: "phone must be 32 characters or fewer." });
  }
  try {
    const { data, error } = await authClient.auth.signUp({
      email: email.trim().toLowerCase(), password,
      options: { data: { full_name: fullName || "", phone: phone || "" } },
    });
    if (error) return next(error);
    res.status(201).json({ user: data.user, session: data.session, confirmationRequired: !data.session });
  } catch (error) { next(error); }
});

app.post("/api/auth/login", authLimiter, requireDatabase, async (req, res, next) => {
  const { email, password } = req.body || {};
  if (!validEmail(email) || typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const { data, error } = await authClient.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return res.status(401).json({ error: "Email or password is incorrect." });
    const { data: profile, error: profileError } = await serviceClient.from("profiles")
      .select("id, full_name, phone, shipping_address, role").eq("id", data.user.id).maybeSingle();
    if (profileError) return next(profileError);
    if (!profile) return res.status(403).json({ error: "Account profile is not provisioned." });
    res.json({ user: data.user, profile, session: data.session });
  } catch (error) { next(error); }
});

app.post("/api/auth/logout", requireDatabase, async (req, res, next) => {
  const token = (req.get("authorization") || "").replace(/^Bearer /, "");
  if (!token) return res.status(204).end();
  try {
    const { error } = await serviceClient.auth.admin.signOut(token, "local");
    if (error) return next(error);
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get("/api/categories", requireDatabase, async (req, res, next) => {
  try {
    const { data, error } = await serviceClient.from("categories").select("slug, name, image_url").order("sort_order");
    if (error) return next(error);
    res.json({ items: data.map((category) => ({ ...category, image: category.image_url })), count: data.length });
  } catch (error) { next(error); }
});

app.get("/api/products", requireDatabase, async (req, res, next) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 100);
  try {
    let query = serviceClient.from("products").select("*, categories(name, slug)", { count: "exact" }).eq("is_active", true);
    if (req.query.category) query = query.eq("category_slug", String(req.query.category));
    if (req.query.q) query = query.ilike("name", `%${String(req.query.q).replace(/[%_]/g, "\\$&")}%`);
    const { data, error, count } = await query.order("created_at", { ascending: false }).range((page - 1) * limit, page * limit - 1);
    if (error) return next(error);
    res.json({ items: data.map(toProduct), count, page, limit });
  } catch (error) { next(error); }
});

app.get("/api/products/:slug", requireDatabase, async (req, res, next) => {
  try {
    const { data, error } = await serviceClient.from("products").select("*, categories(name, slug)")
      .eq("slug", req.params.slug).eq("is_active", true).maybeSingle();
    if (error) return next(error);
    if (!data) return res.status(404).json({ error: "Product not found." });
    res.json({ item: toProduct(data) });
  } catch (error) { next(error); }
});

app.get("/api/account/profile", requireDatabase, customer, (req, res) => {
  res.json({ item: { ...req.profile, email: req.user.email } });
});

app.patch("/api/account/profile", requireDatabase, customer, async (req, res, next) => {
  const fields = ["full_name", "phone", "shipping_address"];
  const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => fields.includes(key)));
  if (!Object.keys(patch).length) return res.status(400).json({ error: "Provide full_name, phone, or shipping_address." });
  if (patch.full_name !== undefined && (typeof patch.full_name !== "string" || patch.full_name.length > 120)) return res.status(400).json({ error: "full_name must be 120 characters or fewer." });
  if (patch.phone !== undefined && (typeof patch.phone !== "string" || patch.phone.length > 32)) return res.status(400).json({ error: "phone must be 32 characters or fewer." });
  if (patch.shipping_address !== undefined && (!patch.shipping_address || typeof patch.shipping_address !== "object" || Array.isArray(patch.shipping_address))) return res.status(400).json({ error: "shipping_address must be an object." });
  try {
    const { data, error } = await serviceClient.from("profiles").update(patch).eq("id", req.user.id)
      .select("id, full_name, phone, shipping_address, role").single();
    if (error) return next(error);
    res.json({ item: { ...data, email: req.user.email } });
  } catch (error) { next(error); }
});

app.get("/api/account/orders", requireDatabase, customer, async (req, res, next) => {
  try {
    const { data, error } = await serviceClient.from("orders")
      .select("id, order_number, status, payment_status, currency, subtotal, shipping_fee, total, shipping_address, created_at, order_items(id, product_name, product_image, quantity, unit_price, line_total)")
      .eq("user_id", req.user.id).order("created_at", { ascending: false });
    if (error) return next(error);
    res.json({ items: data, count: data.length });
  } catch (error) { next(error); }
});

app.post("/api/account/orders", requireDatabase, customer, async (req, res, next) => {
  const { items, shipping_address: shippingAddress } = req.body || {};
  if (!Array.isArray(items) || !items.length || items.length > 50) return res.status(400).json({ error: "Order must contain between 1 and 50 items." });
  if (!shippingAddress || typeof shippingAddress !== "object" || Array.isArray(shippingAddress)) return res.status(400).json({ error: "A shipping_address object is required." });
  const cleanItems = [];
  for (const item of items) {
    if (!item || typeof item.product_id !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      return res.status(400).json({ error: "Each item requires product_id and quantity from 1 to 100." });
    }
    cleanItems.push({ product_id: item.product_id, quantity: item.quantity });
  }
  try {
    const { data, error } = await serviceClient.rpc("place_order", {
      p_user_id: req.user.id, p_items: cleanItems, p_shipping_address: shippingAddress,
    });
    if (error) return next(error);
    res.status(201).json({ item: data, message: "Order created with payment pending." });
  } catch (error) { next(error); }
});

app.get("/api/admin/summary", requireDatabase, admin, async (req, res, next) => {
  try {
    const results = await Promise.all([
      serviceClient.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      serviceClient.from("categories").select("slug", { count: "exact", head: true }),
      serviceClient.from("orders").select("id", { count: "exact", head: true }),
      serviceClient.from("orders").select("total").eq("payment_status", "paid"),
    ]);
    const failed = results.find((result) => result.error);
    if (failed) return next(failed.error);
    const [productRows, categoryRows, orderRows, paidRows] = results;
    const paidRevenue = paidRows.data.reduce((total, row) => total + Number(row.total), 0);
    res.json({ products: productRows.count, categories: categoryRows.count, orders: orderRows.count, paidRevenue, currency: "INR" });
  } catch (error) { next(error); }
});

app.get("/api/admin/products", requireDatabase, admin, async (req, res, next) => {
  try {
    const { data, error } = await serviceClient.from("products").select("*, categories(name, slug)").order("created_at", { ascending: false });
    if (error) return next(error);
    res.json({ items: data.map(toProduct), count: data.length });
  } catch (error) { next(error); }
});

app.post("/api/admin/products", requireDatabase, admin, async (req, res, next) => {
  const { slug, name, category_slug: categorySlug, price, original_price: originalPrice, image_url: imageUrl, description, stock } = req.body || {};
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || typeof name !== "string" || !name.trim() || name.length > 200 || typeof categorySlug !== "string") {
    return res.status(400).json({ error: "Valid slug, name, and category_slug are required." });
  }
  if (price !== null && price !== undefined && (!Number.isFinite(Number(price)) || Number(price) < 0)) return res.status(400).json({ error: "price must be null or a non-negative number." });
  if (originalPrice !== null && originalPrice !== undefined && (!Number.isFinite(Number(originalPrice)) || Number(originalPrice) < 0)) return res.status(400).json({ error: "original_price must be null or a non-negative number." });
  if (stock !== null && stock !== undefined && (!Number.isInteger(stock) || stock < 0)) return res.status(400).json({ error: "stock must be null or a non-negative integer." });
  if (imageUrl !== undefined && imageUrl !== null && (typeof imageUrl !== "string" || !/^https:\/\//.test(imageUrl))) return res.status(400).json({ error: "image_url must be null or an https URL." });
  if (description !== undefined && description !== null && (typeof description !== "string" || description.length > 10000)) return res.status(400).json({ error: "description must be 10000 characters or fewer." });
  try {
    const { data, error } = await serviceClient.from("products").insert({
      slug, name: name.trim(), category_slug: categorySlug, price: price ?? null,
      original_price: originalPrice ?? null, image_url: imageUrl || null, description: description || null,
      stock: stock ?? null, is_active: true,
    }).select("*, categories(name, slug)").single();
    if (error) return next(error);
    res.status(201).json({ item: toProduct(data) });
  } catch (error) { next(error); }
});

app.patch("/api/admin/products/:id", requireDatabase, admin, async (req, res, next) => {
  const fields = ["slug", "name", "category_slug", "price", "original_price", "image_url", "description", "stock", "is_active"];
  const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => fields.includes(key)));
  if (!Object.keys(patch).length) return res.status(400).json({ error: "No editable product fields provided." });
  if (patch.slug !== undefined && (typeof patch.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(patch.slug))) return res.status(400).json({ error: "slug must contain lowercase letters, numbers, and hyphens." });
  if (patch.name !== undefined && (typeof patch.name !== "string" || !patch.name.trim() || patch.name.length > 200)) return res.status(400).json({ error: "name must be 1 to 200 characters." });
  if (patch.category_slug !== undefined && (typeof patch.category_slug !== "string" || !patch.category_slug)) return res.status(400).json({ error: "category_slug must be a non-empty string." });
  if (patch.price !== undefined && patch.price !== null && (!Number.isFinite(Number(patch.price)) || Number(patch.price) < 0)) return res.status(400).json({ error: "price must be null or a non-negative number." });
  if (patch.original_price !== undefined && patch.original_price !== null && (!Number.isFinite(Number(patch.original_price)) || Number(patch.original_price) < 0)) return res.status(400).json({ error: "original_price must be null or a non-negative number." });
  if (patch.stock !== undefined && patch.stock !== null && (!Number.isInteger(patch.stock) || patch.stock < 0)) return res.status(400).json({ error: "stock must be null or a non-negative integer." });
  if (patch.image_url !== undefined && patch.image_url !== null && (typeof patch.image_url !== "string" || !/^https:\/\//.test(patch.image_url))) return res.status(400).json({ error: "image_url must be null or an https URL." });
  if (patch.description !== undefined && patch.description !== null && (typeof patch.description !== "string" || patch.description.length > 10000)) return res.status(400).json({ error: "description must be 10000 characters or fewer." });
  if (patch.is_active !== undefined && typeof patch.is_active !== "boolean") return res.status(400).json({ error: "is_active must be a boolean." });
  try {
    const { data, error } = await serviceClient.from("products").update(patch).eq("id", req.params.id)
      .select("*, categories(name, slug)").maybeSingle();
    if (error) return next(error);
    if (!data) return res.status(404).json({ error: "Product not found." });
    res.json({ item: toProduct(data) });
  } catch (error) { next(error); }
});

app.delete("/api/admin/products/:id", requireDatabase, admin, async (req, res, next) => {
  try {
    const { data, error } = await serviceClient.from("products").update({ is_active: false }).eq("id", req.params.id).select("id").maybeSingle();
    if (error) return next(error);
    if (!data) return res.status(404).json({ error: "Product not found." });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get("/api/admin/orders", requireDatabase, admin, async (req, res, next) => {
  try {
    let query = serviceClient.from("orders").select("id, order_number, user_id, status, payment_status, currency, subtotal, shipping_fee, total, shipping_address, created_at, order_items(id, product_name, product_image, quantity, unit_price, line_total)").order("created_at", { ascending: false });
    if (req.query.status) query = query.eq("status", String(req.query.status));
    const { data, error } = await query;
    if (error) return next(error);
    res.json({ items: data, count: data.length });
  } catch (error) { next(error); }
});

app.patch("/api/admin/orders/:id", requireDatabase, admin, async (req, res, next) => {
  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(req.body?.status)) return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}.` });
  try {
    const { data, error } = await serviceClient.rpc("update_order_status", {
      p_order_id: req.params.id,
      p_status: req.body.status,
    });
    if (error) return next(error);
    res.json({ item: data });
  } catch (error) { next(error); }
});

app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.message === "Origin is not allowed by CORS.") return res.status(403).json({ error: error.message });
  if (error.code === "23505") return res.status(409).json({ error: "A record with that unique value already exists." });
  if (error.code === "23503") return res.status(400).json({ error: "The referenced record does not exist." });
  if (error.code === "22P02") return res.status(400).json({ error: "A request identifier or value has an invalid format." });
  if (error.code === "P0001") {
    if (error.message === "Order not found") return res.status(404).json({ error: error.message });
    if (error.message === "Cancelled orders cannot be reopened") return res.status(409).json({ error: error.message });
    return res.status(409).json({ error: error.message });
  }
  if (process.env.NODE_ENV !== "production") console.error(error);
  res.status(500).json({ error: process.env.NODE_ENV === "production" ? "Internal server error." : error.message });
});

module.exports = app;