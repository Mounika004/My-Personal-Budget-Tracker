import React from "react";
import { Redirect } from "react-router-dom";

export default function AuthComponent({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Redirect to="/login" />;
  return <>{children}</>;
}
