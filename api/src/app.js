const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const multer = require("multer");
const { randomUUID } = require("node:crypto");
const { authClient, configured, serviceClient } = require("./supabase");
const { authenticate } = require("./middleware/auth");

const app = express();
const maxProductImages = 50;
const maxImagesPerUpload = 10;
app.locals.isAllowedProductImageType = isAllowedProductImageType;
app.locals.isValidProductImages = validateImages;
app.locals.maxProductImages = maxProductImages;
const allowedOrigins = new Set([
  "https://logindustries.com",
  "https://www.logindustries.com",
  ...(process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
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
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
function isAllowedProductImageType(mimetype) {
  return allowedImageTypes.has(mimetype);
}

const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 10 },
  fileFilter(req, file, callback) {
    if (!isAllowedProductImageType(file.mimetype)) return callback(new Error("Only JPG, PNG, and WebP images are allowed."));
    callback(null, true);
  },
});

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

function validateProductReview(input) {
  const { rating, title, body } = input || {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be a whole number from 1 to 5." };
  }
  if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 120) {
    return { error: "Review title must be between 3 and 120 characters." };
  }
  if (typeof body !== "string" || body.trim().length < 10 || body.trim().length > 2000) {
    return { error: "Review must be between 10 and 2000 characters." };
  }
  return { value: { rating, title: title.trim(), body: body.trim() } };
}

app.locals.validateProductReview = validateProductReview;

function isProductStorageImage(value) {
  if (typeof value !== "string") return false;
  try {
    const imageUrl = new URL(value);
    const supabaseOrigin = new URL(process.env.SUPABASE_URL).origin;
    return imageUrl.origin === supabaseOrigin
      && imageUrl.pathname.startsWith("/storage/v1/object/public/product-images/");
  } catch {
    return false;
  }
}

function toProduct(row) {
  const images = Array.isArray(row.images) ? row.images.filter(isProductStorageImage) : [];
  const mainImage = (isProductStorageImage(row.image_url) ? row.image_url : null) || images[0] || null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.categories?.name || "",
    category_slug: row.category_slug,
    categorySlug: row.category_slug,
    price: row.price === null ? null : Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    image: mainImage,
    images: images.length ? images : (mainImage ? [mainImage] : []),
    description: row.description || "",
    stock: row.stock,
    active: row.is_active,
  };
}

function hasValidImageSignature(file) {
  const { mimetype, buffer } = file;
  if (mimetype === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimetype === "image/webp") return buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return false;
}

function validateImages(images) {
  return Array.isArray(images) && images.length <= maxProductImages
    && images.every((image) => typeof image === "string" && /^https:\/\//.test(image));
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
    if (error) {
      const message = String(error.message || "").toLowerCase();
      if (message.includes("email not confirmed")) {
        return res.status(403).json({ error: "Confirm this email address before signing in." });
      }
      if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
        return res.status(401).json({ error: "Email or password is incorrect." });
      }
      if (message.includes("too many requests") || message.includes("rate limit")) {
        return res.status(429).json({ error: "Too many sign-in attempts. Wait and try again." });
      }
      return res.status(401).json({ error: "Sign-in could not be completed. Check the account credentials." });
    }
    const { data: profile, error: profileError } = await serviceClient.from("profiles")
      .select("id, full_name, phone, shipping_address, role").eq("id", data.user.id).maybeSingle();
    if (profileError) return next(profileError);
    if (!profile) return res.status(403).json({ error: "Account profile is not provisioned." });
    res.json({ user: data.user, profile, session: data.session });
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("fetch failed") || message.includes("failed to fetch") || message.includes("enotfound")) {
      return res.status(503).json({ error: "Authentication service is unavailable. Check the Supabase configuration." });
    }
    next(error);
  }
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
    res.json({ items: data.map((category) => ({
      ...category,
      image_url: isProductStorageImage(category.image_url) ? category.image_url : null,
      image: isProductStorageImage(category.image_url) ? category.image_url : null,
    })), count: data.length });
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

app.get("/api/products/:slug/reviews", requireDatabase, async (req, res, next) => {
  try {
    const { data: product, error: productError } = await serviceClient.from("products")
      .select("id").eq("slug", req.params.slug).eq("is_active", true).maybeSingle();
    if (productError) return next(productError);
    if (!product) return res.status(404).json({ error: "Product not found." });

    const { data, error, count } = await serviceClient.from("product_reviews")
      .select("id, rating, title, body, created_at, profiles(full_name)", { count: "exact" })
      .eq("product_id", product.id).eq("status", "approved").order("created_at", { ascending: false });
    if (error) return next(error);
    res.json({
      items: data.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        customer_name: review.profiles?.full_name?.trim().split(/\s+/)[0] || "Verified customer",
        verified_purchase: true,
        created_at: review.created_at,
      })),
      count: count || 0,
    });
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

app.get("/api/account/reviews", requireDatabase, customer, async (req, res, next) => {
  try {
    const { data, error } = await serviceClient.from("product_reviews")
      .select("id, rating, title, body, status, created_at, updated_at, products(name, slug, image_url)")
      .eq("user_id", req.user.id).order("updated_at", { ascending: false });
    if (error) return next(error);
    res.json({ items: data, count: data.length });
  } catch (error) { next(error); }
});

app.post("/api/account/products/:slug/review", requireDatabase, customer, async (req, res, next) => {
  const validated = validateProductReview(req.body);
  if (validated.error) return res.status(400).json({ error: validated.error });
  try {
    const { data: product, error: productError } = await serviceClient.from("products")
      .select("id").eq("slug", req.params.slug).eq("is_active", true).maybeSingle();
    if (productError) return next(productError);
    if (!product) return res.status(404).json({ error: "Product not found." });

    const { data: orders, error: ordersError } = await serviceClient.from("orders")
      .select("id").eq("user_id", req.user.id).eq("status", "delivered");
    if (ordersError) return next(ordersError);
    const orderIds = orders.map((order) => order.id);
    if (!orderIds.length) return res.status(403).json({ error: "Only customers who received this product can review it." });

    const { data: purchasedItem, error: itemError } = await serviceClient.from("order_items")
      .select("id").eq("product_id", product.id).in("order_id", orderIds).limit(1).maybeSingle();
    if (itemError) return next(itemError);
    if (!purchasedItem) return res.status(403).json({ error: "Only customers who received this product can review it." });

    const { data, error } = await serviceClient.from("product_reviews").upsert({
      product_id: product.id,
      user_id: req.user.id,
      order_item_id: purchasedItem.id,
      ...validated.value,
      status: "pending",
    }, { onConflict: "product_id,user_id" })
      .select("id, rating, title, body, status, created_at, updated_at").single();
    if (error) return next(error);
    res.status(201).json({ item: data, message: "Your review was submitted for approval." });
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

app.post("/api/admin/uploads", admin, requireDatabase, productImageUpload.array("files", maxImagesPerUpload), async (req, res, next) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: "Select at least one image to upload." });
  if (files.some((file) => !hasValidImageSignature(file))) {
    return res.status(400).json({ error: "One or more files are not valid JPG, PNG, or WebP images." });
  }
  try {
    const items = [];
    for (const file of files) {
      const extension = file.mimetype === "image/jpeg" ? "jpg" : file.mimetype.slice("image/".length);
      const path = `${randomUUID()}.${extension}`;
      const { error } = await serviceClient.storage.from("product-images").upload(path, file.buffer, {
        contentType: file.mimetype, cacheControl: "31536000", upsert: false,
      });
      if (error) return next(error);
      const { data } = serviceClient.storage.from("product-images").getPublicUrl(path);
      items.push({ url: data.publicUrl, path });
    }
    res.status(201).json({ items });
  } catch (error) { next(error); }
});

app.delete("/api/admin/uploads", requireDatabase, admin, async (req, res, next) => {
  let url;
  try { url = new URL(req.body?.url); } catch { return res.status(400).json({ error: "Provide a valid product image URL." }); }
  const supabaseUrl = new URL(process.env.SUPABASE_URL);
  const prefix = "/storage/v1/object/public/product-images/";
  if (url.origin !== supabaseUrl.origin || !url.pathname.startsWith(prefix)) {
    return res.status(400).json({ error: "Only images in the product-images bucket can be removed." });
  }
  const path = decodeURIComponent(url.pathname.slice(prefix.length));
  if (!path || path.split("/").some((part) => part === "..")) {
    return res.status(400).json({ error: "The product image URL is invalid." });
  }
  try {
    const { error } = await serviceClient.storage.from("product-images").remove([path]);
    if (error) return next(error);
    res.status(204).end();
  } catch (error) { next(error); }
});

app.post("/api/admin/products", requireDatabase, admin, async (req, res, next) => {
  const { slug, name, category_slug: categorySlug, price, original_price: originalPrice, image_url: imageUrl, images, description, stock, is_active: isActive } = req.body || {};
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || typeof name !== "string" || !name.trim() || name.length > 200 || typeof categorySlug !== "string") {
    return res.status(400).json({ error: "Valid slug, name, and category_slug are required." });
  }
  if (price !== null && price !== undefined && (!Number.isFinite(Number(price)) || Number(price) < 0)) return res.status(400).json({ error: "price must be null or a non-negative number." });
  if (originalPrice !== null && originalPrice !== undefined && (!Number.isFinite(Number(originalPrice)) || Number(originalPrice) < 0)) return res.status(400).json({ error: "original_price must be null or a non-negative number." });
  if (stock !== null && stock !== undefined && (!Number.isInteger(stock) || stock < 0)) return res.status(400).json({ error: "stock must be null or a non-negative integer." });
  if (imageUrl !== undefined && imageUrl !== null && (typeof imageUrl !== "string" || !/^https:\/\//.test(imageUrl))) return res.status(400).json({ error: "image_url must be null or an https URL." });
  if (images !== undefined && !validateImages(images)) return res.status(400).json({ error: `images must be an array of up to ${maxProductImages} https URLs.` });
  if (description !== undefined && description !== null && (typeof description !== "string" || description.length > 10000)) return res.status(400).json({ error: "description must be 10000 characters or fewer." });
  if (isActive !== undefined && typeof isActive !== "boolean") return res.status(400).json({ error: "is_active must be a boolean." });
  try {
    const { data, error } = await serviceClient.from("products").insert({
      slug, name: name.trim(), category_slug: categorySlug, price: price ?? null,
      original_price: originalPrice ?? null, images: images ?? (imageUrl ? [imageUrl] : []),
      image_url: images ? (images[0] || null) : (imageUrl || null), description: description || null,
      stock: stock ?? null, is_active: isActive ?? true,
    }).select("*, categories(name, slug)").single();
    if (error) return next(error);
    res.status(201).json({ item: toProduct(data) });
  } catch (error) { next(error); }
});

app.patch("/api/admin/products/:id", requireDatabase, admin, async (req, res, next) => {
  const fields = ["slug", "name", "category_slug", "price", "original_price", "image_url", "images", "description", "stock", "is_active"];
  const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => fields.includes(key)));
  if (!Object.keys(patch).length) return res.status(400).json({ error: "No editable product fields provided." });
  if (patch.slug !== undefined && (typeof patch.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(patch.slug))) return res.status(400).json({ error: "slug must contain lowercase letters, numbers, and hyphens." });
  if (patch.name !== undefined && (typeof patch.name !== "string" || !patch.name.trim() || patch.name.length > 200)) return res.status(400).json({ error: "name must be 1 to 200 characters." });
  if (patch.category_slug !== undefined && (typeof patch.category_slug !== "string" || !patch.category_slug)) return res.status(400).json({ error: "category_slug must be a non-empty string." });
  if (patch.price !== undefined && patch.price !== null && (!Number.isFinite(Number(patch.price)) || Number(patch.price) < 0)) return res.status(400).json({ error: "price must be null or a non-negative number." });
  if (patch.original_price !== undefined && patch.original_price !== null && (!Number.isFinite(Number(patch.original_price)) || Number(patch.original_price) < 0)) return res.status(400).json({ error: "original_price must be null or a non-negative number." });
  if (patch.stock !== undefined && patch.stock !== null && (!Number.isInteger(patch.stock) || patch.stock < 0)) return res.status(400).json({ error: "stock must be null or a non-negative integer." });
  if (patch.image_url !== undefined && patch.image_url !== null && (typeof patch.image_url !== "string" || !/^https:\/\//.test(patch.image_url))) return res.status(400).json({ error: "image_url must be null or an https URL." });
  if (patch.images !== undefined && !validateImages(patch.images)) return res.status(400).json({ error: `images must be an array of up to ${maxProductImages} https URLs.` });
  if (patch.images !== undefined) patch.image_url = patch.images[0] || null;
  else if (patch.image_url !== undefined) patch.images = patch.image_url ? [patch.image_url] : [];
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
    const { data, error } = await serviceClient.from("products").delete().eq("id", req.params.id).select("id").maybeSingle();
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

app.get("/api/admin/reviews", requireDatabase, admin, async (req, res, next) => {
  const statuses = ["pending", "approved", "rejected"];
  if (req.query.status && !statuses.includes(String(req.query.status))) {
    return res.status(400).json({ error: `status must be one of: ${statuses.join(", ")}.` });
  }
  try {
    let query = serviceClient.from("product_reviews")
      .select("id, rating, title, body, status, created_at, profiles(full_name), products(name, slug)")
      .order("created_at", { ascending: false });
    if (req.query.status) query = query.eq("status", String(req.query.status));
    const { data, error } = await query;
    if (error) return next(error);
    res.json({ items: data, count: data.length });
  } catch (error) { next(error); }
});

app.patch("/api/admin/reviews/:id", requireDatabase, admin, async (req, res, next) => {
  const { status } = req.body || {};
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status must be approved or rejected." });
  }
  try {
    const { data, error } = await serviceClient.from("product_reviews")
      .update({ status }).eq("id", req.params.id)
      .select("id, rating, title, body, status, created_at, profiles(full_name), products(name, slug)").maybeSingle();
    if (error) return next(error);
    if (!data) return res.status(404).json({ error: "Review not found." });
    res.json({ item: data });
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
  const errorDetails = [error.message, error.details, error.hint].filter(Boolean).join(" ");
  if ((error.code === "42P01" || error.code === "PGRST205")
      && /\bproduct_reviews\b/i.test(errorDetails)
      && /(does not exist|not found|schema cache|could not find)/i.test(errorDetails)) {
    return res.status(503).json({
      error: "Product reviews are not set up. Run migration 202611210001_product_reviews.sql in Supabase.",
    });
  }
  if ((error.code === "42703" || error.code === "PGRST204")
      && /\bimages\b/i.test(errorDetails)
      && /(does not exist|not found|schema cache|could not find)/i.test(errorDetails)) {
    return res.status(503).json({
      error: "The products.images column is missing. Run migration 202611010001_product_images.sql in Supabase.",
    });
  }
  if (error.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "Each image must be 2 MB or smaller." });
  if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") return res.status(400).json({ error: `Upload up to ${maxImagesPerUpload} images at a time using the files field.` });
  if (error.message === "Only JPG, PNG, and WebP images are allowed.") return res.status(400).json({ error: error.message });
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