import React, { useState } from "react";
import instance from "../../utils/AxiosConfig";
import "../../styles/frndPop.css";

export default function AddFriends({ onClose }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const add = async () => {
    setMsg("");
    try {
      await instance.post("/user/friend/add", { friendEmail: email });
      setMsg("✅ Friend added");
      setEmail("");
    } catch (e) {
      setMsg(e?.response?.data?.msg || "❌ Error adding friend");
    }
  };

  return (
    <div className="modal">
      <div className="modal-card glass">
        <h3>Add Friend</h3>
        <p className="mini">Enter your friend’s email to start splitting.</p>
        <input
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn" onClick={add}>
            Add
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
