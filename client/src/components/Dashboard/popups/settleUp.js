import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { settleWithFriend } from "../../../data/meApi";
import { computeFromExpenses, formatCurrency } from "../../../utils/finance";
import { getFriendLabel } from "../../../utils/friends";
import "../../../styles/frndPop.css";

function niceNameFromEmail(email) {
  const local = String(email || "").split("@")[0];
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function SettleUp({ onClose }) {
  const { me, expenses, friends = [] } = useSelector((s) => s.me);

  // --- Balances relative to current user
  const { perFriend } = useMemo(
    () => computeFromExpenses(me?.email, expenses),
    [me, expenses]
  );

  // Build options = friends ∪ anyone in balances
  const balanceMap = new Map(perFriend.map((x) => [x.friend, x.value]));
  const friendEmails = Array.from(
    new Set([...(friends || []), ...balanceMap.keys()])
  );

  const options = friendEmails
    .map((email) => {
      const label = getFriendLabel(email) || niceNameFromEmail(email);
      const bal = balanceMap.get(email) || 0; // + => they owe me, - => I owe them
      return { email, label, balance: bal };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const first = options[0] || null;

  const [friend, setFriend] = useState(first?.email || "");
  const [amount, setAmount] = useState(first ? Math.abs(first.balance) : "");
  // direction: 'they_pay' | 'i_pay'
  const inferDir = (bal) => (bal > 0 ? "they_pay" : "i_pay"); // default by balance
  const [direction, setDirection] = useState(
    first ? inferDir(first.balance) : "they_pay"
  );

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const current = options.find((o) => o.email === friend);
  const bal = current?.balance || 0;

  const hint = !current
    ? ""
    : bal > 0
    ? `${current.label} owes you ${formatCurrency(bal)}`
    : bal < 0
    ? `You owe ${current.label} ${formatCurrency(Math.abs(bal))}`
    : `No balance with ${current.label} — record a transfer`;

  const onSelectFriend = (email) => {
    const picked = options.find((o) => o.email === email);
    setFriend(email);
    setAmount(picked ? Math.abs(picked.balance) : "");
    setDirection(picked ? inferDir(picked.balance) : "they_pay");
  };

  const submit = async () => {
    setMsg("");
    if (!friend) {
      setMsg("Please choose a friend");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setMsg("Enter a valid amount");
      return;
    }

    try {
      setBusy(true);
      // NOTE: direction overrides auto logic in the API helper
      await settleWithFriend(friend, amt, direction);
      onClose(); // parent reloads data
    } catch {
      setMsg("Could not record settlement");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-card glass">
        <h3>Settle Up</h3>

        {/* Friend picker */}
        <label className="mini">Choose a friend</label>
        <select
          value={friend}
          onChange={(e) => onSelectFriend(e.target.value)}
          className="select"
        >
          <option value="" disabled>
            Select friend…
          </option>
          {options.map((o) => (
            <option key={o.email} value={o.email}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Direction toggle */}
        <label className="mini" style={{ marginTop: 10 }}>
          Who pays?
        </label>
        <div
          className="seg-toggle"
          role="tablist"
          aria-label="Settlement direction"
        >
          <button
            type="button"
            role="tab"
            className={`seg ${direction === "they_pay" ? "active" : ""}`}
            onClick={() => setDirection("they_pay")}
            aria-selected={direction === "they_pay"}
          >
            They pay me
          </button>
          <button
            type="button"
            role="tab"
            className={`seg ${direction === "i_pay" ? "active" : ""}`}
            onClick={() => setDirection("i_pay")}
            aria-selected={direction === "i_pay"}
          >
            I pay them
          </button>
        </div>

        {/* Amount */}
        <label className="mini" style={{ marginTop: 10 }}>
          Amount to settle
        </label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* Context hint */}
        {current && (
          <div className="mini" style={{ marginTop: 6 }}>
            {hint}
          </div>
        )}

        {/* Quick picks for non-zero balances */}
        {options.some((o) => o.balance !== 0) && (
          <div className="chip-suggest" style={{ marginTop: 10 }}>
            {options
              .filter((o) => o.balance !== 0)
              .slice(0, 8)
              .map((o) => (
                <button
                  key={o.email}
                  className="pill"
                  onClick={() => {
                    setFriend(o.email);
                    setAmount(Math.abs(o.balance));
                    setDirection(inferDir(o.balance));
                  }}
                  title={o.email}
                >
                  {o.label} · {formatCurrency(Math.abs(o.balance))}
                </button>
              ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn" disabled={busy} onClick={submit}>
            {busy ? "Saving…" : "Settle"}
          </button>
          <button className="btn outline" onClick={onClose}>
            Close
          </button>
        </div>

        {msg && (
          <div className="mini" style={{ marginTop: 8 }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
