import React from "react";
import { TwitterIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from "./SocialIcons";

const platforms = [
  { name: "Twitter", icon: <TwitterIcon size={26} />, sub: "Max 280 chars" },
  { name: "Instagram", icon: <InstagramIcon size={26} />, sub: "Max 2,200 chars" },
  { name: "LinkedIn", icon: <LinkedinIcon size={26} />, sub: "Max 3,000 chars" },
  { name: "Facebook", icon: <FacebookIcon size={26} />, sub: "Max 63,206 chars" },
];

interface PlatformCardProps {
  platform: string;
  setPlatform: (platform: string) => void;
}

function PlatformCard({
  platform,
  setPlatform,
}: PlatformCardProps) {
  return (
    <div className="platform-grid">
      {platforms.map((item) => {
        const isActive = platform === item.name;
        return (
          <div
            key={item.name}
            className={`platform-card ${isActive ? "active-platform" : ""}`}
            onClick={() => setPlatform(item.name)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>{item.icon}</div>
              {isActive && <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>✓ Selected</span>}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{item.name}</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.8, marginTop: "2px" }}>{item.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(PlatformCard);