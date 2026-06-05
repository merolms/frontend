import React, { useCallback, useRef, useState } from "react";
import { t } from "@/styles/theme";

/**
 * MediaUpload — reusable file upload component with drag-and-drop and progress.
 *
 * Props:
 *   entityType  - "block" | "attachment" | "avatar" | "course" | "team"
 *   entityId    - ID of the entity
 *   accept      - MIME type filter (e.g. "image/*", ".pdf,.zip")
 *   maxSizeMB   - Maximum file size in MB
 *   onUploadComplete - callback({ url, uuid, mimeType, fileSize })
 *   onError     - callback(errorMessage)
 */
const MediaUpload = ({
  entityType = "attachment",
  entityId,
  accept,
  maxSizeMB = 50,
  onUploadComplete,
  onError,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      setError(null);

      // Size check
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        const msg = `File too large (max ${maxSizeMB} MB)`;
        setError(msg);
        onError?.(msg);
        return;
      }

      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_type", entityType);
      if (entityId) formData.append("entity_id", String(entityId));

      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";
      const token = localStorage.getItem("auth_token");
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Use XMLHttpRequest for upload progress
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/media/upload`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const body = JSON.parse(xhr.responseText);
            const data = body.data;
            setProgress(100);
            onUploadComplete?.({
              url: data.url,
              uuid: data.uuid,
              mimeType: data.mimeType,
              fileSize: data.fileSizeBytes,
            });
          } catch {
            setError("Invalid server response");
            onError?.("Invalid server response");
          }
        } else {
          const msg = `Upload failed (${xhr.status})`;
          setError(msg);
          onError?.(msg);
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        const msg = "Upload failed — network error";
        setError(msg);
        onError?.(msg);
      };

      xhr.send(formData);
    },
    [entityType, entityId, maxSizeMB, onUploadComplete, onError]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
      e.target.value = ""; // reset so same file can be re-selected
    },
    [handleFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? t("accent") : t("border-primary")}`,
          borderRadius: 8,
          padding: "24px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? t("surface-hover") : t("bg-surface"),
          transition: "border-color 0.2s, background 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
        />

        {uploading ? (
          <div>
            <div
              style={{
                width: "100%",
                height: 4,
                background: t("border-primary"),
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: t("accent"),
                  borderRadius: 2,
                  transition: "width 0.2s",
                }}
              />
            </div>
            <span style={{ fontSize: 13, color: t("text-muted") }}>
              Uploading… {progress}%
            </span>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📎</div>
            <div style={{ fontSize: 14, color: t("text-primary"), fontWeight: 500 }}>
              Drop file here or click to browse
            </div>
            <div style={{ fontSize: 12, color: t("text-muted"), marginTop: 4 }}>
              {accept ? `Accepted: ${accept}` : "Any file type"} • Max {maxSizeMB} MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#EF4444" }}>{error}</div>
      )}
    </div>
  );
};

export default MediaUpload;
