import React from "react";
import "../styles/landing.css";
import Header from "./Header";

export const Landing = () => {
  return (
    <div className="landing">
      <Header />

      <main>
        <div className="landing-heading">
          <h1 className="landing-header">
            Track your expenses at your fingertips
          </h1>
          <img
            className="landing-big"
            src={require("../images/display.png")}
            alt="App preview"
          />
        </div>

        <div className="landing-feature">
          <div className="landing-content">
            <h1>Splitting expenses has never been easier.</h1>
            <ul>
              <li>
                <i className="fas fa-check-circle"></i>&nbsp;&nbsp;Share bills
              </li>
              <li>
                <i className="fas fa-check-circle"></i>&nbsp;&nbsp;Make sure
                everyone gets paid back
              </li>
              <li>
                <i className="fas fa-check-circle"></i>&nbsp;&nbsp;Settle up
                with friends
              </li>
            </ul>

            <a href="http://localhost:3000/signup">
              <button className="landing-button">Get Started</button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
