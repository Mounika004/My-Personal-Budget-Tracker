import React, { useMemo, useState } from "react";
import "../../styles/frndPop.css";

/**
 * ChipMultiSelect
 * props:
 *  - options: [{ email, label }]
 *  - value: array of emails
 *  - onChange: (emails[]) => void
 *  - placeholder?: string
 */
export default function ChipMultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Type a name...",
}) {
  const [q, setQ] = useState("");
  const selectedSet = useMemo(() => new Set(value), [value]);

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return options
      .filter((o) => !selectedSet.has(o.email))
      .filter((o) => !needle || o.label.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [q, options, selectedSet]);

  const add = (email) => {
    if (selectedSet.has(email)) return;
    onChange([...(value || []), email]);
    setQ("");
  };
  const remove = (email) => onChange((value || []).filter((v) => v !== email));

  const onKeyDown = (e) => {
    if (e.key === "Enter" && suggestions[0]) {
      e.preventDefault();
      add(suggestions[0].email);
    }
    if (e.key === "Backspace" && !q && value.length) {
      e.preventDefault();
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="chips">
      {(value || []).map((v) => {
        const opt = options.find((o) => o.email === v) || { label: v };
        return (
          <span className="chip" key={v}>
            {opt.label}
            <button
              className="chip-x"
              onClick={() => remove(v)}
              aria-label={`Remove ${opt.label}`}
            >
              ×
            </button>
          </span>
        );
      })}

      <input
        className="chip-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
      />

      {!!suggestions.length && (
        <div className="chip-suggest">
          {suggestions.map((s) => (
            <button key={s.email} className="pill" onClick={() => add(s.email)}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
