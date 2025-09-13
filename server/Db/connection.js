const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { dbName: "personal_budget_tracker" });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
