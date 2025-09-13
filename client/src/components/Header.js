import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/siteHeader.css";
import ThemeToggle from "./common/ThemeToggle";

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="site-header glass">
      <div className="site-header__left">
        <Link to="/" className="brand">
          <span className="brand-mark">💰</span>
          <span className="brand-text">Budget Tracker</span>
        </Link>
      </div>

      <nav className="site-header__nav">
        {/* 3-state theme: Auto / Light / Dark */}
        <ThemeToggle compact />

        <Link className={`nav-link ${pathname === "/" ? "active" : ""}`} to="/">
          Home
        </Link>
        <Link
          className={`nav-link ${pathname === "/login" ? "active" : ""}`}
          to="/login"
        >
          Login
        </Link>
        <Link className="btn" to="/signup">
          Sign Up
        </Link>
      </nav>
    </header>
  );
}
