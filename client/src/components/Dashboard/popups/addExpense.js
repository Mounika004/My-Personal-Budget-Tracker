import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { addExpense } from "../../../data/meApi";
import ChipMultiSelect from "../../common/ChipMultiSelect";
import "../../../styles/frndPop.css";

export default function AddExpense({ onClose }) {
  const { me, friends, categories } = useSelector((s) => s.me);

  const labelFrom = (email, fallbackName) =>
    fallbackName ||
    (email
      ? String(email)
          .split("@")[0]
          .replace(/[.\-_]+/g, " ")
          .replace(/\b\w/g, (m) => m.toUpperCase())
      : "");

  const people = useMemo(() => {
    const mine = me?.email
      ? [{ email: me.email, label: labelFrom(me.email, me?.username) }]
      : [];
    const frs = (friends || []).map((e) => ({ email: e, label: labelFrom(e) }));
    const map = new Map();
    [...mine, ...frs].forEach((p) => map.set(p.email, p));
    return Array.from(map.values());
  }, [me, friends]);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitWith: [],
    category: "Other",
    date: new Date().toISOString().slice(0, 10),
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (me?.email && !form.paidBy) setForm((f) => ({ ...f, paidBy: me.email }));
    if ((categories || []).length && form.category === "Other") {
      const hasOther = categories.some((c) => c.name === "Other");
      if (!hasOther) setForm((f) => ({ ...f, category: categories[0].name }));
    }
  }, [me, categories, form.paidBy, form.category]);

  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const submit = async () => {
    setMsg("");
    if (!form.description || !form.amount || !form.paidBy) {
      setMsg("Please fill Description, Amount and Paid by");
      return;
    }
    setLoading(true);
    try {
      const participants = Array.from(
        new Set([form.paidBy, ...form.splitWith])
      );
      const paidToList = participants
        .filter((e) => e.toLowerCase() !== form.paidBy.toLowerCase())
        .join(", ");
      await addExpense({
        description: form.description,
        amount: form.amount,
        paidBy: form.paidBy,
        paidTo: paidToList,
        splitWith: participants.join(", "),
        category: form.category,
        date: form.date,
      });
      onClose();
    } catch {
      setMsg("Error adding expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-card glass">
        <h3>Add Expense</h3>

        <div className="grid2 grid-gap-lg">
          <input
            id="description"
            placeholder="Description (e.g., Dinner)"
            value={form.description}
            onChange={onChange}
          />
          <input
            id="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={onChange}
          />

          {/* Paid by (names only) */}
          <select
            id="paidBy"
            value={form.paidBy}
            onChange={onChange}
            className="select"
            title="Paid by"
          >
            <option value="" disabled>
              Paid by
            </option>
            {people.map((p) => (
              <option key={p.email} value={p.email}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Split with — chip-style */}
          <ChipMultiSelect
            options={people}
            value={form.splitWith}
            onChange={(vals) => setForm({ ...form, splitWith: vals })}
            placeholder="Split with… (type to search)"
          />

          <select
            id="category"
            value={form.category}
            onChange={onChange}
            className="select"
          >
            {(categories?.length ? categories : [{ name: "Other" }]).map(
              (c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              )
            )}
          </select>

          <input id="date" type="date" value={form.date} onChange={onChange} />
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={submit} disabled={loading}>
            {loading ? "Adding…" : "Add"}
          </button>
          <button className="btn outline" onClick={onClose}>
            Close
          </button>
        </div>

        {msg && (
          <p className="mini" style={{ marginTop: 8 }}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
