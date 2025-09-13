import React, { useState } from "react";
import { useSelector } from "react-redux";
import { addCategory, renameCategory } from "../../data/meApi";
import "../../styles/frndPop.css";

export default function CategoryManager({ onClose }) {
  const cats = useSelector((s) => s.me.categories);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#7c5cff");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#7c5cff");

  return (
    <div className="modal">
      <div className="modal-card glass">
        <h3>Manage Categories</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {cats.map((c) => (
            <div
              key={c.name}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              {editing === c.name ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      renameCategory(c.name, editName, editColor);
                      setEditing(null);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="btn outline"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="mini" style={{ width: 200 }}>
                    {c.name}
                  </div>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: c.color,
                    }}
                  />
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setEditing(c.name);
                      setEditName(c.name);
                      setEditColor(c.color);
                    }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <hr style={{ opacity: 0.2, margin: "12px 0" }} />

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="New category"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
          <button
            className="btn"
            onClick={() => {
              if (newName.trim()) {
                addCategory(newName, newColor);
                setNewName("");
              }
            }}
          >
            Add
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
