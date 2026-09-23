import React, { createContext, useContext, useCallback, useState, useRef } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${Date.now()}-${counterRef.current++}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9000000,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const COLORS: Record<ToastType, { bg: string; accent: string; icon: string }> = {
    success: { bg: "rgba(16, 185, 129, 0.12)", accent: "#10b981", icon: "✓" },
    error:   { bg: "rgba(239, 68, 68, 0.12)",  accent: "#ef4444", icon: "✕" },
    info:    { bg: "rgba(99, 102, 241, 0.12)",  accent: "#6366f1", icon: "i" },
  };

  const { bg, accent, icon } = COLORS[toast.type];

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "10px",
        background: "var(--bg-secondary, #1a1a1a)",
        border: `1px solid ${accent}40`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${accent}20`,
        minWidth: "260px",
        maxWidth: "380px",
        animation: "toast-slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        cursor: "pointer",
      }}
    >
      {/* Accent dot */}
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: bg,
          border: `1.5px solid ${accent}`,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.65rem",
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontSize: "0.85rem",
          fontWeight: 500,
          color: "var(--text-primary, #f0f0f0)",
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        {toast.message}
      </span>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          background: accent,
          borderRadius: "0 0 10px 10px",
          animation: "toast-progress 3.2s linear both",
          width: "100%",
        }}
      />
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
