import React, { useState } from "react";
import "../styles/signup.css";
import Header from "./Header";
import instance from "../utils/AxiosConfig";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/actionCreator/userAction";

export default function Login({ history }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const onLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await instance.post("/user/login", {
        email: String(form.email).trim(),
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(loginSuccess({ user: data.user }));
      history.push("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <Header />
      <div className="auth-wrap">
        <div className="auth-card glass">
          <h2>Welcome back</h2>
          <p className="mini">Log in to access your budgets & splits.</p>

          <label>Email address</label>
          <input
            id="email"
            onChange={onChange}
            className="form-control"
            type="email"
            placeholder="you@example.com"
          />

          <label>Password</label>
          <div className="password-field">
            <input
              id="password"
              onChange={onChange}
              className="form-control"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
            />
            <button className="show-btn" onClick={() => setShowPwd((s) => !s)}>
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>

          {err && <p className="err">{err}</p>}

          <div className="btn-row">
            <button className="btn" onClick={onLogin} disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </button>
            <a className="btn outline" href="/signup">
              Create account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
