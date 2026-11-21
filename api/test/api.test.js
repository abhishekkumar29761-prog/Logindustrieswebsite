process.env.SUPABASE_URL = "";
process.env.SUPABASE_ANON_KEY = "";
process.env.SUPABASE_SERVICE_ROLE_KEY = "";

const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");
const { authenticate } = require("../src/middleware/auth");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("health endpoint reports API availability without exposing configuration secrets", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.service, "logindustries-api");
  assert.equal(body.supabaseConfigured, false);
  assert.equal("serviceRoleKey" in body, false);
});

test("database-backed catalog fails closed when Supabase is not configured", async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.match(body.error, /Supabase is not configured/);
});

test("login CORS allows the official storefront domains", async () => {
  for (const origin of ["https://logindustries.com", "https://www.logindustries.com"]) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
  }
});

test("login CORS rejects unconfigured storefront domains", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "OPTIONS",
    headers: {
      Origin: "https://untrusted.example",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("admin upload endpoint rejects requests without an admin bearer token", async () => {
  const response = await fetch(`${baseUrl}/api/admin/uploads`, { method: "POST" });
  const body = await response.json();
  assert.equal(response.status, 401);
  assert.match(body.error, /Authentication token required/);
});

test("admin authorization rejects a customer profile", async () => {
  const middleware = authenticate("admin", {
    authClient: { auth: { getUser: async () => ({ data: { user: { id: "customer-1" } }, error: null }) } },
    serviceClient: {
      from: () => ({
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: { role: "customer" }, error: null }),
      }),
    },
  });
  let status;
  let responseBody;
  const response = {
    status(code) { status = code; return this; },
    json(body) { responseBody = body; return this; },
  };
  await middleware({ get: () => "Bearer valid-test-token" }, response, () => assert.fail("non-admin must not continue"));
  assert.equal(status, 403);
  assert.equal(responseBody.error, "Admin role required.");
});

test("product upload accepts only JPG, PNG, and WebP content types", () => {
  assert.equal(app.locals.isAllowedProductImageType("image/jpeg"), true);
  assert.equal(app.locals.isAllowedProductImageType("image/png"), true);
  assert.equal(app.locals.isAllowedProductImageType("image/webp"), true);
  assert.equal(app.locals.isAllowedProductImageType("image/gif"), false);
  assert.equal(app.locals.isAllowedProductImageType("application/pdf"), false);
});

test("products support up to 50 image URLs", () => {
  const images = Array.from({ length: 50 }, (_, index) => `https://example.com/${index}.jpg`);
  assert.equal(app.locals.maxProductImages, 50);
  assert.equal(app.locals.isValidProductImages(images), true);
  assert.equal(app.locals.isValidProductImages([...images, "https://example.com/51.jpg"]), false);
  assert.equal(app.locals.isValidProductImages(["not-a-url"]), false);
});

test("unknown API paths return a JSON 404", async () => {
  const response = await fetch(`${baseUrl}/api/not-a-route`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.equal(body.error, "Route not found.");
});

test("API sets security response headers", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-powered-by"), null);
});