import React, { useEffect, useState } from "react";
import {
  getThemeMode,
  setThemeMode,
  getAppliedThemeFromMode,
} from "../../utils/theme";
import "../../styles/siteHeader.css"; // styles appended below

export default function ThemeToggle({ compact = false }) {
  const [mode, setMode] = useState(getThemeMode());
  const [applied, setApplied] = useState(getAppliedThemeFromMode(mode));

  // Keep Auto in sync when OS changes
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-color-scheme: light)");
    const onChange = () => {
      if (mode === "auto") {
        const { applied: a } = setThemeMode("auto");
        setApplied(a);
      }
    };
    m?.addEventListener?.("change", onChange);
    return () => m?.removeEventListener?.("change", onChange);
  }, [mode]);

  const change = (m) => {
    const { applied: a } = setThemeMode(m);
    setMode(m);
    setApplied(a);
  };

  if (compact) {
    // small button that cycles modes: Auto -> Light -> Dark -> Auto...
    const icon = mode === "auto" ? "A" : applied === "light" ? "☀️" : "🌙";
    return (
      <button
        className="theme-toggle"
        onClick={() =>
          change(mode === "auto" ? "light" : mode === "light" ? "dark" : "auto")
        }
      >
        {icon}
      </button>
    );
  }

  return (
    <div className="seg-toggle" role="tablist" aria-label="Theme">
      <button
        role="tab"
        className={`seg ${mode === "auto" ? "active" : ""}`}
        onClick={() => change("auto")}
        aria-selected={mode === "auto"}
      >
        Auto
      </button>
      <button
        role="tab"
        className={`seg ${mode === "light" ? "active" : ""}`}
        onClick={() => change("light")}
        aria-selected={mode === "light"}
        title="Light"
      >
        ☀️
      </button>
      <button
        role="tab"
        className={`seg ${mode === "dark" ? "active" : ""}`}
        onClick={() => change("dark")}
        aria-selected={mode === "dark"}
        title="Dark"
      >
        🌙
      </button>
    </div>
  );
}
