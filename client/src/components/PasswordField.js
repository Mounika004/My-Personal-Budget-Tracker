import React, { useState } from "react";

const PasswordField = ({
  id = "password",
  value,
  onChange,
  placeholder = "Enter your password",
  className = "form-control",
  required = true,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={className}
        placeholder={placeholder}
        required={required}
        autoComplete="current-password"
      />
      <button
        type="button"
        className="toggle"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
};

export default PasswordField;
