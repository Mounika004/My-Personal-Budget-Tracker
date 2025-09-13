// 3-state theme controller: 'auto' | 'light' | 'dark'
// Applies a concrete theme to <html data-theme="light|dark"> using CSS vars.

const MODE_KEY = "themeMode"; // persisted mode choice

function systemPrefersLight() {
  try {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    );
  } catch {
    return false;
  }
}

export function getThemeMode() {
  const saved = localStorage.getItem(MODE_KEY);
  return saved === "light" || saved === "dark" || saved === "auto"
    ? saved
    : "auto";
}

export function getAppliedThemeFromMode(mode) {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  return systemPrefersLight() ? "light" : "dark"; // auto
}

export function applyThemeMode(mode) {
  const applied = getAppliedThemeFromMode(mode);
  document.documentElement.setAttribute("data-theme", applied);
  localStorage.setItem(MODE_KEY, mode);
  return { mode, applied };
}

// Initialize on app start and keep Auto in sync with OS.
export function initTheme() {
  const mode = getThemeMode();
  const { applied } = applyThemeMode(mode);

  // If user chose Auto, react to OS changes.
  const mql = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: light)")
    : null;
  if (mql) {
    const handler = () => {
      if (getThemeMode() === "auto") applyThemeMode("auto");
    };
    mql.addEventListener?.("change", handler);
    // No need to remove: app lifetime listeners are fine, but you can export an unsubscribe if desired
  }
  return { mode, applied };
}

export function setThemeMode(nextMode /* 'auto' | 'light' | 'dark' */) {
  return applyThemeMode(nextMode); // returns { mode, applied }
}
