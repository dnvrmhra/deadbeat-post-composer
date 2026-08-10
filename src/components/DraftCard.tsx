import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { deleteDraft, setEditing } from "../features/posts/postsSlice";
import { useAuth } from "../context/AuthContext";
import { PlatformLogo } from "./SocialIcons";

import type { Draft } from "../types/Draft";

interface DraftCardProps {
  draft: Draft;
}

function DraftCard({ draft }: DraftCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const canEdit = user?.role === "Admin" || user?.role === "Editor";
  const canDelete = user?.role === "Admin";

  const allImages = draft.images && draft.images.length > 0
    ? draft.images
    : draft.image
    ? [draft.image]
    : [];

  function handleDelete(): void {
    if (!canDelete) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this draft?"
    );
    if (!confirmDelete) return;
    dispatch(deleteDraft(draft.id));
  }

  function handleEdit(): void {
    if (!canEdit) return;
    dispatch(setEditing(draft));
    navigate("/compose");
  }

  return (
    <div className="draft-card">
      <div className="draft-header">
        <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <PlatformLogo platform={draft.platform} size={20} />
          <span>{draft.platform}</span>
        </h3>
        <span>{draft.date}</span>
      </div>

      {allImages.length > 0 && (
        <div style={{ position: "relative", width: "100%", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
          <img
            src={allImages[activeImgIndex]}
            alt={`Draft ${activeImgIndex + 1}`}
            className="draft-image"
            style={{ width: "100%", maxHeight: "220px", objectFit: "cover", display: "block" }}
          />

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImgIndex((i) => (i - 1 + allImages.length) % allImages.length); }}
                style={{
                  position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%",
                  width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImgIndex((i) => (i + 1) % allImages.length); }}
                style={{
                  position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)",
                  background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%",
                  width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >›</button>
              <span style={{
                position: "absolute", top: "6px", right: "8px", background: "rgba(0,0,0,0.75)",
                color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px", borderRadius: "10px",
              }}>
                {activeImgIndex + 1} / {allImages.length}
              </span>
            </>
          )}
        </div>
      )}

      <p>{draft.content}</p>

      <div className="draft-buttons">
        {user?.role === "Viewer" ? (
          <span
            style={{
              fontSize: "0.75rem",
              background: "rgba(150, 150, 150, 0.15)",
              color: "var(--text-secondary)",
              padding: "4px 10px",
              borderRadius: "4px",
              fontWeight: 500,
            }}
          >
            Read Only Mode (Viewer)
          </span>
        ) : (
          <>
            {canEdit && (
              <button
                className="edit-btn"
                onClick={handleEdit}
              >
                Edit
              </button>
            )}

            <button
              className="delete-btn"
              onClick={handleDelete}
              disabled={!canDelete}
              style={{
                opacity: canDelete ? 1 : 0.4,
                cursor: canDelete ? "pointer" : "not-allowed",
              }}
              title={canDelete ? "Delete Draft" : "Delete requires Admin role"}
            >
              Delete {!canDelete && "(Admin Only)"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default React.memo(DraftCard);