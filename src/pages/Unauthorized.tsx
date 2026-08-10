import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DeadbeatCursor from "../components/DeadbeatCursor";

function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="page">
      <DeadbeatCursor />
      <div className="composer-card" style={{ textAlign: "center", padding: "50px 20px", maxWidth: "520px" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>403 - Access Denied</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Your current role (<strong>{user?.role || "Guest"}</strong>) does not have permission to access this feature.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            className="deadbeat-btn-primary"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
          <button
            className="deadbeat-btn-secondary"
            onClick={() => navigate("/login")}
          >
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
