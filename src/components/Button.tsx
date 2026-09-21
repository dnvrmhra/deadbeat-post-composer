import React from "react";

interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ text, onClick, disabled = false }: ButtonProps) {
  return (
    <button
      className="deadbeat-btn-primary"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "6px",
        fontSize: "0.95rem",
        fontWeight: 600,
        textAlign: "center",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.2s ease",
      }}
    >
      {text}
    </button>
  );
}

export default React.memo(Button);