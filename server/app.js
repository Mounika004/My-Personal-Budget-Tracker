const express = require("express");
const cors = require("cors");
const { loadEnv } = require("./utils/env");
const { connectDB } = require("./Db/connection");
const { corsOptions } = require("./utils/cors");

loadEnv();
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

connectDB();

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/user", require("./routes/userRoute"));

app.use((err, req, res, next) => {
  console.error("Unhandled:", err);
  res.status(500).json({ msg: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));
