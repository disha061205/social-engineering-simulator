import type { ReactElement } from "react";
import { Navigate, Routes, Route } from "react-router-dom";

// Modules
import Login from "./modules/login/Login";
import Dashboard from "./modules/dashboard/Dashboard";
import AttackSelection from "./modules/attack-selection/AttackSelection";
import LevelSelection from "./modules/level-selection/LevelSelection";
import Simulation from "./modules/simulation/Simulation";
import Result from "./modules/result/Result";
import AdminDashboard from "./modules/admin/AdminDashboard";
import Scores from "./modules/scores/Scores";
import { getUserRole, isAuthenticated } from "./utils/auth";
import "./App.css";

function ProtectedRoute({ children, requireAdmin = false }: { children: ReactElement; requireAdmin?: boolean }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && getUserRole() !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/attack" element={<ProtectedRoute><AttackSelection /></ProtectedRoute>} />
      <Route path="/level" element={<ProtectedRoute><LevelSelection /></ProtectedRoute>} />
      <Route path="/simulation" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
      <Route path="/scores" element={<ProtectedRoute><Scores /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
