import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    console.error("ErrorBoundary", err, info);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          padding: 24,
          fontFamily: "system-ui,Arial",
          color: "#e7eaf3",
          background: "#0b1020",
          minHeight: "100vh",
        }}
      >
        <h2>Something went wrong.</h2>
        <p>
          Check the browser console for details. If you just updated files, try
          saving again or restarting the dev server.
        </p>
      </div>
    );
  }
}
