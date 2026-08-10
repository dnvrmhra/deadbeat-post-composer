import React, { useState, useEffect } from "react";

interface SocialPreviewProps {
  platform: string;
  content: string;
  images?: string[];
}

const AVATAR_SRC = "/avatar.jpg";

function useTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (document.body.getAttribute("data-theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const t = document.body.getAttribute("data-theme") as "dark" | "light";
      setTheme(t || "dark");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function Avatar({
  size = 50,
  ring = false,
  ringBg = "#000",
}: {
  size?: number;
  ring?: boolean;
  ringBg?: string;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
      ...(ring ? { background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", padding: "2.5px" } : {}),
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden",
        ...(ring ? { padding: "1.5px", background: ringBg } : {}),
      }}>
        <img src={AVATAR_SRC} alt="profile" style={{
          width: "100%", height: "100%", objectFit: "cover",
          objectPosition: "center 38%", borderRadius: "50%", display: "block",
        }} />
      </div>
    </div>
  );
}

function ImageCarousel({
  images,
  dark,
  aspectRatio = "square",
}: {
  images: string[];
  dark: boolean;
  aspectRatio?: "square" | "wide";
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => { setIndex(0); }, [images]);

  if (!images || images.length === 0) return null;

  const bg = dark ? "#111" : "#f0f0f0";
  const btnBg = "rgba(0,0,0,0.55)";
  const ratio = aspectRatio === "square" ? "1/1" : "16/9";

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: ratio, background: bg, overflow: "hidden" }}>
      <img
        src={images[index]}
        alt={`slide ${index + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", transition: "opacity 0.2s" }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            style={{
              position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)",
              background: btnBg, border: "none", borderRadius: "50%", width: "28px", height: "28px",
              color: "#fff", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>

          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            style={{
              position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
              background: btnBg, border: "none", borderRadius: "50%", width: "28px", height: "28px",
              color: "#fff", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>

          <div style={{
            position: "absolute", top: "8px", right: "10px",
            background: "rgba(0,0,0,0.6)", borderRadius: "12px", padding: "2px 9px",
            fontSize: "11px", color: "#fff", fontWeight: 700, letterSpacing: "0.03em",
          }}>
            {index + 1} / {images.length}
          </div>

          <div style={{
            position: "absolute", bottom: "8px", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: "5px",
          }}>
            {images.map((_, i) => (
              <div
                key={i}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? "16px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i === index ? "#fff" : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TwitterPreview({ content, images, dark }: { content: string; images?: string[]; dark: boolean }) {
  const charCount = content.length;
  const remaining = 280 - charCount;
  const pct = Math.min((charCount / 280) * 100, 100);
  const ringColor = remaining < 0 ? "#f4212e" : remaining < 20 ? "#ffd400" : "#1d9bf0";

  const bg        = dark ? "#000"    : "#ffffff";
  const border    = dark ? "#2f3336" : "#eff3f4";
  const textPri   = dark ? "#e7e9ea" : "#0f1419";
  const textMuted = dark ? "#71767b" : "#536471";
  const divider   = dark ? "#2f3336" : "#eff3f4";

  return (
    <div style={{ background: bg, borderRadius: "18px", padding: "18px", border: `1px solid ${border}`, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: textPri }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <Avatar size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: textPri }}>Deadbeat® Official</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d9bf0">
              <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.68.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91c-1.31.66-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.66 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
            </svg>
            <span style={{ fontSize: "0.88rem", color: textMuted }}>@deadbeat_studio · now</span>
          </div>

          <div style={{ fontSize: "1rem", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word", color: content ? textPri : textMuted, fontStyle: content ? "normal" : "italic", marginBottom: "10px" }}>
            {content || "What's happening?"}
          </div>

          {images && images.length > 0 && (
            <div style={{ marginBottom: "12px", borderRadius: "14px", overflow: "hidden", border: `1px solid ${divider}` }}>
              <ImageCarousel images={images} dark={dark} aspectRatio="wide" />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: `1px solid ${divider}`, color: textMuted, fontSize: "0.82rem" }}>
            {[
              { d: "M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 7.501 4.435 7.501 8 0 4.21-3.105 7.999-7.501 7.999h-3.502c-4.365 0-8.369-3.249-8.369-7.999zm8.378-6H9.75v.01h-.01L7.62 6h-.01C5.28 6 3.5 7.86 3.5 10s1.77 4 4.12 4h8.37c2.35 0 4.01-1.86 4.01-4s-1.66-4.01-4.01-4.01H10.13z", n: "24" },
              { d: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z", n: "1.2K" },
              { d: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z", n: "847" },
              { d: "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z", n: "" },
            ].map(({ d, n }) => (
              <div key={n + d.slice(0, 6)} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
                {n && <span>{n}</span>}
              </div>
            ))}
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="9" fill="none" stroke={divider} strokeWidth="2.2" />
              <circle cx="11" cy="11" r="9" fill="none" stroke={ringColor} strokeWidth="2.2"
                strokeDasharray={`${2 * Math.PI * 9}`}
                strokeDashoffset={`${2 * Math.PI * 9 * (1 - pct / 100)}`}
                strokeLinecap="round" transform="rotate(-90 11 11)"
              />
              {remaining < 20 && (
                <text x="11" y="15" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={ringColor}>{remaining}</text>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramPreview({ content, images, dark }: { content: string; images?: string[]; dark: boolean }) {
  const bg        = dark ? "#000"    : "#fafafa";
  const card      = dark ? "#000"    : "#ffffff";
  const border    = dark ? "#262626" : "#dbdbdb";
  const textPri   = dark ? "#f5f5f5" : "#262626";
  const textMuted = dark ? "#a8a8a8" : "#8e8e8e";
  const iconColor = dark ? "#f5f5f5" : "#262626";

  return (
    <div style={{ background: bg, borderRadius: "12px", border: `1px solid ${border}`, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: textPri, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: card }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar size={44} ring ringBg={dark ? "#000" : "#fff"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: textPri }}>deadbeat_studio</div>
            <div style={{ fontSize: "0.75rem", color: textMuted }}>Sponsored</div>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={textMuted}>
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </div>

      {images && images.length > 0 ? (
        <ImageCarousel images={images} dark={dark} aspectRatio="square" />
      ) : (
        <div style={{ width: "100%", aspectRatio: "1/1", background: dark ? "#111" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: dark ? "#444" : "#bbb" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div style={{ fontSize: "0.78rem", marginTop: "6px" }}>Add an image</div>
          </div>
        </div>
      )}

      <div style={{ padding: "12px 16px 10px", background: card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            {["M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
              "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
              "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"].map((d) => (
              <svg key={d.slice(0, 10)} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.7" strokeLinecap="round">
                <path d={d} />
              </svg>
            ))}
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.7" strokeLinecap="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "5px", color: textPri }}>1,204 likes</div>
        <div style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: textPri }}>deadbeat_studio </span>
          <span style={{ color: content ? textPri : textMuted, fontStyle: content ? "normal" : "italic" }}>
            {content || "Write a caption..."}
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", color: textMuted, marginTop: "5px" }}>View all 48 comments</div>
        <div style={{ fontSize: "0.73rem", color: dark ? "#555" : "#c7c7c7", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>1 hour ago</div>
      </div>
    </div>
  );
}

function LinkedInPreview({ content, images, dark }: { content: string; images?: string[]; dark: boolean }) {
  const bg        = dark ? "#1b1f23" : "#f3f2ef";
  const card      = dark ? "#1b1f23" : "#ffffff";
  const border    = dark ? "#2d3748" : "#e0e0e0";
  const textPri   = dark ? "#e2e8f0" : "rgba(0,0,0,0.9)";
  const textSub   = dark ? "#94a3b8" : "rgba(0,0,0,0.6)";
  const textMuted = dark ? "#64748b" : "rgba(0,0,0,0.45)";
  const actionClr = dark ? "#94a3b8" : "rgba(0,0,0,0.6)";
  const btnBg     = dark ? "rgba(100,149,237,0.12)" : "rgba(10,102,194,0.08)";
  const btnBorder = dark ? "rgba(100,149,237,0.3)"  : "rgba(10,102,194,0.35)";
  const btnColor  = dark ? "#7eb3ff" : "#0a66c2";

  const truncated = content.length > 220;
  const displayContent = truncated ? content.slice(0, 220) : content;

  return (
    <div style={{ background: bg, borderRadius: "8px", border: `1px solid ${border}`, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: textPri, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 16px 0", background: card }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <Avatar size={52} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: textPri, lineHeight: 1.3 }}>Deadbeat® Official</div>
            <div style={{ fontSize: "0.8rem", color: textSub, lineHeight: 1.3 }}>Creative Director &amp; Brand Strategist</div>
            <div style={{ fontSize: "0.75rem", color: textMuted, marginTop: "2px" }}>1h · Public</div>
          </div>
        </div>
        <button style={{ background: btnBg, border: `1px solid ${btnBorder}`, borderRadius: "20px", padding: "5px 16px", color: btnColor, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
          + Follow
        </button>
      </div>

      <div style={{ padding: "12px 16px", fontSize: "0.95rem", lineHeight: 1.65, color: content ? textPri : textMuted, fontStyle: content ? "normal" : "italic", whiteSpace: "pre-wrap", wordBreak: "break-word", background: card }}>
        {content ? displayContent : "Share an update, article, or idea..."}
        {truncated && <span style={{ color: btnColor, cursor: "pointer", fontWeight: 600 }}> ...more</span>}
      </div>

      {images && images.length > 0 && (
        <div style={{ borderTop: `1px solid ${border}` }}>
          <ImageCarousel images={images} dark={dark} aspectRatio="wide" />
        </div>
      )}

      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, fontSize: "0.8rem", color: textMuted, background: card }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>👍</span><span>❤️</span><span>💡</span>
          <span style={{ marginLeft: "4px" }}>2,841</span>
        </div>
        <span>147 comments · 38 reposts</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: card }}>
        {[
          { label: "Like",    d: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" },
          { label: "Comment", d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
          { label: "Repost",  d: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" },
          { label: "Send",    d: "M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" },
        ].map(({ label, d }) => (
          <button key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "10px 4px", background: "transparent", border: "none", cursor: "pointer", color: actionClr, fontSize: "0.78rem", fontWeight: 600, borderRadius: "4px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={d} />
            </svg>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FacebookPreview({ content, images, dark }: { content: string; images?: string[]; dark: boolean }) {
  const bg        = dark ? "#242526" : "#ffffff";
  const border    = dark ? "#3a3b3c" : "#ddd";
  const textPri   = dark ? "#e4e6eb" : "#1c1e21";
  const textMuted = dark ? "#b0b3b8" : "#65676b";
  const btnBg     = dark ? "#3a3b3c" : "#e4e6eb";

  return (
    <div style={{ background: bg, borderRadius: "8px", border: `1px solid ${border}`, fontFamily: "Helvetica,Arial,sans-serif", color: textPri, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar size={46} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: textPri }}>Deadbeat® Official</div>
            <div style={{ fontSize: "0.76rem", color: textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
              Just now ·
              <svg width="11" height="11" viewBox="0 0 24 24" fill={textMuted}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={{ background: btnBg, border: "none", borderRadius: "6px", padding: "7px 12px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", color: textPri }}>+ Follow</button>
          <button style={{ background: "transparent", border: "none", cursor: "pointer", color: textMuted }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: "0 16px 14px", fontSize: "1rem", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", color: content ? textPri : textMuted, fontStyle: content ? "normal" : "italic" }}>
        {content || "What's on your mind?"}
      </div>

      {images && images.length > 0 && (
        <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
          <ImageCarousel images={images} dark={dark} aspectRatio="wide" />
        </div>
      )}

      <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${border}`, fontSize: "0.82rem", color: textMuted }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <span>👍</span><span>❤️</span><span>😂</span>
          <span style={{ marginLeft: "4px" }}>1.2K</span>
        </div>
        <span>94 comments · 21 shares</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "Like",    d: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" },
          { label: "Comment", d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
          { label: "Share",   d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" },
        ].map(({ label, d }) => (
          <button key={label} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "11px", background: "transparent", border: "none", cursor: "pointer", color: textMuted, fontWeight: 700, fontSize: "0.9rem", borderRadius: "4px" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={d} />
            </svg>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const SocialPreview: React.FC<SocialPreviewProps> = ({ platform, content, images }) => {
  const theme = useTheme();
  const dark = theme === "dark";

  switch (platform) {
    case "Twitter":   return <TwitterPreview   content={content} images={images} dark={dark} />;
    case "Instagram": return <InstagramPreview content={content} images={images} dark={dark} />;
    case "LinkedIn":  return <LinkedInPreview  content={content} images={images} dark={dark} />;
    case "Facebook":  return <FacebookPreview  content={content} images={images} dark={dark} />;
    default:          return <TwitterPreview   content={content} images={images} dark={dark} />;
  }
};

export default SocialPreview;
