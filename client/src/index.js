import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";
import ErrorBoundary from "./utils/ErrorBoundary";

// theme
import "./styles/theme.css";
import { initTheme } from "./utils/theme";
initTheme();

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);
