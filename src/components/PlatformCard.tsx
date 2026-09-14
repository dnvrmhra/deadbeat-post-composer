import React from "react";
import { TwitterIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from "./SocialIcons";

const platforms = [
  { name: "Twitter",   icon: <TwitterIcon size={22} />,   sub: "280 chars",    color: "#1d9bf0", activeBg: "#1d9bf0" },
  { name: "Instagram", icon: <InstagramIcon size={22} />, sub: "2,200 chars",  color: "#e1306c", activeBg: "#e1306c" },
  { name: "LinkedIn",  icon: <LinkedinIcon size={22} />,  sub: "3,000 chars",  color: "#0a66c2", activeBg: "#0a66c2" },
  { name: "Facebook",  icon: <FacebookIcon size={22} />,  sub: "63,206 chars", color: "#1877f2", activeBg: "#1877f2" },
];

interface PlatformCardProps {
  selectedPlatforms: string[];
  onToggle: (platform: string) => void;
}

function PlatformCard({ selectedPlatforms, onToggle }: PlatformCardProps) {
  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
      }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Target Platforms
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          {selectedPlatforms.length} selected
        </span>
      </div>

      <div className="platform-grid">
        {platforms.map((item) => {
          const isActive = selectedPlatforms.includes(item.name);
          return (
            <div
              key={item.name}
              className="platform-card"
              onClick={() => onToggle(item.name)}
              style={{
                border: isActive ? `2px solid ${item.color}` : "1px solid var(--border-dark)",
                background: isActive ? `${item.color}14` : "rgba(150,150,150,0.05)",
                position: "relative",
                paddingTop: isActive ? "15px" : "16px",
                paddingLeft: isActive ? "11px" : "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ color: isActive ? item.color : "var(--text-secondary)" }}>
                  {item.icon}
                </div>
                <div style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  border: isActive ? `2px solid ${item.color}` : "2px solid var(--border-dark)",
                  background: isActive ? item.color : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}>
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "8px" }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  color: isActive ? item.color : "var(--text-primary)",
                  transition: "color 0.15s",
                }}>
                  {item.name}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  {item.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(PlatformCard);