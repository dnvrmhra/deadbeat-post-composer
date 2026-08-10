import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface JwtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function JwtModal({ isOpen, onClose }: JwtModalProps) {
  const { token, decodedHeader, decodedPayload, user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tokenParts = token ? token.split(".") : [];

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "1.3rem", fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}>
            JWT Token Inspector (Exp 1.3.1)
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Stateless authentication token claims & header verification.
          </p>
        </div>

        {token ? (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>Raw JWT Token:</label>
              <div
                style={{
                  background: "var(--bg-input)",
                  padding: "12px",
                  borderRadius: "6px",
                  wordBreak: "break-all",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  marginTop: "6px",
                  border: "1px solid var(--border-dark)",
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ color: "#ef4444" }}>{tokenParts[0]}</span>
                <span>.</span>
                <span style={{ color: "#3b82f6" }}>{tokenParts[1]}</span>
                <span>.</span>
                <span style={{ color: "#10b981" }}>{tokenParts[2]}</span>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  marginTop: "8px",
                  padding: "6px 14px",
                  fontSize: "0.78rem",
                  background: copied ? "#10b981" : "rgba(150, 150, 150, 0.15)",
                  color: copied ? "#ffffff" : "var(--text-primary)",
                  border: "1px solid var(--border-dark)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {copied ? "Copied!" : "Copy Raw Token"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "#ef4444", fontWeight: 600 }}>Header (Algorithm):</label>
                <pre
                  style={{
                    background: "var(--bg-input)",
                    padding: "10px",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    marginTop: "6px",
                    color: "var(--text-primary)",
                  }}
                >
                  {JSON.stringify(decodedHeader, null, 2)}
                </pre>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", color: "#3b82f6", fontWeight: 600 }}>Payload (Claims):</label>
                <pre
                  style={{
                    background: "var(--bg-input)",
                    padding: "10px",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    marginTop: "6px",
                    color: "var(--text-primary)",
                  }}
                >
                  {JSON.stringify(decodedPayload, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ background: "rgba(150, 150, 150, 0.08)", padding: "14px", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid var(--border-dark)", color: "var(--text-primary)" }}>
              <div><strong>Session Status:</strong> Active (Stateless JWT)</div>
              <div><strong>User:</strong> {user?.username} ({user?.role})</div>
              <div>
                <strong>Expires:</strong>{" "}
                {decodedPayload?.exp
                  ? new Date(decodedPayload.exp * 1000).toLocaleTimeString()
                  : "N/A"}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: "#ef4444" }}>No active JWT token found. Please log in.</p>
        )}
      </div>
    </div>
  );
}

export default JwtModal;
