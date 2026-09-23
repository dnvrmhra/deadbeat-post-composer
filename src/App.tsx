import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Composer from "./pages/Composer";
import Drafts from "./pages/Drafts";
import CalendarPage from "./pages/CalendarPage";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleReact";
import { ToastProvider } from "./context/ToastContext";

import "./App.css";

function App() {
  return (
    <ToastProvider>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/compose"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Admin", "Editor"]}>
                  <Composer />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/drafts"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Admin", "Editor", "Viewer"]}>
                  <Drafts />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["Admin", "Editor", "Viewer"]}>
                  <CalendarPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

export default App;