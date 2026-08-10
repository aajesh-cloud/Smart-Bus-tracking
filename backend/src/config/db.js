// backend/src/config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongoose.connect() uses our MONGO_URI from the .env file
    // to establish a connection to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    // If connection fails (wrong password, network issue, etc.)
    // we log the error and stop the server entirely,
    // because the app is useless without a database
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;