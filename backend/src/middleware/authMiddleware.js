// backend/src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// PROTECT: checks that a valid JWT was sent, and attaches the user to req
const protect = async (req, res, next) => {
  let token;

  // JWTs are sent in the header like: "Authorization: Bearer eyJhbGc..."
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      // Split "Bearer eyJhbGc..." into ["Bearer", "eyJhbGc..."] and take the token part
      token = authHeader.split(" ")[1];

      // Verify the token's signature using our secret key
      // This throws an error automatically if the token is invalid, tampered, or expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded contains { id, role, iat, exp } — we use the id to fetch the real user
      // We exclude the password field using .select("-password") for safety
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User belonging to this token no longer exists",
        });
      }

      // Attach the user document to req, so every controller after this
      // can access req.user directly, without re-querying the database
      req.user = user;

      next(); // everything checked out — let the request continue
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid or expired token",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

// AUTHORIZE: checks that the logged-in user's role is allowed
// Usage: authorize("admin") or authorize("admin", "driver")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user was set by protect() above — this middleware assumes
    // protect() already ran first
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };