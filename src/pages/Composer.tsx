import { useEffect, useState, useCallback, type ChangeEvent } from "react";
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
import { useToast } from "../context/ToastContext";

import PlatformCard from "../components/PlatformCard";
import CharacterCounter from "../components/CharacterCounter";
import ValidationMessage from "../components/ValidationMessage";
import Button from "../components/Button";
import ImageUploader from "../components/ImageUploader";
import DeadbeatCursor from "../components/DeadbeatCursor";
import SocialPreview from "../components/SocialPreview";
import DateTimePicker from "../components/DateTimePicker";

import { validatePost, getCharacterLimit } from "../utils/validation";
import { backendApi } from "../api/backendApi";

const PLATFORM_COLORS: Record<string, string> = {
  Twitter:   "#1d9bf0",
  Instagram: "#e1306c",
  LinkedIn:  "#0a66c2",
  Facebook:  "#1877f2",
};

const QUICK_HASHTAGS = [
  "#tech", "#design", "#marketing", "#social", "#creative",
  "#updates", "#launch", "#announcement", "#trending", "#growth",
];

// ─── Progress Ring SVG ────────────────────────────────────────────────────────
function ProgressRing({ platform, count }: { platform: string; count: number }) {
  const limit = getCharacterLimit(platform);
  const ratio = Math.min(count / limit, 1);
  const r = 9;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - ratio);
  const color =
    ratio >= 1 ? "#ef4444" : ratio >= 0.9 ? "#f59e0b" : PLATFORM_COLORS[platform];

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle cx="11" cy="11" r={r} fill="none" stroke="rgba(150,150,150,0.15)" strokeWidth="2" />
      {/* Progress */}
      <circle
        cx="11" cy="11" r={r}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dashoffset 0.2s ease, stroke 0.2s ease" }}
      />
    </svg>
  );
}

function Composer() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

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
  const [saving, setSaving] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    if (!selectedPlatforms.includes(previewPlatform)) {
      setPreviewPlatform(selectedPlatforms[0] || "Twitter");
    }
  }, [selectedPlatforms, previewPlatform]);

  // Validate against most restrictive selected platform
  const strictestValidation = selectedPlatforms.reduce(
    (worst, p) => {
      const v = validatePost(p, content, images);
      if (!v.valid) return v;
      return worst;
    },
    validatePost(previewPlatform, content, images)
  );

  function handleToggle(p: string) {
    if (selectedPlatforms.includes(p) && selectedPlatforms.length === 1) return;
    dispatch(toggleSelectedPlatform(p));
  }

  // ─── Save handler ────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!strictestValidation.valid || saving) return;

    setSaving(true);

    const baseDate = scheduledAt
      ? scheduledAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const baseScheduledAt = scheduledAt || new Date().toISOString();

    try {
      const useBackend = await backendApi.isReachable();

      if (editing && editingId) {
        await dispatch(updateDraft({
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
        showToast("Draft updated successfully!", "success");
      } else {
        for (const platform of selectedPlatforms) {
          await dispatch(createDraft({
            platform,
            content,
            images,
            image: images[0],
            date: baseDate,
            scheduledAt: baseScheduledAt,
            _useBackend: useBackend,
          }));
        }
        const msg =
          selectedPlatforms.length > 1
            ? `Saved ${selectedPlatforms.length} drafts successfully!`
            : "Draft saved successfully!";
        showToast(msg, "success");
      }

      dispatch(clearEditor());
      navigate("/drafts");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }, [strictestValidation.valid, saving, scheduledAt, editing, editingId, selectedPlatforms, content, images, dispatch, navigate, showToast]);

  // ─── Feature 6: Keyboard shortcuts ───────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Enter (or Cmd+Enter on Mac) → Save draft
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // ─── Feature 3: Quick actions ─────────────────────────────────────────────────
  function handleCopy() {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      setCopyLabel("Copied!");
      showToast("Content copied to clipboard", "info");
      setTimeout(() => setCopyLabel("Copy"), 2000);
    });
  }

  function handleClearRequest() {
    if (!content) return;
    setClearConfirm(true);
    setTimeout(() => setClearConfirm(false), 3000);
  }

  function handleClearConfirmed() {
    dispatch(setEditorContent(""));
    setClearConfirm(false);
    showToast("Content cleared", "info");
  }

  function appendHashtag(tag: string) {
    const trimmed = content.trimEnd();
    const next = trimmed ? `${trimmed} ${tag}` : tag;
    dispatch(setEditorContent(next));
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

          {/* ─── Feature 3: Quick action toolbar ─── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
            flexWrap: "wrap",
          }}>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              disabled={!content}
              style={quickBtnStyle(!content)}
              title="Copy content to clipboard"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {copyLabel}
            </button>

            {/* Clear / Confirm clear */}
            {!clearConfirm ? (
              <button
                onClick={handleClearRequest}
                disabled={!content}
                style={quickBtnStyle(!content)}
                title="Clear all content"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Clear
              </button>
            ) : (
              <button
                onClick={handleClearConfirmed}
                style={{ ...quickBtnStyle(false), borderColor: "#ef4444", color: "#ef4444" }}
              >
                Confirm clear?
              </button>
            )}

            {/* Divider */}
            <div style={{ width: "1px", height: "18px", background: "var(--border-dark)", margin: "0 2px" }} />

            {/* Hashtag pills */}
            {QUICK_HASHTAGS.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => appendHashtag(tag)}
                style={{
                  padding: "3px 9px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-dark)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1";
                  (e.currentTarget as HTMLButtonElement).style.color = "#6366f1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-dark)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                }}
                title={`Append ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <textarea
              placeholder="What's happening today? Type your post content... (Ctrl+Enter to save)"
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
          <ValidationMessage validation={strictestValidation} />

          <Button
            text={
              saving
                ? "Saving..."
                : editing
                  ? "Update Draft"
                  : selectedPlatforms.length > 1
                    ? `Save ${selectedPlatforms.length} Drafts`
                    : "Save Draft"
            }
            onClick={handleSave}
            disabled={saving || !strictestValidation.valid}
          />

          {/* Keyboard shortcut hint */}
          <div style={{
            textAlign: "center",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            marginTop: "8px",
            opacity: 0.6,
          }}>
            Press <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: "1px solid var(--border-dark)", fontSize: "0.7rem" }}>Ctrl</kbd>
            {" + "}
            <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: "1px solid var(--border-dark)", fontSize: "0.7rem" }}>Enter</kbd>
            {" to save"}
          </div>
        </div>

        <div className="composer-preview-card">
          <div className="preview-card-header">
            <span style={{
              fontSize: "0.8rem", textTransform: "uppercase",
              letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-secondary)",
            }}>
              Live Preview
            </span>

            {/* ─── Feature 2: Platform tabs with progress rings ─── */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
              {selectedPlatforms.map((p) => {
                const limit = getCharacterLimit(p);
                const isActive = previewPlatform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPreviewPlatform(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 8px 3px 5px",
                      borderRadius: "20px",
                      border: `1.5px solid ${isActive ? PLATFORM_COLORS[p] : "var(--border-dark)"}`,
                      background: isActive ? `${PLATFORM_COLORS[p]}18` : "transparent",
                      color: isActive ? PLATFORM_COLORS[p] : "var(--text-secondary)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      transition: "all 0.15s ease",
                      letterSpacing: "0.02em",
                    }}
                    title={`${content.length} / ${limit} chars`}
                  >
                    <ProgressRing platform={p} count={content.length} />
                    {p}
                  </button>
                );
              })}
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

// ─── Shared quick-action button style ────────────────────────────────────────
function quickBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "3px 10px",
    borderRadius: "6px",
    border: "1px solid var(--border-dark)",
    background: "transparent",
    color: disabled ? "var(--text-secondary)" : "var(--text-primary)",
    fontSize: "0.75rem",
    fontWeight: 500,
    opacity: disabled ? 0.4 : 1,
    transition: "all 0.15s ease",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

export default Composer;