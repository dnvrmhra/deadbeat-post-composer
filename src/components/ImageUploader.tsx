import { useRef, useState, type DragEvent } from "react";

interface ImageUploaderProps {
  images: string[];
  onAdd: (image: string) => void;
  onRemove: (index: number) => void;
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

function ImageUploader({ images, onAdd, onRemove }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function processFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach((file) => {
      compressAndReadImage(file, (base64) => onAdd(base64));
    });
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "var(--text-primary)" : "var(--border-dark)"}`,
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              background: isDragging ? "rgba(150,150,150,0.15)" : "rgba(150,150,150,0.05)",
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
              {isDragging ? "Drop images here..." : "Click or Drag & Drop Images"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Supports JPG, PNG, WebP · Up to {MAX_IMAGES} images
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: "8px",
          marginTop: "12px",
          width: "100%",
        }}>
          {images.map((src, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1/1",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--border-dark)",
              }}
            >
              <img
                src={src}
                alt={`attachment ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
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
                  lineHeight: "20px",
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
              }}>
                {i + 1}
              </div>
            </div>
          ))}
        </div>
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