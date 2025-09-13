import React from "react";
import "../../../styles/frndPop.css";

export default function Confirm({
  title = "Are you sure?",
  subtitle = "",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal">
      <div className="modal-card glass">
        <h3>{title}</h3>
        {subtitle && <p className="mini">{subtitle}</p>}
        <div className="modal-actions">
          <button className="btn danger" onClick={onConfirm}>
            Delete
          </button>
          <button className="btn outline" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
