const { authClient, serviceClient } = require("../supabase");

function authenticate(requiredRole) {
  return async (req, res, next) => {
    if (!authClient || !serviceClient) {
      return res.status(503).json({ error: "Authentication is not configured. Add Supabase environment variables." });
    }

    const authorization = req.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Bearer access token required." });

    try {
      const { data, error } = await authClient.auth.getUser(token);
      if (error || !data.user) return res.status(401).json({ error: "Invalid or expired access token." });
      const { data: profile, error: profileError } = await serviceClient
        .from("profiles")
        .select("id, full_name, phone, shipping_address, role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) return res.status(403).json({ error: "Account profile is not provisioned." });
      if (requiredRole && profile.role !== requiredRole) return res.status(403).json({ error: "Admin role required." });

      req.user = data.user;
      req.profile = profile;
      req.accessToken = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { authenticate };