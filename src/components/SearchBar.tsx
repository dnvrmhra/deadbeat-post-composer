import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(({
  value,
  onChange,
  placeholder = "Search scheduled posts...",
}) => {
  return (
    <div style={{ position: "relative", marginBottom: "20px" }}>
      <svg
        style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.45,
          pointerEvents: "none",
        }}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px 16px 11px 40px",
          fontSize: "0.9rem",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-dark)",
          borderRadius: "8px",
          outline: "none",
          transition: "border-color 0.2s ease",
          boxSizing: "border-box",
          fontFamily: "var(--font-sans)",
        }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(59,130,246,0.5)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border-dark)"; }}
      />

      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: "1rem",
            padding: "2px 6px",
            borderRadius: "4px",
            lineHeight: 1,
          }}
          title="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
});

export default SearchBar;
