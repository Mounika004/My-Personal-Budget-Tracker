// server/app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");

const app = express();

/* ---------- Basic config ---------- */
app.set("trust proxy", 1); // Render/Proxies
app.use(compression());
app.use(express.json({ limit: "2mb" }));

/* ---------- CORS (prod-hardened) ---------- */
const defaultDevOrigins = ["http://localhost:3000"];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow server-to-server/no Origin (curl, SSR) and local dev when no ALLOWED_ORIGINS set
      if (!origin) return cb(null, true);
      if (
        allowedOrigins.length === 0
          ? defaultDevOrigins.includes(origin) // dev default
          : allowedOrigins.includes(origin) // allowlist in prod
      ) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS: " + origin));
    },
    methods: "GET,POST,PATCH,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

/* ---------- Health check (used by Render) ---------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* ---------- API routes ---------- */
// Adjust the require path if your file is named differently (e.g., './routes/userRoutes')
const userRouter = require("./routes/user");
app.use("/api/user", userRouter);

/* ---------- 404 & error handlers ---------- */
app.use((req, res) => res.status(404).json({ msg: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err && (err.stack || err.message || err));
  const status = err.status || 500;
  res.status(status).json({ msg: err.message || "Server error" });
});

/* ---------- Mongo connection ---------- */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/budget-tracker";

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    // Don’t crash on boot if DB is temporarily unavailable (e.g., Render cold start).
    console.error("MongoDB connection error:", err.message);
  });

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
});

/* ---------- Graceful shutdown ---------- */
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing HTTP server and Mongo connection…");
  mongoose.connection.close(false).finally(() => process.exit(0));
});
