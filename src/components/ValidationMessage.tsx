import type { Validation } from "../types/Validation";

interface ValidationMessageProps {
  validation: Validation;
}

function ValidationMessage({ validation }: ValidationMessageProps) {
  if (!validation.message) return null;

  return (
    <div
      className={validation.valid ? "success" : "error"}
      style={{
        padding: "10px 14px",
        borderRadius: "var(--radius-sm)",
        background: validation.valid ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
        border: `1px solid ${validation.valid ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
        color: validation.valid ? "#10b981" : "#ef4444",
        marginBottom: "20px",
        fontSize: "0.88rem",
        fontWeight: 500,
      }}
    >
      <span>{validation.message}</span>
    </div>
  );
}

export default ValidationMessage;