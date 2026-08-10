import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DeadbeatCursor from "../components/DeadbeatCursor";
import { TwitterIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from "../components/SocialIcons";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studioPlatform, setStudioPlatform] = useState<"Twitter" | "Instagram" | "LinkedIn" | "Facebook">("Twitter");
  const [studioContent, setStudioContent] = useState<string>("Wagwan");
  const [timeString, setTimeString] = useState("");

  const handleComposeClick = () => {
    if (user?.role === "Viewer") {
      navigate("/unauthorized");
    } else {
      navigate("/compose");
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const now = new Date();
      setTimeString(now.toLocaleTimeString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = document.getElementById("heroCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width: number, height: number;
    let particles: Array<{
      originX: number;
      originY: number;
      x: number;
      y: number;
      baseRadius: number;
      alpha: number;
      baseAlpha: number;
      angle: number;
    }> = [];
    let animId: number;

    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    function resize() {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      createParticles();
    }

    function createParticles() {
      particles = [];
      const spacing = 32;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const dx = x - width / 2;
          const dy = y - height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
          const baseAlpha = Math.max(0.08, (1 - dist / maxDist) * 0.35);

          particles.push({
            originX: x,
            originY: y,
            x: x,
            y: y,
            baseRadius: Math.max(0.5, (1 - dist / maxDist) * 1.5),
            alpha: baseAlpha,
            baseAlpha,
            angle: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      const isDark = document.body.getAttribute("data-theme") === "dark";
      const particleColor = isDark ? "255, 255, 255" : "20, 20, 20";

      particles.forEach((p) => {
        p.angle += 0.02;

        let currentAlpha = p.baseAlpha;
        let radiusBoost = 0;

        if (mouse.active) {
          const dx = mouse.x - p.originX;
          const dy = mouse.y - p.originY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 95;

          if (dist < maxDistance) {
            const force = (maxDistance - dist) / maxDistance;
            const angle = Math.atan2(dy, dx);
            const targetX = p.originX - Math.cos(angle) * force * 14;
            const targetY = p.originY - Math.sin(angle) * force * 14;

            p.x += (targetX - p.x) * 0.1;
            p.y += (targetY - p.y) * 0.1;

            currentAlpha = Math.min(0.75, p.baseAlpha + force * 0.35);
            radiusBoost = force * 0.8;
          } else {
            p.x += (p.originX - p.x) * 0.08;
            p.y += (p.originY - p.y) * 0.08;
          }
        } else {
          p.x += (p.originX - p.x) * 0.08;
          p.y += (p.originY - p.y) * 0.08;
        }

        const r = p.baseRadius + Math.sin(p.angle) * 0.25 + radiusBoost;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, Math.max(0.2, r), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${particleColor}, ${currentAlpha})`;
        ctx!.fill();
      });

      animId = requestAnimationFrame(animate);
    }

    const heroSection = canvas.parentElement;
    if (heroSection) {
      heroSection.addEventListener("mousemove", handleMouseMove);
      heroSection.addEventListener("mouseleave", handleMouseLeave);
    }

    window.addEventListener("resize", resize);
    resize();
    animate();

    return () => {
      if (heroSection) {
        heroSection.removeEventListener("mousemove", handleMouseMove);
        heroSection.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const canvas = document.getElementById("glitchCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width: number, height: number;
    let timerId: ReturnType<typeof setTimeout>;

    function resize() {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    }

    function renderGlitch() {
      ctx!.clearRect(0, 0, width, height);

      const lineCount = 12;
      ctx!.fillStyle = "rgba(150, 150, 150, 0.04)";
      for (let i = 0; i < lineCount; i++) {
        const y = Math.random() * height;
        const h = Math.random() * 3 + 1;
        ctx!.fillRect(0, y, width, h);
      }

      for (let i = 0; i < 40; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 1;
        const colorChance = Math.random();
        if (colorChance < 0.3) ctx!.fillStyle = "rgba(255, 0, 80, 0.3)";
        else if (colorChance < 0.6) ctx!.fillStyle = "rgba(0, 220, 255, 0.3)";
        else ctx!.fillStyle = "rgba(150, 150, 150, 0.5)";

        ctx!.fillRect(x, y, size, size);
      }

      timerId = setTimeout(renderGlitch, 100);
    }

    window.addEventListener("resize", resize);
    resize();
    renderGlitch();

    return () => {
      window.removeEventListener("resize", resize);
      clearTimeout(timerId);
    };
  }, []);

  return (
    <>
      <DeadbeatCursor />

      <section className="hero-section" id="hero">
        <div className="hero-watermark">DEADBEAT®</div>
        <canvas id="heroCanvas"></canvas>

        <div className="hero-content">
          <h1 className="hero-title">We are Deadbeat<sup>®</sup></h1>
          <p className="hero-subtitle">
            Minimalist social content composer with real-time platform validation and stateless JWT security.
          </p>

          <div className="hero-cta-group">
            <button className="deadbeat-btn-primary" onClick={handleComposeClick}>
              Compose Post {user?.role === "Viewer" && "(Read Only)"}
            </button>
            <button className="deadbeat-btn-secondary" onClick={() => navigate("/drafts")}>
              View Saved Drafts
            </button>
          </div>
        </div>

        <div className="hero-showcase">
          <div className="showcase-card" onClick={handleComposeClick} title="Twitter / X Composer">
            <div className="card-overlay">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <TwitterIcon size={32} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Twitter / X</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>280 Chars</span>
              </div>
            </div>
          </div>

          <div className="showcase-card" onClick={handleComposeClick} title="Instagram Composer">
            <div className="card-overlay">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <InstagramIcon size={32} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Instagram</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>2,200 Chars</span>
              </div>
            </div>
          </div>

          <div className="showcase-card" onClick={handleComposeClick} title="LinkedIn Composer">
            <div className="card-overlay">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <LinkedinIcon size={32} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>LinkedIn</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>3,000 Chars</span>
              </div>
            </div>
          </div>

          <div className="showcase-card" onClick={handleComposeClick} title="Facebook Composer">
            <div className="card-overlay">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <FacebookIcon size={32} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Facebook</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>63,206 Chars</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="section-container">
          <div className="about-header">
            <h2 className="about-title">About Deadbeat<sup>®</sup></h2>
            <p className="about-description">
              Deadbeat is a minimalist social content composer lab crafting timeless brand identities and stateless JWT auth workflows.
            </p>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Logos &amp; Posts Created</span>
              <span className="stat-value">150+</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Platforms Supported</span>
              <span className="stat-value">4</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Stateless JWT Auth</span>
              <span className="stat-value">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">RBAC Security</span>
              <span className="stat-value">Enabled</span>
            </div>
          </div>
        </div>
      </section>

      <section className="playground-section" id="playground">
        <div className="section-container">
          <div className="playground-header">
            <span className="badge-tag">Live Studio</span>
            <h2 className="playground-title">Social Media Live Preview Studio</h2>
            <p className="playground-subtitle">
              Select a target social media channel to preview how your posts render live on X, Instagram, LinkedIn, and Facebook.
            </p>
          </div>

          <div className="playground-canvas-wrapper">
            <div className="lab-controls">
              <button
                className={`lab-btn ${studioPlatform === "Twitter" ? "active" : ""}`}
                onClick={() => setStudioPlatform("Twitter")}
              >
                <TwitterIcon size={16} /> Twitter / X
              </button>
              <button
                className={`lab-btn ${studioPlatform === "Instagram" ? "active" : ""}`}
                onClick={() => setStudioPlatform("Instagram")}
              >
                <InstagramIcon size={16} /> Instagram
              </button>
              <button
                className={`lab-btn ${studioPlatform === "LinkedIn" ? "active" : ""}`}
                onClick={() => setStudioPlatform("LinkedIn")}
              >
                <LinkedinIcon size={16} /> LinkedIn
              </button>
              <button
                className={`lab-btn ${studioPlatform === "Facebook" ? "active" : ""}`}
                onClick={() => setStudioPlatform("Facebook")}
              >
                <FacebookIcon size={16} /> Facebook
              </button>
            </div>

            <div className="social-mock-post" style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "24px", border: "1px solid var(--border-dark)" }}>
              <div className="mock-post-user" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                }}>
                  <img
                    src="/avatar.jpg"
                    alt="profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 38%",
                      display: "block",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    Deadbeat® Official
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    @deadbeat_studio • Live Preview
                  </div>
                </div>
              </div>

              <textarea
                value={studioContent}
                onChange={(e) => setStudioContent(e.target.value)}
                style={{ width: "100%", height: "90px", fontSize: "0.95rem", marginBottom: "14px" }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)", paddingTop: "10px", borderTop: "1px solid var(--border-dark)" }}>
                <span>Channel: <strong>{studioPlatform}</strong></span>
                <span>Length: {studioContent.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="logo-marquee-section">
        <div className="marquee-track">
          <div className="marquee-content">
            <div className="client-logo"><TwitterIcon size={18} /> Twitter (280 Max)</div>
            <div className="client-logo"><InstagramIcon size={18} /> Instagram (2.2k Max)</div>
            <div className="client-logo"><LinkedinIcon size={18} /> LinkedIn (3k Max)</div>
            <div className="client-logo"><FacebookIcon size={18} /> Facebook (63k Max)</div>
          </div>
          <div className="marquee-content" aria-hidden="true">
            <div className="client-logo"><TwitterIcon size={18} /> Twitter (280 Max)</div>
            <div className="client-logo"><InstagramIcon size={18} /> Instagram (2.2k Max)</div>
            <div className="client-logo"><LinkedinIcon size={18} /> LinkedIn (3k Max)</div>
            <div className="client-logo"><FacebookIcon size={18} /> Facebook (63k Max)</div>
          </div>
        </div>
      </section>

      <footer className="footer-section" id="contact-footer">
        <div className="footer-container">
          <div className="footer-banner">
            <canvas id="glitchCanvas"></canvas>
            <h2 className="footer-glitch-text">Deadbeat Studio<sup>®</sup></h2>
          </div>

          <div className="footer-bottom">
            <a href="mailto:dnvrmhra@gmail.com" className="footer-email">dnvrmhra@gmail.com</a>
            <div className="footer-time">
              {timeString || "10:11 AM"} • Chandigarh, India
            </div>
          </div>

          <div className="footer-watermark">
            REGISTERED TRADEMARK ® • DEADBEAT STUDIO LAB
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;