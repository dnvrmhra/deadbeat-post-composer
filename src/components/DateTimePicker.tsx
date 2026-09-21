import React, { useState, useEffect, useRef, useCallback } from "react";

interface DateTimePickerProps {
  value: string;
  onChange: (isoString: string) => void;
  min?: string;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fmtDisplay(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function DateTimePicker({ value, onChange, min }: DateTimePickerProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [open, setOpen]       = useState(false);
  const [theme, setTheme]     = useState<"dark"|"light">(() =>
    (document.body.getAttribute("data-theme") as "dark"|"light") || "dark"
  );

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme((document.body.getAttribute("data-theme") as "dark"|"light") || "dark");
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const now   = value ? new Date(value) : new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selDate,   setSelDate]   = useState(value ? toLocalDateStr(new Date(value)) : "");
  const [hour,      setHour]      = useState(value ? new Date(value).getHours()   : 10);
  const [minute,    setMinute]    = useState(value ? new Date(value).getMinutes() : 0);
  const [ampm,      setAmpm]      = useState<"AM"|"PM">(value ? (new Date(value).getHours() >= 12 ? "PM" : "AM") : "AM");

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commit = useCallback((dateStr: string, h: number, m: number, ap: "AM"|"PM") => {
    if (!dateStr) return;
    let h24 = h % 12;
    if (ap === "PM") h24 += 12;
    const iso = new Date(`${dateStr}T${String(h24).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`).toISOString();
    onChange(iso);
  }, [onChange]);

  function selectDate(ds: string) {
    setSelDate(ds);
    commit(ds, hour, minute, ampm);
  }

  function changeHour(delta: number) {
    const nh = ((hour - 1 + delta + 12) % 12) + 1;
    setHour(nh);
    commit(selDate, nh, minute, ampm);
  }
  function changeMinute(delta: number) {
    const nm = (minute + delta + 60) % 60;
    setMinute(nm);
    commit(selDate, hour, nm, ampm);
  }
  function toggleAmpm() {
    const nap: "AM"|"PM" = ampm === "AM" ? "PM" : "AM";
    setAmpm(nap);
    commit(selDate, hour, minute, nap);
  }

  function clearValue() {
    setSelDate("");
    onChange("");
    setOpen(false);
  }

  const dark = theme === "dark";
  const bg        = dark ? "#111" : "#fff";
  const surface   = dark ? "#1a1a1a" : "#f8fafc";
  const border    = dark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const textPri   = dark ? "#fff" : "#0f172a";
  const textMuted = dark ? "#666" : "#94a3b8";
  const accent    = "#3b82f6";
  const hoverBg   = dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)";
  const todayStr  = toLocalDateStr(new Date());
  const minDateStr = min ? min.slice(0,10) : "";

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { ds: string; day: number; cur: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(viewYear, viewMonth - 1, prevDays - i);
    cells.push({ ds: toLocalDateStr(d), day: prevDays - i, cur: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ ds: toLocalDateStr(new Date(viewYear, viewMonth, d)), day: d, cur: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ ds: toLocalDateStr(new Date(viewYear, viewMonth + 1, d)), day: d, cur: false });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 40px 11px 14px",
    borderRadius: "10px",
    border: `1px solid ${open ? accent : border}`,
    background: dark ? "#161616" : "#f8fafc",
    color: value ? textPri : textMuted,
    fontSize: "0.92rem",
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          userSelect: "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={value ? textPri : textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{ flex: 1 }}>
          {value ? fmtDisplay(value) : "Pick a date & time..."}
        </span>
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); clearValue(); }}
            style={{ color: textMuted, fontSize: "14px", cursor: "pointer", padding: "0 2px" }}
            title="Clear"
          >✕</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={textMuted} strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          zIndex: 100000,
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: "16px",
          boxShadow: dark
            ? "0 24px 64px rgba(0,0,0,0.7)"
            : "0 12px 40px rgba(15,23,42,0.15)",
          width: "340px",
          animation: "dtpFadeIn 0.18s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <style>{`@keyframes dtpFadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          <div style={{ padding: "16px 16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <button
                onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }}
                style={navBtnStyle(dark)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: textPri, letterSpacing: "-0.01em" }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>

              <button
                onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }}
                style={navBtnStyle(dark)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: "8px" }}>
              {DAYS_SHORT.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: textMuted, padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: "12px" }}>
              {cells.map((cell, i) => {
                const isSelected  = cell.ds === selDate;
                const isToday     = cell.ds === todayStr;
                const isPast      = minDateStr ? cell.ds < minDateStr : false;
                const isDisabled  = !cell.cur || isPast;

                return (
                  <button
                    key={i}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && selectDate(cell.ds)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      border: isToday && !isSelected ? `1px solid ${accent}` : "1px solid transparent",
                      borderRadius: "8px",
                      background: isSelected ? accent : "transparent",
                      color: isSelected ? "#fff" : isDisabled ? textMuted : cell.cur ? textPri : dark ? "#333" : "#ccc",
                      fontSize: "0.82rem",
                      fontWeight: isSelected || isToday ? 700 : 400,
                      cursor: isDisabled ? "default" : "pointer",
                      opacity: isDisabled && !isToday ? 0.35 : 1,
                      transition: "background 0.12s, color 0.12s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      ...(isDisabled ? {} : {
                        ["&:hover" as string]: { background: isSelected ? accent : hoverBg }
                      }),
                    }}
                    onMouseEnter={e => {
                      if (!isDisabled && !isSelected)
                        (e.target as HTMLElement).style.background = hoverBg;
                    }}
                    onMouseLeave={e => {
                      if (!isDisabled && !isSelected)
                        (e.target as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            borderTop: `1px solid ${border}`,
            padding: "14px 16px",
            background: surface,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px", flexShrink: 0 }}>
              Time
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
              <TimeSpinner value={hour} onUp={() => changeHour(1)} onDown={() => changeHour(-1)} dark={dark} />
              <span style={{ color: textMuted, fontWeight: 700, fontSize: "1.1rem" }}>:</span>
              <TimeSpinner value={minute} onUp={() => changeMinute(1)} onDown={() => changeMinute(-1)} dark={dark} pad />
              <button
                onClick={toggleAmpm}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: `1px solid ${border}`,
                  background: dark ? "#222" : "#fff",
                  color: accent,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "background 0.15s",
                }}
              >
                {ampm}
              </button>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => {
                  const td = toLocalDateStr(new Date());
                  setSelDate(td);
                  setViewYear(new Date().getFullYear());
                  setViewMonth(new Date().getMonth());
                  commit(td, hour, minute, ampm);
                }}
                style={footerBtnStyle(dark, border, textMuted)}
              >
                Today
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  ...footerBtnStyle(dark, border, textMuted),
                  background: accent,
                  color: "#fff",
                  border: `1px solid ${accent}`,
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeSpinner({
  value, onUp, onDown, dark, pad = false,
}: {
  value: number;
  onUp: () => void; onDown: () => void;
  dark: boolean; pad?: boolean;
}) {
  const display = pad ? String(value).padStart(2,"0") : String(value % 12 === 0 ? 12 : value % 12).padStart(2,"0");
  const border  = dark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const textPri = dark ? "#fff" : "#0f172a";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <button onClick={onUp} style={spinnerBtnStyle(dark, border)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
      </button>
      <div style={{
        width: "38px",
        textAlign: "center",
        fontWeight: 700,
        fontSize: "1.05rem",
        color: textPri,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.03em",
      }}>
        {display}
      </div>
      <button onClick={onDown} style={spinnerBtnStyle(dark, border)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    </div>
  );
}

function navBtnStyle(dark: boolean): React.CSSProperties {
  return {
    width: "30px", height: "30px",
    borderRadius: "8px",
    border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)"}`,
    background: dark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
    color: dark ? "#999" : "#475569",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 0,
    transition: "background 0.15s",
  };
}

function spinnerBtnStyle(dark: boolean, border: string): React.CSSProperties {
  return {
    width: "24px", height: "20px",
    border: `1px solid ${border}`,
    borderRadius: "6px",
    background: dark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
    color: dark ? "#777" : "#64748b",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 0,
    transition: "background 0.12s",
  };
}

function footerBtnStyle(dark: boolean, border: string, color: string): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: "8px",
    border: `1px solid ${border}`,
    background: dark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
    color,
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap" as const,
  };
}
