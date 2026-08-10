import React from "react";
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

  const canEdit = user?.role === "Admin" || user?.role === "Editor";
  const canDelete = user?.role === "Admin";

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
    dispatch(setEditing(draft.id));
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

      {draft.image && (
        <img
          src={draft.image}
          alt="Draft"
          className="draft-image"
        />
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