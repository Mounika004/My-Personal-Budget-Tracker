import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { editExpense } from "../../../data/meApi";
import ChipMultiSelect from "../../common/ChipMultiSelect";
import "../../../styles/frndPop.css";

export default function EditExpense({ item, onClose }) {
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

  const initialSplit = (item.splitWith &&
    String(item.splitWith)
      .split(/[,\s]+/)
      .filter(Boolean)) || [
    item.paidBy,
    ...(item.paidTo
      ? String(item.paidTo)
          .split(/[,\s]+/)
          .filter(Boolean)
      : []),
  ];

  const [form, setForm] = useState({
    description: item.description || "",
    amount: item.amount || "",
    paidBy: item.paidBy || me?.email || "",
    splitWith: Array.from(new Set(initialSplit || [])),
    category: item.category || "Other",
    date: item.date
      ? item.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (me?.email && !form.paidBy) setForm((f) => ({ ...f, paidBy: me.email }));
  }, [me, form.paidBy]);

  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const submit = async () => {
    try {
      const participants = Array.from(
        new Set([form.paidBy, ...form.splitWith])
      );
      await editExpense(item.id, {
        description: form.description,
        amount: form.amount,
        paidBy: form.paidBy,
        splitWith: participants.join(", "),
        category: form.category,
        date: form.date,
      });
      onClose();
    } catch {
      /* toast already shown */
    }
  };

  return (
    <div className="modal">
      <div className="modal-card glass">
        <h3>Edit Expense</h3>
        <div className="grid2 grid-gap-lg">
          <input
            id="description"
            value={form.description}
            onChange={onChange}
          />
          <input
            id="amount"
            type="number"
            value={form.amount}
            onChange={onChange}
          />

          <select
            id="paidBy"
            value={form.paidBy}
            onChange={onChange}
            className="select"
          >
            {people.map((p) => (
              <option key={p.email} value={p.email}>
                {p.label}
              </option>
            ))}
          </select>

          <ChipMultiSelect
            options={people}
            value={form.splitWith}
            onChange={(vals) => setForm({ ...form, splitWith: vals })}
            placeholder="Split with…"
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
          <button className="btn" onClick={submit}>
            Save
          </button>
          <button className="btn outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
