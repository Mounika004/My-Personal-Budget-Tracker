const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const api = (path, opts = {}) =>
  fetch(`${window.API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    ...opts,
  }).then((r) => r.json());

// ====== UI helpers ======
function toast(msg) {
  let t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed",
    right: "24px",
    bottom: "96px",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    background: "var(--glass)",
    color: "var(--text)",
    borderRadius: "10px",
    backdropFilter: "blur(8px)",
  });
  document.body.appendChild(t);
  setTimeout(() => {
    t.remove();
  }, 2000);
}

function setMonthPill() {
  const month = new Date().toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  $("#monthPill").textContent = month;
}

function scrollToId(id) {
  document
    .querySelector(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
$$(".nav-link").forEach((b) =>
  b.addEventListener("click", () => scrollToId(b.dataset.scroll))
);

// Theme toggle
(function () {
  const key = "budget-theme";
  const root = document.documentElement;
  const saved = localStorage.getItem(key);
  if (saved) root.setAttribute("data-theme", saved);
  $("#themeToggle").addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", cur);
    localStorage.setItem(key, cur);
  });
})();

// ====== Data Fetchers ======
async function loadBudgets() {
  const data = await api("/api/budgets");
  const list = $("#budgetsList");
  const dl = $("#categories");
  list.innerHTML = "";
  dl.innerHTML = "";
  data.forEach((b) => {
    const usedPct =
      b.spent && b.amount
        ? Math.min(100, Math.round((b.spent / b.amount) * 100))
        : 0;
    const over = usedPct > 100;
    const card = document.createElement("div");
    card.className = "budget-card";
    card.innerHTML = `
      <div class="budget-head">
        <strong>${b.category}</strong>
        <span class="badge" style="color:${
          over ? "var(--danger)" : "var(--muted)"
        }">${b.spent.toFixed(2)} / ${b.amount.toFixed(2)}</span>
      </div>
      <div class="progress"><span style="width:${Math.min(
        100,
        usedPct
      )}%"></span></div>
    `;
    list.appendChild(card);

    const opt = document.createElement("option");
    opt.value = b.category;
    dl.appendChild(opt);
  });
}

async function loadSummary() {
  const {
    income = 0,
    expense = 0,
    byCategory = {},
  } = await api("/api/summary?month=current");
  $("#kpiIncome").textContent = income.toFixed(2);
  $("#kpiExpense").textContent = expense.toFixed(2);
  $("#kpiSavings").textContent = (income - expense).toFixed(2);

  // Charts
  const ctx1 = document.getElementById("incomeVsExpense");
  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{ data: [income, expense] }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });

  const ctx2 = document.getElementById("categoryPie");
  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory);
  new Chart(ctx2, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values }] },
    options: { responsive: true },
  });
}

async function loadTransactions() {
  const q = new URLSearchParams();
  const s = $("#search").value.trim();
  if (s) q.set("q", s);
  const t = $("#typeFilter").value;
  if (t !== "all") q.set("type", t);
  if ($("#fromDate").value) q.set("from", $("#fromDate").value);
  if ($("#toDate").value) q.set("to", $("#toDate").value);

  const rows = await api(`/api/transactions?${q.toString()}`);
  const tbody = $("#txTable tbody");
  tbody.innerHTML = "";
  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" style="text-align:center; color:var(--muted)">No transactions yet. Click the + button to add one.</td>`;
    tbody.appendChild(tr);
    return;
  }
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.date}</td><td>${r.type}</td><td>${
      r.category
    }</td><td class="num">${r.amount.toFixed(2)}</td><td>${r.notes || ""}</td>
    <td><button class="btn subtle btn-sm" data-id="${
      r.id
    }">Delete</button></td>`;
    tbody.appendChild(tr);
  });
}

// ====== Events ======
$("#txForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  body.amount = parseFloat(body.amount);
  await api("/api/transactions", {
    method: "POST",
    body: JSON.stringify(body),
  });
  e.target.reset();
  toast("Transaction added");
  await Promise.all([loadTransactions(), loadSummary(), loadBudgets()]);
  closeDrawer();
});

$("#budgetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  body.amount = parseFloat(body.amount);
  await api("/api/budgets", { method: "POST", body: JSON.stringify(body) });
  e.target.reset();
  toast("Budget saved");
  await loadBudgets();
});

$("#applyFilters").addEventListener("click", async () => {
  await loadTransactions();
});
$("#refreshBtn").addEventListener("click", async () => {
  await Promise.all([loadTransactions(), loadSummary(), loadBudgets()]);
  toast("Refreshed");
});

$("#txTable").addEventListener("click", async (e) => {
  if (e.target.matches("button[data-id]")) {
    const id = e.target.getAttribute("data-id");
    await api(`/api/transactions/${id}`, { method: "DELETE" });
    toast("Deleted");
    await Promise.all([loadTransactions(), loadSummary(), loadBudgets()]);
  }
});

// Drawer
const drawer = $("#drawer");
const addBtn = $("#addBtn");
const closeBtn = $("#closeDrawer");
function openDrawer() {
  drawer.classList.remove("hidden");
}
function closeDrawer() {
  drawer.classList.add("hidden");
}
addBtn.addEventListener("click", openDrawer);
closeBtn.addEventListener("click", closeDrawer);

// Init
(async function init() {
  setMonthPill();
  await Promise.all([loadSummary(), loadBudgets(), loadTransactions()]);
})();
