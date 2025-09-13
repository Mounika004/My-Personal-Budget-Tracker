import React, { useState } from "react";
import "../styles/signup.css";
import Header from "./Header";
import instance from "../utils/AxiosConfig";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/actionCreator/userAction";

export default function SignUp({ history }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const onChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

  const onSignup = async () => {
    setErr("");
    setLoading(true);
    try {
      const payload = {
        username: form.username,
        email: String(form.email).trim(),
        password: form.password,
      };
      const { data } = await instance.post("/user/signup", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(loginSuccess({ user: data.user }));
      history.push("/dashboard");
    } catch (e) {
      const serverMsg = e?.response?.data?.msg;
      setErr(serverMsg || "Sign up failed");
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
          <h2>Create your account</h2>
          <p className="mini">Start tracking and splitting in minutes.</p>

          <label>Full name</label>
          <input
            id="username"
            onChange={onChange}
            className="form-control"
            type="text"
            required
            placeholder="Enter your full name"
          />

          <label>Email address</label>
          <input
            id="email"
            onChange={onChange}
            className="form-control"
            type="email"
            required
            placeholder="you@example.com"
          />

          <label>Password</label>
          <div className="password-field">
            <input
              id="password"
              onChange={onChange}
              className="form-control"
              type={showPwd ? "text" : "password"}
              required
              placeholder="Minimum 8 characters"
            />
            <button className="show-btn" onClick={() => setShowPwd((s) => !s)}>
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>

          {err && <p className="err">{err}</p>}

          <div className="btn-row">
            <button className="btn" onClick={onSignup} disabled={loading}>
              {loading ? "Creating…" : "Sign Up"}
            </button>
            <a className="btn outline" href="/login">
              I already have an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
