import React from "react";
import "../styles/signup.css";
import Header from "./Header";
import { withRouter, Link } from "react-router-dom";
import { instance } from "../utils/AxiosConfig";

var obj = {};

const SignUp = (props) => {
  const handleSignup = () => {
    if (!obj.username || !obj.email || !obj.password) {
      alert("Form is Incomplete");
      return;
    }

    instance
      .post("/signup", obj)
      .then((response) => {
        const { Status } = response.data;
        if (Status === "S") {
          alert("Successful Registered");
          props.history.push("/Dashboard");
        } else if (Status === "F") {
          alert("Username or Email Id Already exist");
        }
      })
      .catch(() => {
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <>
      {/* NEW: show header on the Sign Up page */}
      <Header />

      <div className="container signup">
        <div className="signup-logo">
          <img src={require("../images/logo.png")} alt="App logo" />
        </div>

        <div className="signup-form">
          <h3>INTRODUCE YOURSELF</h3>

          <label htmlFor="username">Hi there! My name is</label>
          <input
            id="username"
            onChange={(event) => {
              obj[event.target.id] = event.target.value;
            }}
            className="form-control"
            type="text"
            required
          />

          <label htmlFor="email">Here’s my email address:</label>
          <input
            id="email"
            onChange={(event) => {
              obj[event.target.id] = event.target.value;
            }}
            className="form-control"
            type="email"
            required
          />

          <label htmlFor="password">And here’s my password:</label>
          <input
            id="password"
            onChange={(event) => {
              obj[event.target.id] = event.target.value;
            }}
            className="form-control"
            type="password"
            required
          />

          <div className="actions">
            <button onClick={handleSignup} className="btn primary">
              Sign me up!
            </button>
            <button
              type="button"
              onClick={() => props.history.push("/login")}
              className="btn outline"
            >
              Log in
            </button>
          </div>

          <p className="alt-action">
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Go to Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default withRouter(SignUp);
