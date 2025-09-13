// client/src/components/Dashboard/MiddleDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import AddExpense from "./popups/addExpense";
import SettleUp from "./popups/settleUp";
import EditExpense from "./popups/EditExpense";
import Confirm from "./popups/Confirm";
import CategoryChart from "./CategoryChart";

import { computeFromExpenses, formatCurrency } from "../../utils/finance";
import { loadMe, deleteExpense } from "../../data/meApi";
import { toCSV } from "../../utils/csv"; // ⬅️ only export kept; no parseCSV

import { getFriendLabel } from "../../utils/friends";
import "../../styles/dashboard.css";

function niceName(email, me) {
  if (!email) return "";
  if (me?.email && email === me.email && me.username) return me.username;
  const local = String(email).split("@")[0];
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function labelFor(id, me) {
  return getFriendLabel(id) || niceName(id, me) || id;
}

const targetKey = (email, y, m) => `monthly_target_${email || "me"}_${y}_${m}`;

export default function MiddleDashboard({
  externalShowAdd,
  externalShowSettle,
  onCloseAdd,
  onCloseSettle,
  onOpenAdd,
  onOpenSettle,
}) {
  const { loading, me, expenses, categories } = useSelector((s) => s.me);

  const [showAdd, setShowAdd] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth());
  const [catFilter, setCatFilter] = useState("");

  useEffect(() => setShowAdd(!!externalShowAdd), [externalShowAdd]);
  useEffect(() => setShowSettle(!!externalShowSettle), [externalShowSettle]);
  useEffect(() => {
    loadMe();
  }, []);

  const stats = useMemo(
    () =>
      computeFromExpenses(me?.email, expenses, {
        monthFilter: month,
        categoryFilter: catFilter || null,
      }),
    [me, expenses, month, catFilter]
  );
  const { totals, recent, chart } = stats;

  // ----- monthly target (persist per user+month) -----
  const y = new Date().getFullYear();
  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem(targetKey(me?.email, y, month));
    return saved ? Number(saved) : 2000;
  });
  useEffect(() => {
    const saved = localStorage.getItem(targetKey(me?.email, y, month));
    setTarget(saved ? Number(saved) : 2000);
  }, [me?.email, month]);
  const saveTarget = () => {
    localStorage.setItem(targetKey(me?.email, y, month), String(target || 0));
  };
  const progressPct =
    target > 0 ? Math.min(100, (chart.total / target) * 100) : 0;

  // Export CSV (kept)
  const exportCSV = () => {
    const csv = toCSV(expenses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expenses.csv";
    a.click();
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <main className="middle">
      {/* Filters + tools */}
      <section className="quick-actions">
        <div className="qa-left">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m, 1).toLocaleString("en-US", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="qa-right">
          <button
            className="btn"
            onClick={() => {
              setShowAdd(true);
              onOpenAdd && onOpenAdd();
            }}
          >
            + Add Expense
          </button>
          <button
            className="btn outline"
            onClick={() => {
              setShowSettle(true);
              onOpenSettle && onOpenSettle();
            }}
          >
            Settle Up
          </button>
          <button className="btn ghost" onClick={exportCSV}>
            Export CSV
          </button>
          {/* Import CSV removed intentionally */}
        </div>
      </section>

      {/* Stat cards */}
      <section className="cards">
        <div className="card glass">
          <div className="card-top">
            <span className="chip green">Total Balance</span>
          </div>
          <div className={`big ${loading ? "skel" : ""}`}>
            {formatCurrency(totals.totalBalance)}
          </div>
          <div className="mini">{loading ? "Loading…" : "Net of owe/owed"}</div>
        </div>

        <div className="card glass">
          <div className="card-top">
            <span className="chip red">You Owe</span>
          </div>
          <div className={`big ${loading ? "skel" : ""}`}>
            {formatCurrency(totals.youOwe)}
          </div>
          <div className="mini">
            {loading ? "Loading…" : "What you need to pay"}
          </div>
        </div>

        <div className="card glass">
          <div className="card-top">
            <span className="chip blue">Owed to You</span>
          </div>
          <div className={`big ${loading ? "skel" : ""}`}>
            {formatCurrency(totals.owedToMe)}
          </div>
          <div className="mini">
            {loading ? "Loading…" : "What others owe you"}
          </div>
        </div>

        {/* Monthly target card */}
        <div className="card glass wide">
          <div
            className="card-top"
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span className="chip">Monthly Spend</span>
              <span className="mini" style={{ marginLeft: 8 }}>
                {new Date(2000, month, 1).toLocaleString("en-US", {
                  month: "long",
                })}
              </span>
            </div>
            <div className="mini">
              Target:&nbsp;
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                onBlur={saveTarget}
                style={{
                  width: 90,
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--input)",
                  color: "var(--text)",
                }}
              />
            </div>
          </div>
          <div className="progress">
            <div className="bar" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mini">
            {formatCurrency(chart.total)} (your share) of{" "}
            {formatCurrency(target)} — {Math.round(progressPct)}% used
          </div>
        </div>
      </section>

      {/* Panels */}
      <section className="panels">
        <div className="panel glass">
          <div className="panel-head">
            <h3 style={{ margin: 0 }}>Recent Activity</h3>
            <button className="btn outline" onClick={() => loadMe()}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="skel" style={{ height: 140 }} />
          ) : recent.length === 0 ? (
            <div className="mini">No activity for the current filters.</div>
          ) : (
            <ul className="activity">
              {recent.map((r) => {
                const isSettle =
                  String(r.category).toLowerCase() === "transfers" &&
                  /^settlement/i.test(String(r.description || ""));

                // Show net for settlements (posted amount is 2×)
                const shownAmount = isSettle
                  ? Math.round((Number(r.amount) || 0) / 2)
                  : r.amount;

                // Pretty description: "Settlement with <Name>"
                let displayDesc = r.description || "";
                if (isSettle) {
                  const m = /Settlement with\s+(.+)$/i.exec(displayDesc);
                  if (m && m[1]) {
                    const id = m[1].trim();
                    displayDesc = `Settlement with ${labelFor(id, me)}`;
                  }
                }

                return (
                  <li key={r.id}>
                    <span className="dot blue" />
                    <span>
                      <b>{displayDesc}</b> — {formatCurrency(shownAmount)}
                      <span className="mini" style={{ marginLeft: 8 }}>
                        by {niceName(r.paidBy, me)} • {r.category}
                      </span>
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn ghost"
                        onClick={() => setEditItem(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn outline"
                        onClick={() => setConfirmDel(r)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <CategoryChart data={chart.data} total={chart.total} />
      </section>

      {/* Modals */}
      {showAdd && (
        <AddExpense
          onClose={() => {
            setShowAdd(false);
            onCloseAdd && onCloseAdd();
            loadMe();
          }}
        />
      )}
      {showSettle && (
        <SettleUp
          onClose={() => {
            setShowSettle(false);
            onCloseSettle && onCloseSettle();
            loadMe();
          }}
        />
      )}
      {editItem && (
        <EditExpense
          item={editItem}
          onClose={() => {
            setEditItem(null);
            loadMe();
          }}
        />
      )}
      {confirmDel && (
        <Confirm
          title="Delete expense?"
          subtitle={confirmDel.description}
          onCancel={() => setConfirmDel(null)}
          onConfirm={async () => {
            try {
              if (!confirmDel.id) throw new Error("Missing id (legacy item)");
              await deleteExpense(confirmDel.id);
            } finally {
              setConfirmDel(null);
              loadMe();
            }
          }}
        />
      )}
    </main>
  );
}
