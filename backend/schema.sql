-- Users (optional, for future auth)
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT UNIQUE,
name TEXT
);


-- Categories
CREATE TABLE IF NOT EXISTS categories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT UNIQUE NOT NULL
);


-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
type TEXT CHECK(type IN ('income','expense')) NOT NULL,
amount REAL NOT NULL,
category_id INTEGER,
date TEXT NOT NULL,
notes TEXT,
FOREIGN KEY(category_id) REFERENCES categories(id)
);


-- Budgets (monthly per category)
CREATE TABLE IF NOT EXISTS budgets (
id INTEGER PRIMARY KEY AUTOINCREMENT,
category_id INTEGER NOT NULL,
month TEXT NOT NULL, -- YYYY-MM
amount REAL NOT NULL,
UNIQUE(category_id, month),
FOREIGN KEY(category_id) REFERENCES categories(id)
);
