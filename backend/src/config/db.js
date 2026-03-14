const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is not set. Please configure it in your environment.");
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000
  });
}

module.exports = connectDB;
