import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as mockLogin, SYNTHETIC_USERS } from "../api/mockApi";
import { useAuth } from "../context/AuthContext";
import DeadbeatCursor from "../components/DeadbeatCursor";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuth } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fromLocation = (location.state as { from?: string })?.from;

  function performLogin(u: string, p: string) {
    const result = mockLogin(u, p);

    if (!result) {
      setError("Invalid username or password (use synthetic accounts below)");
      return;
    }

    setAuth(result.token, result.user);

    if (fromLocation) {
      navigate(fromLocation);
    } else if (result.user.role === "Viewer") {
      navigate("/drafts");
    } else {
      navigate("/compose");
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    performLogin(username, password);
  }

  function handleQuickLogin(userAccount: typeof SYNTHETIC_USERS[0]) {
    setUsername(userAccount.username);
    setPassword(userAccount.password);
    performLogin(userAccount.username, userAccount.password);
  }

  return (
    <div className="page">
      <DeadbeatCursor />
      <div className="composer-card" style={{ maxWidth: "480px" }}>
        <h2>Authentication Login (JWT)</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Log in with synthetic accounts to simulate JWT stateless authentication & RBAC security.
        </p>

        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Username</label>
            <input
              type="text"
              placeholder="e.g. admin, editor, viewer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-dark)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Password</label>
            <input
              type="password"
              placeholder="e.g. 1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid var(--border-dark)", background: "var(--bg-input)", color: "var(--text-primary)" }}
            />
          </div>

          <button type="submit" className="deadbeat-btn-primary" style={{ width: "100%", padding: "12px", borderRadius: "6px", fontWeight: "bold" }}>
            Login & Generate JWT Token
          </button>

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "14px" }}>
              {error}
            </p>
          )}
        </form>

        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border-dark)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: 600 }}>
            Quick Synthetic Credentials:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {SYNTHETIC_USERS.map((userAcc) => (
              <button
                key={userAcc.username}
                onClick={() => handleQuickLogin(userAcc)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-dark)",
                  background: "rgba(150, 150, 150, 0.06)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textAlign: "left",
                }}
              >
                <span>
                  <strong>{userAcc.name}</strong> <span style={{ color: "var(--text-secondary)" }}>({userAcc.username} / {userAcc.password})</span>
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    background:
                      userAcc.role === "Admin"
                        ? "rgba(239, 68, 68, 0.15)"
                        : userAcc.role === "Editor"
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(16, 185, 129, 0.15)",
                    color:
                      userAcc.role === "Admin"
                        ? "#ef4444"
                        : userAcc.role === "Editor"
                        ? "#3b82f6"
                        : "#10b981",
                  }}
                >
                  {userAcc.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;