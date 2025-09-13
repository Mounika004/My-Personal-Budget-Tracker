const app = require("express").Router();
const jwt = require("jsonwebtoken");
const userOperation = require("../Db/helpers/userCRUD");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }
}

// ---------- helpers ----------
async function ensureExpenseIds(userDoc) {
  let updated = false;
  const list = Array.isArray(userDoc.expensis) ? userDoc.expensis : [];
  userDoc.expensis = list.map((e) => {
    if (e && !e.id) {
      updated = true;
      return {
        ...e,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      };
    }
    return e;
  });
  if (updated) await userDoc.save();
}

// ---------- public ----------
app.post("/login", (req, res) => userOperation.login(req.body, res));
app.post("/signup", (req, res) => userOperation.AddUser(req.body, res));

// legacy
app.post("/getData", async (req, res) => {
  const r = await userOperation.Find(req.body.username);
  res.json(r || {});
});

// ---------- me ----------
app.get("/me", auth, async (req, res) => {
  try {
    const me = await userOperation.GetByEmail(req.user.email);
    if (!me) return res.status(404).json({ msg: "User not found" });

    // ✅ migrate: ensure every expense has a stable id
    await ensureExpenseIds(me);

    res.json({
      username: me.username,
      email: me.email,
      friends: me.friends || [],
      expensis: me.expensis || [],
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------- friends ----------
app.post("/friend/add", auth, (req, res) =>
  userOperation.AddFriend(req.user.email, req.body.friendEmail, res)
);

// ---------- expenses ----------
app.post("/expense/add", auth, (req, res) =>
  userOperation.AddExpense(req.user.email, req.body, res)
);

app.patch("/expense/:id", auth, (req, res) =>
  userOperation.EditExpense(req.user.email, req.params.id, req.body, res)
);

app.delete("/expense/:id", auth, (req, res) =>
  userOperation.DeleteExpense(req.user.email, req.params.id, res)
);

// ---------- settle per friend ----------
app.post("/settle/friend", auth, (req, res) =>
  userOperation.SettleFriend(
    req.user.email,
    req.body.friendEmail,
    req.body.amount,
    res
  )
);

// ---------- categories ----------
app.get("/categories", auth, (req, res) =>
  userOperation.GetCategories(req.user.email, res)
);
app.post("/category", auth, (req, res) =>
  userOperation.AddCategory(req.user.email, req.body.name, req.body.color, res)
);
app.patch("/category/:name", auth, (req, res) =>
  userOperation.RenameCategory(
    req.user.email,
    req.params.name,
    req.body.newName,
    req.body.color,
    res
  )
);

module.exports = app;
