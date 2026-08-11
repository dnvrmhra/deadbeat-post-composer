import { useEffect, type ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setEditorContent,
  addEditorImage,
  removeEditorImage,
  reorderEditorImages,
  setEditorPlatform,
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

function Composer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadDrafts());
  }, [dispatch]);

  const {
    platform,
    content,
    images = [],
    editing,
    editingId,
    scheduledAt,
  } = useAppSelector((state) => state.posts.editor);

  const validation = validatePost(platform, content, images);

  function handleSave(): void {
    if (!validation.valid) return;

    const basePayload = {
      platform,
      content,
      images,
      image: images[0],
      date: scheduledAt
        ? scheduledAt.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      scheduledAt: scheduledAt || new Date().toISOString(),
    };

    if (editing && editingId) {
      dispatch(updateDraft({ id: editingId, changes: { ...basePayload, id: editingId } }));
    } else {
      dispatch(createDraft(basePayload));
    }

    dispatch(clearEditor());

    navigate("/drafts", {
      state: {
        message: editing
          ? "Draft updated successfully!"
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
            Select a target platform, write your content, and attach media for real-time validation.
          </p>

          <PlatformCard
            platform={platform}
            setPlatform={(p) => dispatch(setEditorPlatform(p))}
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

          <CharacterCounter platform={platform} count={content.length} />
          <ValidationMessage validation={validation} />
          <Button
            text={editing ? "Update Draft" : "Save Draft"}
            onClick={handleSave}
          />
        </div>

        <div className="composer-preview-card">
          <div className="preview-card-header">
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-secondary)" }}>
              Live Post Preview
            </span>
            <span style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "20px",
              background: "rgba(150,150,150,0.1)",
              border: "1px solid var(--border-dark)",
              color: "var(--text-secondary)",
            }}>
              {platform}
            </span>
          </div>

          <SocialPreview
            platform={platform}
            content={content}
            images={images}
          />
        </div>
      </div>
    </div>
  );
}

export default Composer;