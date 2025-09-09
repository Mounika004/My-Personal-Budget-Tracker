import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Simple CORS for GitHub Pages frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Run migrations if invoked with `npm run migrate` or on first run
async function migrate() {
  const db = await getDb();
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await db.exec(sql);
  await db.close();
  console.log("DB migrated");
}

if (process.argv[2] === "migrate") {
  migrate().then(() => process.exit(0));
}

// Helpers
const ensureCategory = async (db, name) => {
  if (!name) return null;
  const row = await db.get("SELECT id FROM categories WHERE name = ?", [name]);
  if (row) return row.id;
  const res = await db.run("INSERT INTO categories(name) VALUES (?)", [name]);
  return res.lastID;
};

// Transactions CRUD
app.get("/api/transactions", async (req, res) => {
  const db = await getDb();
  const { q, type, from, to } = req.query;
  const where = [];
  const params = [];
  if (type && ["income", "expense"].includes(type)) {
    where.push("t.type = ?");
    params.push(type);
  }
  if (from) {
    where.push("date >= ?");
    params.push(from);
  }
  if (to) {
    where.push("date <= ?");
    params.push(to);
  }
  if (q) {
    where.push('(coalesce(t.notes,"") LIKE ? OR c.name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  const sql = `SELECT t.id, t.type, t.amount, t.date, t.notes, c.name AS category
FROM transactions t LEFT JOIN categories c ON c.id = t.category_id
${where.length ? "WHERE " + where.join(" AND ") : ""}
ORDER BY date DESC, t.id DESC LIMIT 500`;
  const rows = await db.all(sql, params);
  res.json(rows);
});

app.post("/api/transactions", async (req, res) => {
  const db = await getDb();
  const { type, amount, category, date, notes } = req.body;
  const catId = await ensureCategory(db, category);
  const r = await db.run(
    "INSERT INTO transactions(type, amount, category_id, date, notes) VALUES (?,?,?,?,?)",
    [type, amount, catId, date, notes || null]
  );
  res.json({ id: r.lastID });
});

app.delete("/api/transactions/:id", async (req, res) => {
  const db = await getDb();
  await db.run("DELETE FROM transactions WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// Budgets
app.get("/api/budgets", async (req, res) => {
  const db = await getDb();
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const rows = await db.all(
    `
SELECT b.id, c.name AS category, b.amount,
coalesce((SELECT sum(amount) FROM transactions t WHERE t.category_id=b.category_id AND t.type='expense' AND substr(t.date,1,7)=b.month),0) AS spent
FROM budgets b JOIN categories c ON c.id=b.category_id
WHERE b.month = ?
ORDER BY c.name
`,
    [month]
  );
  res.json(rows);
});

app.post("/api/budgets", async (req, res) => {
  const db = await getDb();
  const month = new Date().toISOString().slice(0, 7);
  const { category, amount } = req.body;
  const catId = await ensureCategory(db, category);
  await db.run(
    "INSERT INTO budgets(category_id, month, amount) VALUES (?,?,?) ON CONFLICT(category_id,month) DO UPDATE SET amount=excluded.amount",
    [catId, month, amount]
  );
  res.json({ ok: true });
});

// Summary
app.get("/api/summary", async (req, res) => {
  const db = await getDb();
  const month =
    req.query.month === "current"
      ? new Date().toISOString().slice(0, 7)
      : req.query.month;
  const [{ income = 0 } = {}] = await db.all(
    "SELECT coalesce(sum(amount),0) as income FROM transactions WHERE type='income' AND substr(date,1,7)=?",
    [month]
  );
  const [{ expense = 0 } = {}] = await db.all(
    "SELECT coalesce(sum(amount),0) as expense FROM transactions WHERE type='expense' AND substr(date,1,7)=?",
    [month]
  );
  const catRows = await db.all(
    `SELECT c.name as category, coalesce(sum(t.amount),0) as spent
FROM categories c LEFT JOIN transactions t ON t.category_id=c.id AND t.type='expense' AND substr(t.date,1,7)=?
GROUP BY c.id
ORDER BY c.name`,
    [month]
  );
  const byCategory = Object.fromEntries(
    catRows.map((r) => [r.category, r.spent])
  );
  res.json({ month, income, expense, byCategory });
});

const port = process.env.PORT || 8080;
if (process.argv[2] !== "migrate") {
  app.listen(port, () => console.log(`API listening on :${port}`));
}
