import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

function Fallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "600px", margin: "2rem auto" }}>
      <h1 style={{ color: "#c00" }}>Something went wrong</h1>
      <pre style={{ background: "#f5f5f5", padding: "1rem", overflow: "auto" }}>{error.message}</pre>
      <p>Check the browser console (F12) for details.</p>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return <Fallback error={this.state.error} />;
    return this.props.children;
  }
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
