import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendList from "../components/Dashboard/FriendList";
import MiddleDashboard from "../components/Dashboard/MiddleDashboard";
import "../styles/dashboard.css";
import { logout } from "../redux/actionCreator/userAction";
import ThemeToggle from "../components/common/ThemeToggle";
import AddFriend from "../components/Dashboard/popups/AddFriend";

export default function DashboardPage({ history }) {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.me.me);

  const [openAdd, setOpenAdd] = useState(false);
  const [openSettle, setOpenSettle] = useState(false);
  const [openFriend, setOpenFriend] = useState(false);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    history.push("/login");
  };

  return (
    <div className="dashboard-wrap">
      {/* Top bar */}
      <div className="topbar glass">
        <div className="search-wrap">
          <input
            className="search"
            placeholder="  Search expenses, notes, friends…"
          />
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={() => setOpenFriend(true)}>
            + Friend
          </button>
          <button className="btn" onClick={() => setOpenAdd(true)}>
            + Expense
          </button>
          <button className="btn outline" onClick={() => setOpenSettle(true)}>
            Settle
          </button>

          <ThemeToggle />

          <div
            title={me?.email || ""}
            className="avatar"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              fontWeight: 700,
            }}
          >
            {(me?.username || me?.email || "U").trim().charAt(0).toUpperCase()}
          </div>

          <button className="btn danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="dash-grid" style={{ padding: "6px 18px 18px" }}>
        <FriendList />
        <MiddleDashboard
          externalShowAdd={openAdd}
          externalShowSettle={openSettle}
          onOpenAdd={() => setOpenAdd(true)}
          onOpenSettle={() => setOpenSettle(true)}
          onCloseAdd={() => setOpenAdd(false)}
          onCloseSettle={() => setOpenSettle(false)}
        />
      </div>

      {openFriend && <AddFriend onClose={() => setOpenFriend(false)} />}
    </div>
  );
}
