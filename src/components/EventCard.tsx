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
          gap: "5px",
          padding: "3px 7px",
          marginBottom: "3px",
          borderRadius: "4px",
          background: `${accent}18`,
          borderLeft: `3px solid ${accent}`,
          cursor: "pointer",
          transition: "opacity 0.15s",
          overflow: "hidden",
        }}
      >
        <PlatformLogo platform={event.platform} size={10} />
        <span style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          flex: 1,
        }}>
          {event.time ? event.time.replace(/ (AM|PM)/, (m) => m) + " " : ""}{event.title}
        </span>
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
        padding: "12px 14px",
        marginBottom: "8px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-dark)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <PlatformLogo platform={event.platform} size={13} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: accent, letterSpacing: "0.02em" }}>
            {event.platform}
          </span>
        </div>
        {event.status && (
          <span style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.68rem",
            padding: "2px 8px",
            borderRadius: "20px",
            background: statusCfg.bg,
            color: statusCfg.text,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: statusCfg.dot, display: "inline-block" }} />
            {event.status}
          </span>
        )}
      </div>

      <div style={{
        fontSize: "0.88rem",
        fontWeight: 600,
        color: "var(--text-primary)",
        lineHeight: 1.35,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}>
        {event.title}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "0.73rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
          {event.date}
        </span>
        <span style={{
          fontSize: "0.73rem",
          color: accent,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
        }}>
          {event.time || "All day"}
        </span>
      </div>

      <div style={{
        fontSize: "0.65rem",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        borderTop: "1px solid var(--border-light)",
        paddingTop: "6px",
        letterSpacing: "0.04em",
      }}>
        ID: {event.id}
      </div>
    </div>
  );
});

export default EventCard;
