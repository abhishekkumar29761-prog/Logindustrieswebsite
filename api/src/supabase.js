const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configured = Boolean(url && anonKey && serviceRoleKey);

const authClient = url && anonKey
  ? createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const serviceClient = configured
  ? createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

module.exports = { authClient, configured, serviceClient };