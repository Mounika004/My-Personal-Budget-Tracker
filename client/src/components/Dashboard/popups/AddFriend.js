import React, { useState } from "react";
import { addFriend } from "../../../data/meApi";
import { setFriendLabel } from "../../../utils/friends";
import "../../../styles/frndPop.css";

export default function AddFriend({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setMsg("");
    if (!name.trim()) {
      setMsg("Please enter a name");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg("Please enter a valid email");
      return;
    }

    setBusy(true);
    try {
      // 1) add on the server (email is the ID there)
      await addFriend(email.trim());
      // 2) remember the display name locally (used everywhere in UI)
      setFriendLabel(email.trim(), name.trim());
      onClose();
    } catch {
      setMsg("Could not add friend");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-card glass">
        <h3>Add Friend</h3>

        <label className="mini">Friend’s name</label>
        <input
          placeholder="e.g., Sam Patel"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <label className="mini" style={{ marginTop: 10 }}>
          Email address
        </label>
        <input
          placeholder="friend@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn" onClick={submit} disabled={busy}>
            {busy ? "Adding…" : "Add"}
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
