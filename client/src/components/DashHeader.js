import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/actionCreator/userAction";
import "../styles/dashHeader.css";

export default function DashHeader({ onAddFriend, onAddExpense, onSettle }) {
  const dispatch = useDispatch();

  return (
    <header className="dash-header">
      <div className="brand-wrap">
        <div className="brand-logo">💰</div>
        <div className="brand-title">Budget Tracker</div>
      </div>

      <div className="header-center">
        <div className="search">
          <span className="icon">🔎</span>
          <input placeholder="Search expenses, notes, friends…" />
        </div>
      </div>

      <div className="header-actions">
        <button className="btn ghost" onClick={onAddFriend}>
          + Friend
        </button>
        <button className="btn" onClick={onAddExpense}>
          + Expense
        </button>
        <button className="btn outline" onClick={onSettle}>
          Settle
        </button>
        <div className="avatar" title="You">
          M
        </div>
        <button
          className="btn danger"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            dispatch(logout());
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
