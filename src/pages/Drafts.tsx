import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectAllPosts } from "../features/posts/selectors";
import { loadDrafts } from "../features/posts/postsSlice";
import { useAuth } from "../context/AuthContext";

import DraftCard from "../components/DraftCard";
import DeadbeatCursor from "../components/DeadbeatCursor";
import { TwitterIcon, InstagramIcon, LinkedinIcon, FacebookIcon } from "../components/SocialIcons";

interface LocationState {
  message?: string;
}

function Drafts() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user } = useAuth();

  const state = location.state as LocationState | null;
            
  const [message, setMessage] = useState<string>(
    state?.message || ""
  );
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const drafts = useAppSelector(selectAllPosts);

  useEffect(() => {
    dispatch(loadDrafts());
  }, [dispatch]);

  useEffect(() => {
    if (state?.message) {
      setMessage(state.message);
    }
  }, [state]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const filteredDrafts = drafts.filter((d) => {
    if (platformFilter === "all") return true;
    return d.platform.toLowerCase() === platformFilter.toLowerCase();
  });

  return (
    <div className="page">
      <DeadbeatCursor />
      
      <div className="drafts-header-wrapper">
        <div>
          <h2 className="page-title" style={{ margin: 0 }}>
            Saved Drafts Library
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            View, edit, or delete saved social posts across platforms.
          </p>
        </div>

        {user && (
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", background: "rgba(150, 150, 150, 0.1)", padding: "6px 16px", borderRadius: "20px", border: "1px solid var(--border-dark)" }}>
            Role: <strong>{user.role}</strong>
          </span>
        )}
      </div>

      {message && (
        <div className="success-banner">
          {message}
        </div>
      )}

      {user?.role === "Viewer" && (
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", padding: "12px 16px", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "20px" }}>
          You are viewing drafts with <strong>Viewer permissions</strong>. Edit and Delete actions are restricted.
        </div>
      )}

      <div className="drafts-filter-bar">
        <button
          className={`draft-filter-btn ${platformFilter === "all" ? "active" : ""}`}
          onClick={() => setPlatformFilter("all")}
        >
          All Drafts ({drafts.length})
        </button>

        <button
          className={`draft-filter-btn ${platformFilter === "twitter" ? "active" : ""}`}
          onClick={() => setPlatformFilter("twitter")}
        >
          <TwitterIcon size={16} /> Twitter / X
        </button>

        <button
          className={`draft-filter-btn ${platformFilter === "instagram" ? "active" : ""}`}
          onClick={() => setPlatformFilter("instagram")}
        >
          <InstagramIcon size={16} /> Instagram
        </button>

        <button
          className={`draft-filter-btn ${platformFilter === "linkedin" ? "active" : ""}`}
          onClick={() => setPlatformFilter("linkedin")}
        >
          <LinkedinIcon size={16} /> LinkedIn
        </button>

        <button
          className={`draft-filter-btn ${platformFilter === "facebook" ? "active" : ""}`}
          onClick={() => setPlatformFilter("facebook")}
        >
          <FacebookIcon size={16} /> Facebook
        </button>
      </div>

      {filteredDrafts.length === 0 ? (
        <p className="empty">
          No Drafts Found {platformFilter !== "all" ? `for ${platformFilter}` : ""}
        </p>
      ) : (
        <div className="drafts-grid">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Drafts;