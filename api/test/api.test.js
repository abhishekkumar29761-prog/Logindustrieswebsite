process.env.SUPABASE_URL = "";
process.env.SUPABASE_ANON_KEY = "";
process.env.SUPABASE_SERVICE_ROLE_KEY = "";

const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

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