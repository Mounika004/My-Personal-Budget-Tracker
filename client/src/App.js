import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Landing from "./components/landing";
import Login from "./components/login";
import SignUp from "./components/signup";
import DashboardPage from "./containers/Dashboard";
import AuthComponent from "./containers/AuthComponent";
import ToastHost from "./components/ToastHost";
import { pushToast } from "./redux/reducers/uiReducer";
import { store } from "./redux/store";

export default function App() {
  // simple global keyboard hints (non-blocking)
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "n")
        store.dispatch(
          pushToast('Press "+ Add Expense" to create one', "info")
        );
      if (e.key === "s")
        store.dispatch(
          pushToast('Press "Settle Up" to settle with a friend', "info")
        );
      if (e.key === "f")
        store.dispatch(pushToast('Use "+ Friend" in header', "info"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={SignUp} />
        <Route
          path="/dashboard"
          render={(props) => (
            <AuthComponent>
              <DashboardPage {...props} />
            </AuthComponent>
          )}
        />
        <Redirect to="/" />
      </Switch>
      <ToastHost />
    </>
  );
}
