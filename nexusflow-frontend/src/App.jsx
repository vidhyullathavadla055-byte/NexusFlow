import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LiveDataProvider } from "./context/LiveDataContext";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Layout from "./components/Layout";
import Canvas from "./components/Canvas";

import Dashboard from "./pages/Dashboard";
import GraphsPage from "./pages/GraphsPage";
import Activity from "./pages/Activity";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { token, ready } = useAuth();

  if (!ready) return null;

  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/signup"
        element={token ? <Navigate to="/" replace /> : <Signup />}
      />

      {/* Protected Routes with common Layout */}
      <Route
        element={
          <ProtectedRoute>
            <LiveDataProvider>
              <Layout />
            </LiveDataProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/canvas" element={<Canvas />} />
        <Route path="/pipelines" element={<GraphsPage />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;