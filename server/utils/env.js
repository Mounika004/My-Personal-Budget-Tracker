/**
 * Loads .env and sets safe defaults so app never crashes in dev.
 */
const dotenv = require("dotenv");
function loadEnv() {
  dotenv.config();
  process.env.MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/personal_budget_tracker";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
}
module.exports = { loadEnv };
