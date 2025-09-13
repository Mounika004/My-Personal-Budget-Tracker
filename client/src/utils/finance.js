// Compute balances and chart data from raw expenses
// Rules:
// - Per-friend balances are pairwise: each participant owes payer (amount / participants.length)
// - "Transfers" category does NOT count toward monthly spend
// - "Monthly spend (your share)" sums only YOUR share for expenses that include you

function participantsOf(e) {
  let arr = [];
  if (e.splitWith) {
    arr = String(e.splitWith)
      .split(/[,\s]+/)
      .filter(Boolean);
  } else {
    arr = [e.paidBy];
    if (e.paidTo)
      arr = arr.concat(
        String(e.paidTo)
          .split(/[,\s]+/)
          .filter(Boolean)
      );
  }
  const uniq = Array.from(new Set(arr.map((s) => s.trim()))).filter(Boolean);
  // always include payer
  if (e.paidBy && !uniq.includes(e.paidBy)) uniq.push(e.paidBy);
  return uniq;
}

function sameMonth(d, m) {
  try {
    const dd = new Date(d);
    return dd.getMonth() === m;
  } catch {
    return false;
  }
}

export function formatCurrency(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function timeAgo(_d) {
  return "";
} // timestamps removed per request

export function computeFromExpenses(currentEmail, expenses = [], opts = {}) {
  const { monthFilter = new Date().getMonth(), categoryFilter = null } = opts;
  const list = Array.isArray(expenses) ? expenses : [];

  // ---- pairwise friend balances relative to current user ----
  const friendMap = new Map(); // email -> net (+ means they owe me)
  let youOwe = 0,
    owedToMe = 0;

  list.forEach((e) => {
    const parts = participantsOf(e);
    const amt = Number(e.amount || 0);
    if (!amt || !parts.length) return;
    const share = amt / parts.length;

    if (!currentEmail) return;

    if (e.paidBy === currentEmail) {
      parts.forEach((p) => {
        if (p === currentEmail) return;
        const v = (friendMap.get(p) || 0) + share;
        friendMap.set(p, v);
      });
    } else if (parts.includes(currentEmail)) {
      const v = (friendMap.get(e.paidBy) || 0) - share;
      friendMap.set(e.paidBy, v);
    }
  });

  const perFriend = Array.from(friendMap.entries())
    .map(([friend, value]) => ({ friend, value }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  perFriend.forEach((x) => {
    if (x.value > 0) owedToMe += x.value;
    if (x.value < 0) youOwe += Math.abs(x.value);
  });

  // ---- recent (filtered) ----
  const filtered = list.filter(
    (e) =>
      sameMonth(e.date, monthFilter) &&
      (!categoryFilter || e.category === categoryFilter)
  );
  const recent = [...filtered]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  // ---- monthly chart (your share, exclude Transfers) ----
  const chartMap = new Map(); // category -> amount (your share)
  let chartTotal = 0;

  filtered.forEach((e) => {
    if (String(e.category).toLowerCase() === "transfers") return;
    const parts = participantsOf(e);
    if (!currentEmail || !parts.includes(currentEmail)) return;
    const share = Number(e.amount || 0) / parts.length;
    const key = e.category || "Other";
    chartMap.set(key, (chartMap.get(key) || 0) + share);
    chartTotal += share;
  });

  const chart = {
    total: Math.round(chartTotal),
    data: Array.from(chartMap.entries())
      .map(([category, amount]) => ({ category, amount: Math.round(amount) }))
      .sort((a, b) => b.amount - a.amount),
  };

  return {
    totals: {
      youOwe: Math.round(youOwe),
      owedToMe: Math.round(owedToMe),
      totalBalance: Math.round(owedToMe - youOwe),
    },
    recent,
    chart,
    perFriend,
  };
}
