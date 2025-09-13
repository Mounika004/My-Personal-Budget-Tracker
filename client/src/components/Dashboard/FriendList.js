import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import "../../styles/frndPop.css";
import "../../styles/dashboard.css";
import { computeFromExpenses, formatCurrency } from "../../utils/finance";
import { loadMe, settleWithFriend } from "../../data/meApi";
import { getFriendLabel } from "../../utils/friends";

function niceNameFromEmail(email) {
  const local = String(email || "").split("@")[0];
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function labelFor(email) {
  return getFriendLabel(email) || niceNameFromEmail(email);
}

function Avatar({ label }) {
  const ch = (label || "?").trim().charAt(0).toUpperCase();
  return <div className="avatar small">{ch}</div>;
}

export default function FriendList() {
  const { me, expenses, friends = [] } = useSelector((s) => s.me);

  useEffect(() => {
    loadMe();
  }, []);

  // balances computed from expenses
  const { perFriend } = useMemo(
    () => computeFromExpenses(me?.email, expenses),
    [me, expenses]
  );

  // merge: show every friend (even with 0 balance) + anyone who appears in balances
  const balanceMap = new Map(perFriend.map((x) => [x.friend, x.value]));
  const emails = Array.from(
    new Set([...(friends || []), ...balanceMap.keys()])
  );

  const rows = emails
    .map((email) => ({
      email,
      label: labelFor(email),
      value: balanceMap.get(email) || 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <aside className="friend-list glass">
      <div className="friend-head">
        <h3 style={{ margin: 0 }}>Friends</h3>
        <span className="mini">Balances</span>
      </div>

      {rows.length === 0 ? (
        <div className="mini" style={{ padding: "0 16px 16px" }}>
          No balances yet.
        </div>
      ) : (
        <ul className="friend-items">
          {rows.map((f) => (
            <li key={f.email} className="friend-item">
              <div className="friend-left">
                <Avatar label={f.label} />
                <div className="friend-name">{f.label}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  className={`friend-balance ${
                    f.value > 0 ? "pos" : f.value < 0 ? "neg" : ""
                  }`}
                >
                  {f.value > 0
                    ? `+${formatCurrency(f.value)}`
                    : f.value < 0
                    ? `-${formatCurrency(Math.abs(f.value))}`
                    : formatCurrency(0)}
                </div>
                {f.value !== 0 && (
                  <button
                    className="btn ghost"
                    onClick={() => settleWithFriend(f.email, Math.abs(f.value))}
                  >
                    Settle
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
