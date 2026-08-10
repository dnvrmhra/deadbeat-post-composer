import React, { useState, useMemo, useCallback } from "react";
import type { Event } from "../types/Event";
import EventCard from "./EventCard";

interface Props {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateClick?: (dateStr: string) => void;
  onEventDrop?: (eventId: string, newDateStr: string) => void;
}

type ViewMode = "month" | "week" | "day";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL  = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TODAY_STR = toDateStr(new Date());

const Calendar: React.FC<Props> = React.memo(({ events, onEventClick, onDateClick, onEventDrop }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);

  const prevPeriod = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "month") d.setMonth(d.getMonth() - 1);
      else if (viewMode === "week") d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return d;
    });
  }, [viewMode]);

  const nextPeriod = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "month") d.setMonth(d.getMonth() + 1);
      else if (viewMode === "week") d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return d;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    events.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.time || "").localeCompare(b.time || "")));
    return map;
  }, [events]);

  const monthCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { dateStr: string; day: number; current: boolean; today: boolean; isWeekend: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      cells.push({ dateStr: toDateStr(date), day: d, current: false, today: false, isWeekend: dayOfWeek === 0 || dayOfWeek === 6 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const ds = toDateStr(date);
      const dayOfWeek = date.getDay();
      cells.push({ dateStr: ds, day: d, current: true, today: ds === TODAY_STR, isWeekend: dayOfWeek === 0 || dayOfWeek === 6 });
    }
    const totalCells = cells.length > 35 ? 42 : 35;
    let n = 1;
    while (cells.length < totalCells) {
      const date = new Date(year, month + 1, n);
      const dayOfWeek = date.getDay();
      cells.push({ dateStr: toDateStr(date), day: n, current: false, today: false, isWeekend: dayOfWeek === 0 || dayOfWeek === 6 });
      n++;
    }
    return cells;
  }, [currentDate]);

  const weekCells = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(d);
      day.setDate(d.getDate() + i);
      const ds = toDateStr(day);
      return { dateStr: ds, dayOfWeek: DAYS_FULL[day.getDay()], dayNum: day.getDate(), today: ds === TODAY_STR, isWeekend: i === 0 || i === 6 };
    });
  }, [currentDate]);

  const handleDragStart = useCallback((_e: React.DragEvent, event: Event) => {
    setDraggedEventId(event.id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDropTargetDate(dateStr);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTargetDate(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    if (draggedEventId && onEventDrop) onEventDrop(draggedEventId, targetDateStr);
    setDraggedEventId(null);
    setDropTargetDate(null);
  }, [draggedEventId, onEventDrop]);

  const periodLabel = useMemo(() => {
    if (viewMode === "month") return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
    if (viewMode === "week") {
      const sun = new Date(currentDate); sun.setDate(sun.getDate() - sun.getDay());
      const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
      return `${sun.toLocaleDateString("default", { month: "short", day: "numeric" })} – ${sat.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }, [currentDate, viewMode]);

  const totalToday = (eventsByDate[TODAY_STR] || []).length;

  return (
    <div style={{ width: "100%", fontFamily: "var(--font-sans)" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "14px",
        marginBottom: "20px",
        background: "var(--bg-card)",
        padding: "16px 20px",
        borderRadius: "12px",
        border: "1px solid var(--border-dark)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            {periodLabel}
          </h2>
          {totalToday > 0 && viewMode === "month" && (
            <span style={{
              fontSize: "0.74rem",
              fontWeight: 700,
              padding: "3px 12px",
              borderRadius: "20px",
              background: "rgba(59,130,246,0.12)",
              color: "#3b82f6",
              border: "1px solid rgba(59,130,246,0.25)",
            }}>
              {totalToday} post{totalToday !== 1 ? "s" : ""} today
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={goToToday}
            style={{
              padding: "7px 16px",
              fontSize: "0.85rem",
              fontWeight: 700,
              background: "rgba(150,150,150,0.08)",
              border: "1px solid var(--border-dark)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
            }}
          >
            Today
          </button>

          <div style={{ display: "flex", border: "1px solid var(--border-dark)", borderRadius: "8px", overflow: "hidden", background: "var(--bg-secondary)" }}>
            <button onClick={prevPeriod} title="Previous" style={{ padding: "6px 14px", background: "transparent", border: "none", borderRight: "1px solid var(--border-dark)", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.1rem", fontWeight: 700 }}>
              ‹
            </button>
            <button onClick={nextPeriod} title="Next" style={{ padding: "6px 14px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "1.1rem", fontWeight: 700 }}>
              ›
            </button>
          </div>

          <div style={{ display: "flex", background: "var(--bg-secondary)", border: "1px solid var(--border-dark)", borderRadius: "8px", padding: "3px", gap: "3px" }}>
            {(["month", "week", "day"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                style={{
                  padding: "6px 16px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  textTransform: "capitalize",
                  background: viewMode === m ? "var(--text-primary)" : "transparent",
                  color: viewMode === m ? "var(--bg-primary)" : "var(--text-secondary)",
                  transition: "all 0.18s ease",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === "month" && (
        <div style={{
          border: "1px solid var(--border-dark)",
          borderRadius: "14px",
          overflow: "hidden",
          background: "var(--bg-card)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-dark)",
          }}>
            {DAYS_SHORT.map((d, i) => (
              <div key={d} style={{
                padding: "12px 0",
                textAlign: "center",
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: i === 0 || i === 6 ? "var(--text-muted)" : "var(--text-secondary)",
              }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {monthCells.map((cell, idx) => {
              const dayEvts = eventsByDate[cell.dateStr] || [];
              const isDrop = dropTargetDate === cell.dateStr;
              return (
                <div
                  key={cell.dateStr + idx}
                  onClick={() => cell.current && onDateClick && onDateClick(cell.dateStr)}
                  onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, cell.dateStr)}
                  style={{
                    minHeight: "125px",
                    padding: "10px 8px",
                    borderRight: "1px solid var(--border-dark)",
                    borderBottom: "1px solid var(--border-dark)",
                    background: isDrop
                      ? "rgba(59,130,246,0.12)"
                      : cell.today
                      ? "rgba(59,130,246,0.04)"
                      : cell.isWeekend
                      ? "rgba(150,150,150,0.02)"
                      : "transparent",
                    opacity: cell.current ? 1 : 0.35,
                    cursor: cell.current ? "pointer" : "default",
                    transition: "background 0.15s ease",
                    position: "relative",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      fontSize: "0.85rem",
                      fontWeight: cell.today ? 800 : 600,
                      background: cell.today ? "#3b82f6" : "transparent",
                      color: cell.today ? "#fff" : "var(--text-primary)",
                      boxShadow: cell.today ? "0 2px 8px rgba(59,130,246,0.4)" : "none",
                    }}>
                      {cell.day}
                    </span>
                    {dayEvts.length > 0 && (
                      <span style={{
                        fontSize: "0.68rem",
                        color: "#3b82f6",
                        fontWeight: 700,
                        background: "rgba(59,130,246,0.1)",
                        padding: "2px 6px",
                        borderRadius: "10px",
                      }}>
                        {dayEvts.length}
                      </span>
                    )}
                  </div>

                  {dayEvts.slice(0, 3).map((evt) => (
                    <EventCard key={evt.id} event={evt} onClick={onEventClick} onDragStart={handleDragStart} compact />
                  ))}
                  {dayEvts.length > 3 && (
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 700, paddingLeft: "4px", marginTop: "2px" }}>
                      +{dayEvts.length - 3} more
                    </div>
                  )}

                  {isDrop && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      border: "2px dashed #3b82f6",
                      borderRadius: "0",
                      pointerEvents: "none",
                      background: "rgba(59,130,246,0.08)",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "week" && (
        <div style={{
          border: "1px solid var(--border-dark)",
          borderRadius: "14px",
          overflow: "hidden",
          background: "var(--bg-card)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: "1px solid var(--border-dark)",
            background: "var(--bg-secondary)",
          }}>
            {weekCells.map((cell) => (
              <div key={cell.dateStr} style={{
                padding: "14px 8px",
                textAlign: "center",
                borderRight: "1px solid var(--border-dark)",
              }}>
                <div style={{
                  fontSize: "0.73rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: cell.today ? "#3b82f6" : "var(--text-secondary)",
                  marginBottom: "6px",
                }}>
                  {cell.dayOfWeek.slice(0, 3)}
                </div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  background: cell.today ? "#3b82f6" : "transparent",
                  color: cell.today ? "#fff" : "var(--text-primary)",
                  boxShadow: cell.today ? "0 2px 8px rgba(59,130,246,0.4)" : "none",
                }}>
                  {cell.dayNum}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minHeight: "440px" }}>
            {weekCells.map((cell) => {
              const dayEvts = eventsByDate[cell.dateStr] || [];
              const isDrop = dropTargetDate === cell.dateStr;
              return (
                <div
                  key={cell.dateStr}
                  onClick={() => onDateClick && onDateClick(cell.dateStr)}
                  onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, cell.dateStr)}
                  style={{
                    padding: "12px 10px",
                    borderRight: "1px solid var(--border-dark)",
                    background: isDrop
                      ? "rgba(59,130,246,0.1)"
                      : cell.today
                      ? "rgba(59,130,246,0.03)"
                      : "transparent",
                    transition: "background 0.15s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {dayEvts.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      paddingTop: "40px",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                    }}>
                      —
                    </div>
                  ) : (
                    dayEvts.map((evt) => (
                      <EventCard key={evt.id} event={evt} onClick={onEventClick} onDragStart={handleDragStart} compact />
                    ))
                  )}
                  {isDrop && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      border: "2px dashed #3b82f6",
                      pointerEvents: "none",
                      background: "rgba(59,130,246,0.06)",
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "day" && (() => {
        const dayStr = toDateStr(currentDate);
        const dayEvts = eventsByDate[dayStr] || [];
        const isToday = dayStr === TODAY_STR;
        return (
          <div style={{
            border: "1px solid var(--border-dark)",
            borderRadius: "14px",
            overflow: "hidden",
            background: "var(--bg-card)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}>
            <div style={{
              padding: "24px 28px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-dark)",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                fontSize: "1.6rem",
                fontWeight: 800,
                background: isToday ? "#3b82f6" : "var(--bg-card)",
                color: isToday ? "#fff" : "var(--text-primary)",
                border: isToday ? "none" : "1px solid var(--border-dark)",
                boxShadow: isToday ? "0 4px 14px rgba(59,130,246,0.4)" : "none",
              }}>
                {currentDate.getDate()}
              </div>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {currentDate.toLocaleDateString("default", { weekday: "long" })}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {dayEvts.length} post{dayEvts.length !== 1 ? "s" : ""} scheduled
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {dayEvts.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--text-muted)",
                  fontSize: "0.95rem",
                }}>
                  No posts scheduled for this day.
                  <br />
                  <span style={{ fontSize: "0.82rem", color: "#3b82f6", fontWeight: 600, cursor: "pointer" }} onClick={() => onDateClick && onDateClick(dayStr)}>
                    + Click here to schedule one
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {dayEvts.map((evt) => (
                    <EventCard key={evt.id} event={evt} onClick={onEventClick} onDragStart={handleDragStart} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
});

export default Calendar;
