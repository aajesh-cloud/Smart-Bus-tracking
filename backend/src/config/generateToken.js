// backend/src/config/generateToken.js

const jwt = require("jsonwebtoken");

// Creates a signed JWT containing the user's ID and role
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role }, // the "payload" — data stored inside the token
    process.env.JWT_SECRET,      // the secret key used to sign it
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = generateToken;