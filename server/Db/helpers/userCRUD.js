const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase();
function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = {
  // ---------- AUTH ----------
  async AddUser(body, res) {
    try {
      const { username, email, password } = body;
      if (!username || !email || !password)
        return res.status(400).json({ msg: "Missing fields" });

      const normEmail = norm(email);
      const existing = await User.findOne({
        $or: [{ email: normEmail }, { username }],
      });
      if (existing)
        return res.status(409).json({
          msg:
            existing.email === normEmail
              ? "Email already exists"
              : "Username already exists",
        });

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email: normEmail,
        password: hash,
        friends: [],
        expensis: [],
      });
      const token = signToken(user);
      return res.status(201).json({
        user: { username, email: normEmail, friends: [], expensis: [] },
        token,
      });
    } catch (e) {
      if (
        e &&
        (e.code === 11000 ||
          (e.name === "MongoServerError" &&
            String(e.message).includes("E11000")))
      ) {
        const key = e.keyPattern?.email
          ? "Email"
          : e.keyPattern?.username
          ? "Username"
          : "Account";
        return res.status(409).json({ msg: `${key} already exists` });
      }
      console.error("Signup error:", e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  async login(body, res) {
    try {
      const email = norm(body.email);
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ msg: "Invalid credentials" });
      const ok = await bcrypt.compare(body.password, user.password);
      if (!ok) return res.status(401).json({ msg: "Invalid credentials" });
      const token = signToken(user);
      return res.json({
        user: {
          username: user.username,
          email: user.email,
          friends: user.friends,
          expensis: user.expensis,
        },
        token,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  async Find(username) {
    return await User.findOne({ username });
  },
  async GetByEmail(email) {
    return await User.findOne({ email: norm(email) });
  },

  // ---------- CRUD: FRIENDS ----------
  async AddFriend(email, friendEmail, res) {
    try {
      const meEmail = norm(email),
        frEmail = norm(friendEmail);
      if (meEmail === frEmail)
        return res.status(400).json({ msg: "Cannot add yourself as friend" });
      const me = await User.findOne({ email: meEmail });
      const fr = await User.findOne({ email: frEmail });
      if (!me || !fr) return res.status(404).json({ msg: "User not found" });
      if (!me.friends.includes(frEmail)) me.friends.push(frEmail);
      await me.save();
      return res.json({ friends: me.friends });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  // ---------- CRUD: EXPENSES ----------
  async AddExpense(email, expense, res) {
    try {
      const me = await User.findOne({ email: norm(email) });
      if (!me) return res.status(404).json({ msg: "User not found" });

      const doc = {
        id: Date.now().toString(36),
        description: expense.description || "Expense",
        amount: Number(expense.amount) || 0,
        paidBy: norm(expense.paidBy || email),
        paidTo: expense.paidTo || "",
        splitWith: expense.splitWith || "",
        category: expense.category || "Other",
        date: expense.date || new Date().toISOString(),
        settled: !!expense.settled,
        type: expense.type || "expense",
      };
      me.expensis.push(doc);
      await me.save();
      return res.json({ expensis: me.expensis });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  async EditExpense(email, id, patch, res) {
    try {
      const me = await User.findOne({ email: norm(email) });
      if (!me) return res.status(404).json({ msg: "User not found" });
      let found = false;
      me.expensis = me.expensis.map((x) => {
        if (x.id === id) {
          found = true;
          return {
            ...x,
            description: patch.description ?? x.description,
            amount:
              patch.amount !== undefined ? Number(patch.amount) : x.amount,
            paidBy: patch.paidBy !== undefined ? norm(patch.paidBy) : x.paidBy,
            paidTo: patch.paidTo !== undefined ? patch.paidTo : x.paidTo,
            splitWith:
              patch.splitWith !== undefined ? patch.splitWith : x.splitWith,
            category: patch.category ?? x.category,
            date: patch.date ?? x.date,
            settled: patch.settled !== undefined ? !!patch.settled : x.settled,
            type: patch.type ?? x.type,
          };
        }
        return x;
      });
      if (!found) return res.status(404).json({ msg: "Expense not found" });
      await me.save();
      return res.json({ expensis: me.expensis });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  async DeleteExpense(email, id, res) {
    try {
      const me = await User.findOne({ email: norm(email) });
      if (!me) return res.status(404).json({ msg: "User not found" });
      const before = me.expensis.length;
      me.expensis = me.expensis.filter((x) => x.id !== id);
      if (me.expensis.length === before)
        return res.status(404).json({ msg: "Expense not found" });
      await me.save();
      return res.json({ expensis: me.expensis });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  async SettleFriend(email, friendEmail, amount, res) {
    try {
      const me = await User.findOne({ email: norm(email) });
      if (!me) return res.status(404).json({ msg: "User not found" });
      const friend = norm(friendEmail);
      const amt = Math.max(0, Number(amount) || 0);
      if (!amt) return res.status(400).json({ msg: "Amount must be > 0" });

      // Model settlement as a "transfer": I paid 2*amt split between me and friend => friend owes me amt.
      const doc = {
        id: Date.now().toString(36),
        description: `Settlement with ${friend}`,
        amount: amt * 2,
        paidBy: norm(email),
        paidTo: friend,
        splitWith: `${email}, ${friend}`,
        category: "Transfers",
        date: new Date().toISOString(),
        settled: true,
        type: "transfer",
      };
      me.expensis.push(doc);
      await me.save();
      return res.json({ expensis: me.expensis });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  // ---------- CATEGORIES ----------
  async GetCategories(email, res) {
    try {
      const me = await User.findOne({ email: norm(email) });
      if (!me) return res.status(404).json({ msg: "User not found" });
      return res.json({ categories: me.categories || [] });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  async AddCategory(email, name, color, res) {
    try {
      const me = await User.findOne({ email: norm(email) });
      if (!me) return res.status(404).json({ msg: "User not found" });
      const exists = (me.categories || []).some(
        (c) => c.name.toLowerCase() === String(name).trim().toLowerCase()
      );
      if (exists)
        return res.status(409).json({ msg: "Category already exists" });
      me.categories.push({
        name: String(name).trim(),
        color: color || "#7c5cff",
      });
      await me.save();
      return res.json({ categories: me.categories });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },

  async RenameCategory(email, oldName, newName, color, res) {
    try {
      const me = await User.findOne({ email: norm(email) });
      if (!me) return res.status(404).json({ msg: "User not found" });
      const idx = (me.categories || []).findIndex(
        (c) => c.name.toLowerCase() === String(oldName).trim().toLowerCase()
      );
      if (idx === -1)
        return res.status(404).json({ msg: "Category not found" });
      me.categories[idx].name = String(newName).trim();
      if (color) me.categories[idx].color = color;

      // Optionally migrate existing expenses category name
      me.expensis = (me.expensis || []).map((e) =>
        e.category?.toLowerCase() === String(oldName).trim().toLowerCase()
          ? { ...e, category: newName }
          : e
      );

      await me.save();
      return res.json({ categories: me.categories, expensis: me.expensis });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ msg: "Server error" });
    }
  },
};
