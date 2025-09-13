import React, { useMemo } from "react";
import "../../styles/dashboard.css";
import { formatCurrency } from "../../utils/finance";

export default function CategoryChart({ data = [], total = 0 }) {
  const max = useMemo(() => Math.max(...data.map((d) => d.amount), 1), [data]);

  return (
    <div className="panel glass">
      <div className="panel-head">
        <h3 style={{ margin: 0 }}>Monthly Spend</h3>
        <span className="mini">Total: {formatCurrency(total)}</span>
      </div>

      {data.length === 0 ? (
        <div className="mini">No category data for this month.</div>
      ) : (
        <ul className="chart-rows">
          {data.map((row) => (
            <li key={row.category}>
              <div className="label">{row.category}</div>
              <div className="bar-wrap">
                <div
                  className="bar-fill"
                  style={{ width: `${(row.amount / max) * 100}%` }}
                />
              </div>
              <div className="amount">{formatCurrency(row.amount)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
