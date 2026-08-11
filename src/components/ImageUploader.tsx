import { useRef, useState, type DragEvent } from "react";

interface ImageUploaderProps {
  images: string[];
  onAdd: (image: string) => void;
  onRemove: (index: number) => void;
  onReorder: (from: number, to: number) => void;
}

const MAX_IMAGES = 10;

function compressAndReadImage(file: File, callback: (base64: string) => void) {
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const maxDim = 800;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        callback(compressed);
      } else {
        callback(src);
      }
    };
    img.onerror = () => callback(src);
    img.src = src;
  };
  reader.readAsDataURL(file);
}

function ImageUploader({ images, onAdd, onRemove, onReorder }: ImageUploaderProps) {
  const [isDropping, setIsDropping] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function processFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      compressAndReadImage(file, (base64) => onAdd(base64));
    });
  }

  function handleDropzoneDragOver(e: DragEvent<HTMLDivElement>) {
    if (dragFromIndex !== null) return;
    e.preventDefault();
    setIsDropping(true);
  }

  function handleDropzoneDragLeave() {
    if (dragFromIndex !== null) return;
    setIsDropping(false);
  }

  function handleDropzoneDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDropping(false);
    if (dragFromIndex !== null) return;
    processFiles(e.dataTransfer.files);
  }

  function handleThumbDragStart(e: DragEvent<HTMLDivElement>, index: number) {
    setDragFromIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleThumbDragOver(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragFromIndex === null || dragFromIndex === index) return;
    setDragOverIndex(index);
  }

  function handleThumbDragLeave() {
    setDragOverIndex(null);
  }

  function handleThumbDrop(e: DragEvent<HTMLDivElement>, toIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    if (dragFromIndex !== null && dragFromIndex !== toIndex) {
      onReorder(dragFromIndex, toIndex);
    }
    setDragFromIndex(null);
    setDragOverIndex(null);
  }

  function handleThumbDragEnd() {
    setDragFromIndex(null);
    setDragOverIndex(null);
  }

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="image-upload-container">
      <div className="upload-controls">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
            Image Attachments
          </label>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            {images.length} / {MAX_IMAGES}
          </span>
        </div>

        {canAddMore && (
          <div
            onDragOver={handleDropzoneDragOver}
            onDragLeave={handleDropzoneDragLeave}
            onDrop={handleDropzoneDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDropping ? "var(--text-primary)" : "var(--border-dark)"}`,
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              background: isDropping ? "rgba(150,150,150,0.15)" : "rgba(150,150,150,0.05)",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => processFiles(e.target.files)}
              style={{ display: "none" }}
            />
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
              {isDropping ? "Drop images here..." : "Click or Drag & Drop Images"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Supports JPG, PNG, WebP · Up to {MAX_IMAGES} images
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "14px",
            marginBottom: "6px",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span style={{ fontSize: "0.73rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Drag thumbnails to reorder
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "8px",
            width: "100%",
          }}>
            {images.map((src, i) => {
              const isDraggingThis = dragFromIndex === i;
              const isDropTarget = dragOverIndex === i && dragFromIndex !== i;

              return (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => handleThumbDragStart(e, i)}
                  onDragOver={(e) => handleThumbDragOver(e, i)}
                  onDragLeave={handleThumbDragLeave}
                  onDrop={(e) => handleThumbDrop(e, i)}
                  onDragEnd={handleThumbDragEnd}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: isDropTarget
                      ? "2px solid var(--text-primary)"
                      : "1px solid var(--border-dark)",
                    opacity: isDraggingThis ? 0.4 : 1,
                    cursor: "grab",
                    transform: isDropTarget ? "scale(1.04)" : "scale(1)",
                    transition: "transform 0.15s ease, opacity 0.15s ease, border 0.15s ease",
                    boxShadow: isDropTarget
                      ? "0 0 0 3px rgba(150,150,150,0.25)"
                      : "none",
                  }}
                >
                  <img
                    src={src}
                    alt={`attachment ${i + 1}`}
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
                  />

                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 40%)",
                    pointerEvents: "none",
                  }} />

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(0,0,0,0.75)",
                      color: "#fff",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      fontWeight: 700,
                      zIndex: 2,
                    }}
                    title="Remove image"
                  >
                    ✕
                  </button>

                  <div style={{
                    position: "absolute",
                    bottom: "3px",
                    left: "5px",
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 700,
                    textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                    pointerEvents: "none",
                  }}>
                    {i + 1}
                  </div>

                  <div style={{
                    position: "absolute",
                    bottom: "3px",
                    right: "5px",
                    pointerEvents: "none",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(255,255,255,0.65)">
                      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {images.length === 0 && (
        <div className="preview-placeholder" style={{ marginTop: "8px", width: "100%" }}>
          No Media Attached
        </div>
      )}
    </div>
  );
}

export default ImageUploader;