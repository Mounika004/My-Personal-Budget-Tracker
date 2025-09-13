import React from "react";
import Header from "./Header";
import "../styles/landing.css";
import display from "../images/display.png"; // keep your existing filename; change to display.png if you renamed

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-bg" />
      <Header />

      {/* Hero */}
      <section className="hero">
        <div className="hero__text">
          <h1>
            Track. Split. <span className="grad-text">Save.</span>
          </h1>
          <p className="subtitle">
            Clean budgets, instant splits, and friendly reminders—so your money
            works quietly in the background while you focus on life.
          </p>

          <div className="cta">
            <a className="btn" href="/signup">
              Get Started
            </a>
            <a className="btn outline" href="/login">
              Live Demo
            </a>
          </div>

          <ul className="bullets">
            <li>• One-click expense splits</li>
            <li>• Friend balances at a glance</li>
            <li>• Cloud sync with security</li>
          </ul>
        </div>

        <div className="hero__visual">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <img className="hero-img" src={display} alt="App preview" />
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature glass">
          <div className="f-icon">⚡</div>
          <h3>Fast & Simple</h3>
          <p>Add expenses in seconds and keep everyone in sync.</p>
        </div>
        <div className="feature glass">
          <div className="f-icon">🔒</div>
          <h3>Private by Design</h3>
          <p>Authentication Enabled. So your data stays yours.</p>
        </div>
        <div className="feature glass">
          <div className="f-icon">📊</div>
          <h3>Smart Insights</h3>
          <p>Modern cards and budgets that make sense at a glance.</p>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-foot glass">
        <h3>Ready to get organized?</h3>
        <a className="btn" href="/signup">
          Create your free account
        </a>
      </section>
    </div>
  );
}
