import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JwtModal from "./JwtModal";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isJwtModalOpen, setIsJwtModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("deadbeat_theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
    localStorage.setItem("deadbeat_theme", nextTheme);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="navbar" id="navbar">
        <div className="nav-container">
          <div className="nav-left-section">
            <button
              className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>

            <Link to="/" className="nav-logo">
              <svg className="hive-emblem" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
              </svg>
              <span>Deadbeat<sup>®</sup></span>
            </Link>
          </div>

          <div className="nav-links-center">
            <Link
              className={location.pathname === "/" ? "active" : ""}
              to="/"
            >
              Home
            </Link>

            <Link
              className={location.pathname === "/compose" ? "active" : ""}
              to="/compose"
              style={{
                opacity: user?.role === "Viewer" ? 0.6 : 1,
              }}
              title={user?.role === "Viewer" ? "Compose restricted for Viewers" : "Compose a post"}
            >
              Compose
            </Link>

            <Link
              className={location.pathname === "/drafts" ? "active" : ""}
              to="/drafts"
            >
              Drafts
            </Link>

            <Link
              className={location.pathname === "/calendar" ? "active" : ""}
              to="/calendar"
            >
              Calendar
            </Link>
          </div>

          <div className="nav-right">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
              <svg className="sun-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
              <svg className="moon-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>

            {user ? (
              <>
                <span className="nav-btn secondary-btn" style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {user.username} ({user.role})
                </span>
                <button className="nav-btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-btn-primary">
                Login to Deadbeat®
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className={`menu-overlay ${isMenuOpen ? "open" : ""}`}>
        <div className="menu-content">
          <nav className="menu-links">
            <Link to="/" className="menu-item" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/compose" className="menu-item" onClick={() => setIsMenuOpen(false)}>Compose Post</Link>
            <Link to="/drafts" className="menu-item" onClick={() => setIsMenuOpen(false)}>Drafts</Link>
            <Link to="/calendar" className="menu-item" onClick={() => setIsMenuOpen(false)}>Calendar & Scheduler</Link>
            <Link to="/login" className="menu-item" onClick={() => setIsMenuOpen(false)}>Authentication (JWT)</Link>
          </nav>
          <div className="menu-info">
            <p>Inquiries: <a href="mailto:dnvrmhra@gmail.com">dnvrmhra@gmail.com</a></p>
            <p>Studio location: Chandigarh, India</p>
          </div>
        </div>
      </div>

      <JwtModal isOpen={isJwtModalOpen} onClose={() => setIsJwtModalOpen(false)} />
    </>
  );
}

export default Navbar;