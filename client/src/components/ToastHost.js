import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ToastHost() {
  const dispatch = useDispatch();
  const toasts = useSelector((s) => s.ui.toasts);

  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => dispatch({ type: "TOAST_POP" }), 2500);
    return () => clearTimeout(t);
  }, [toasts, dispatch]);

  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind || "info"}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
