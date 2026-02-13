import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { hasApiKey, clearApiKey } from "./api";
import Login from "./pages/Login";
import Keys from "./pages/Keys";
import Usage from "./pages/Usage";
import Deployments from "./pages/Deployments";
import Dashboard from "./pages/Dashboard";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!hasApiKey()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  return (
    <div className="app">
      <header className="header">
        <h1>GPU Cloud</h1>
        <nav className="nav">
          <Link to="/" className={loc.pathname === "/" ? "active" : ""}>Dashboard</Link>
          <Link to="/keys" className={loc.pathname === "/keys" ? "active" : ""}>API Keys</Link>
          <Link to="/usage" className={loc.pathname === "/usage" ? "active" : ""}>Usage</Link>
          <Link to="/deployments" className={loc.pathname === "/deployments" ? "active" : ""}>Deployments</Link>
          <button type="button" className="btn btn-secondary" style={{ marginLeft: "auto" }} onClick={() => { clearApiKey(); window.location.href = "/login"; }}>Log out</button>
        </nav>
      </header>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
      <Route path="/keys" element={<RequireAuth><Layout><Keys /></Layout></RequireAuth>} />
      <Route path="/usage" element={<RequireAuth><Layout><Usage /></Layout></RequireAuth>} />
      <Route path="/deployments" element={<RequireAuth><Layout><Deployments /></Layout></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
