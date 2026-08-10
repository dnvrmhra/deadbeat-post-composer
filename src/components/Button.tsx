import React from "react";

interface ButtonProps {
  text: string;
  onClick: () => void;
}

function Button({ text, onClick }: ButtonProps) {
  return (
    <button
      className="deadbeat-btn-primary"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "6px",
        fontSize: "0.95rem",
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      {text}
    </button>
  );
}

export default React.memo(Button);