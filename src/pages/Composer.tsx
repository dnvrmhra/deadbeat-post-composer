import { useEffect, useState, type ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setEditorContent,
  addEditorImage,
  removeEditorImage,
  reorderEditorImages,
  toggleSelectedPlatform,
  setEditorScheduledAt,
  clearEditor,
  loadDrafts,
  createDraft,
  updateDraft,
} from "../features/posts/postsSlice";

import { useNavigate } from "react-router-dom";

import PlatformCard from "../components/PlatformCard";
import CharacterCounter from "../components/CharacterCounter";
import ValidationMessage from "../components/ValidationMessage";
import Button from "../components/Button";
import ImageUploader from "../components/ImageUploader";
import DeadbeatCursor from "../components/DeadbeatCursor";
import SocialPreview from "../components/SocialPreview";
import DateTimePicker from "../components/DateTimePicker";

import { validatePost } from "../utils/validation";

const PLATFORM_COLORS: Record<string, string> = {
  Twitter:   "#1d9bf0",
  Instagram: "#e1306c",
  LinkedIn:  "#0a66c2",
  Facebook:  "#1877f2",
};

function Composer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadDrafts());
  }, [dispatch]);

  const {
    selectedPlatforms,
    content,
    images = [],
    editing,
    editingId,
    scheduledAt,
  } = useAppSelector((state) => state.posts.editor);

  const [previewPlatform, setPreviewPlatform] = useState<string>(selectedPlatforms[0] || "Twitter");

  useEffect(() => {
    if (!selectedPlatforms.includes(previewPlatform)) {
      setPreviewPlatform(selectedPlatforms[0] || "Twitter");
    }
  }, [selectedPlatforms, previewPlatform]);

  const validation = validatePost(previewPlatform, content, images);

  function handleToggle(p: string) {
    if (selectedPlatforms.includes(p) && selectedPlatforms.length === 1) return;
    dispatch(toggleSelectedPlatform(p));
  }

  function handleSave(): void {
    if (!validation.valid) return;

    const baseDate = scheduledAt
      ? scheduledAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const baseScheduledAt = scheduledAt || new Date().toISOString();

    if (editing && editingId) {
      dispatch(updateDraft({
        id: editingId,
        changes: {
          id: editingId,
          platform: selectedPlatforms[0],
          content,
          images,
          image: images[0],
          date: baseDate,
          scheduledAt: baseScheduledAt,
        },
      }));
    } else {
      selectedPlatforms.forEach((platform) => {
        dispatch(createDraft({
          platform,
          content,
          images,
          image: images[0],
          date: baseDate,
          scheduledAt: baseScheduledAt,
        }));
      });
    }

    dispatch(clearEditor());

    navigate("/drafts", {
      state: {
        message: editing
          ? "Draft updated successfully!"
          : selectedPlatforms.length > 1
            ? `Saved ${selectedPlatforms.length} drafts successfully!`
            : "Draft saved successfully!",
      },
    });
  }

  return (
    <div className="page">
      <DeadbeatCursor />

      <div className="composer-page-split">
        <div className="composer-card">
          <h2>{editing ? "Edit Draft" : "Compose Post"}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
            Select one or more platforms, write your content, and attach media.
          </p>

          <PlatformCard
            selectedPlatforms={selectedPlatforms}
            onToggle={handleToggle}
          />

          <div style={{ position: "relative" }}>
            <textarea
              placeholder="What's happening today? Type your post content..."
              value={content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                dispatch(setEditorContent(e.target.value))
              }
            />
          </div>

          <ImageUploader
            images={images}
            onAdd={(img) => dispatch(addEditorImage(img))}
            onRemove={(index) => dispatch(removeEditorImage(index))}
            onReorder={(from, to) => dispatch(reorderEditorImages({ from, to }))}
          />

          <div style={{ marginTop: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              Schedule Date &amp; Time
            </label>
            <DateTimePicker
              value={scheduledAt}
              onChange={(iso) => dispatch(setEditorScheduledAt(iso))}
              min={new Date().toISOString()}
            />
            {!scheduledAt && (
              <div style={{ fontSize: "0.77rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                No schedule set — will be saved with the current timestamp.
              </div>
            )}
          </div>

          <CharacterCounter platform={previewPlatform} count={content.length} />
          <ValidationMessage validation={validation} />

          <Button
            text={
              editing
                ? "Update Draft"
                : selectedPlatforms.length > 1
                  ? `Save ${selectedPlatforms.length} Drafts`
                  : "Save Draft"
            }
            onClick={handleSave}
          />
        </div>

        <div className="composer-preview-card">
          <div className="preview-card-header">
            <span style={{
              fontSize: "0.8rem", textTransform: "uppercase",
              letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-secondary)",
            }}>
              Live Preview
            </span>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {selectedPlatforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPreviewPlatform(p)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "20px",
                    border: `1.5px solid ${previewPlatform === p ? PLATFORM_COLORS[p] : "var(--border-dark)"}`,
                    background: previewPlatform === p ? `${PLATFORM_COLORS[p]}18` : "transparent",
                    color: previewPlatform === p ? PLATFORM_COLORS[p] : "var(--text-secondary)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    transition: "all 0.15s ease",
                    letterSpacing: "0.02em",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <SocialPreview
            platform={previewPlatform}
            content={content}
            images={images}
          />

          {selectedPlatforms.length > 1 && (
            <div style={{
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(150,150,150,0.06)",
              border: "1px solid var(--border-dark)",
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Saving to {selectedPlatforms.join(", ")}. Click a platform tab above to preview how it looks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Composer;