import React from "react";
import type { Event } from "../types/Event";
import { PlatformLogo } from "./SocialIcons";

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
  onDragStart?: (e: React.DragEvent, event: Event) => void;
  compact?: boolean;
}

const PLATFORM_ACCENT: Record<string, string> = {
  Twitter: "#1d9bf0",
  Instagram: "#e1306c",
  LinkedIn: "#0a66c2",
  Facebook: "#1877f2",
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  scheduled: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", dot: "#3b82f6" },
  published: { bg: "rgba(16,185,129,0.12)", text: "#10b981", dot: "#10b981" },
  draft:     { bg: "rgba(156,163,175,0.12)", text: "#9ca3af", dot: "#9ca3af" },
};

const EventCard: React.FC<EventCardProps> = React.memo(({ event, onClick, onDragStart, compact }) => {
  const accent = PLATFORM_ACCENT[event.platform] || "#6366f1";
  const statusCfg = STATUS_CONFIG[event.status || "draft"] || STATUS_CONFIG.draft;

  if (compact) {
    return (
      <div
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart && onDragStart(e, event)}
        onClick={(e) => { e.stopPropagation(); onClick && onClick(event); }}
        title={`${event.title} — ${event.time || "All day"}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 8px",
          marginBottom: "4px",
          borderRadius: "6px",
          background: `${accent}15`,
          borderLeft: `3px solid ${accent}`,
          borderTop: "1px solid rgba(150,150,150,0.08)",
          borderRight: "1px solid rgba(150,150,150,0.08)",
          borderBottom: "1px solid rgba(150,150,150,0.08)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          overflow: "hidden",
        }}
      >
        <PlatformLogo platform={event.platform} size={11} />
        <span style={{
          fontSize: "0.73rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
        }}>
          {event.time ? event.time.replace(/ (AM|PM)/, "") + " " : ""}{event.title}
        </span>
        {event.image && (
          <span style={{ fontSize: "0.65rem", opacity: 0.7 }} title="Has media attachment">
            🖼️
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="event-card"
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, event)}
      onClick={() => onClick && onClick(event)}
      style={{
        padding: "14px 16px",
        marginBottom: "10px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-dark)",
        borderLeft: `4px solid ${accent}`,
        borderRadius: "10px",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <PlatformLogo platform={event.platform} size={14} />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: accent, letterSpacing: "0.02em" }}>
            {event.platform}
          </span>
        </div>
        {event.status && (
          <span style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.68rem",
            padding: "3px 9px",
            borderRadius: "20px",
            background: statusCfg.bg,
            color: statusCfg.text,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusCfg.dot, display: "inline-block" }} />
            {event.status}
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {event.image && (
          <img
            src={event.image}
            alt="thumbnail"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "6px",
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid var(--border-dark)",
            }}
          />
        )}
        <div style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.4,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          flex: 1,
        }}>
          {event.title}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          🗓️ {event.date}
        </span>
        <span style={{
          fontSize: "0.75rem",
          color: accent,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
        }}>
          ⏰ {event.time || "All day"}
        </span>
      </div>

      <div style={{
        fontSize: "0.68rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        borderTop: "1px solid var(--border-dark)",
        paddingTop: "6px",
        letterSpacing: "0.04em",
        display: "flex",
        justifyContent: "space-between",
      }}>
        <span>ID: {event.id}</span>
        <span style={{ color: "var(--text-secondary)" }}>Drag to reschedule ↕</span>
      </div>
    </div>
  );
});

export default EventCard;
