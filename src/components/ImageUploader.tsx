import { useState, type ChangeEvent, type DragEvent } from "react";

interface ImageUploaderProps {
  image?: string;
  setImage: (image: string | undefined) => void;
}

function ImageUploader({
  image,
  setImage,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  function processFile(file: File) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) processFile(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function removeImage(): void {
    setImage(undefined);
  }

  return (
    <div className="image-upload-container">
      <div className="upload-controls">
        <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
          Image Attachment
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--text-primary)" : "var(--border-dark)"}`,
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            background: isDragging ? "rgba(150, 150, 150, 0.15)" : "rgba(150, 150, 150, 0.05)",
            cursor: "pointer",
            transition: "var(--transition-smooth)",
            position: "relative",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />

          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {isDragging ? "Drop image here..." : "Click or Drag & Drop Image"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Supports JPG, PNG, WebP (Max 5MB)
          </div>
        </div>

        {image && (
          <button
            type="button"
            className="remove-image-btn"
            onClick={removeImage}
            style={{ marginTop: "4px" }}
          >
            Remove Image Attachment
          </button>
        )}
      </div>

      <div className="preview-section">
        {image ? (
          <div className="image-preview-wrapper">
            <img
              src={image}
              alt="Preview"
              className="image-preview"
            />
          </div>
        ) : (
          <div className="preview-placeholder">
            No Media
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;