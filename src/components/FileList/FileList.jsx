import React from "react";
import { t } from "@/styles/theme";

const FILE_ICONS = {
  image: "🖼️",
  video: "🎬",
  audio: "🎵",
  document: "📄",
  other: "📎",
};

const FILE_COLORS = {
  image: "#10B981",
  video: "#EF4444",
  audio: "#8B5CF6",
  document: "#3B82F6",
  other: "#6B7280",
};

const formatSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * FileList — displays a list of attachments/media files for a course.
 *
 * Props:
 *   files     - Array of { id, title, name, size, type, url, mimeType, ... }
 *   onDelete  - callback(fileId) — optional delete handler
 *   compact   - boolean — compact mode for sidebar
 */
const FileList = ({ files, onDelete, compact = false }) => {
  if (!files || files.length === 0) {
    return (
      <div
        style={{
          padding: compact ? "12px" : "24px",
          textAlign: "center",
          color: t("text-muted"),
          fontSize: 13,
        }}
      >
        No files attached
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 8 }}>
      {files.map((file) => {
        const type = file.contentType || file.type || "other";
        const icon = FILE_ICONS[type] || FILE_ICONS.other;
        const color = FILE_COLORS[type] || FILE_COLORS.other;
        const displayName = file.title || file.name || file.originalFilename || "Untitled";
        const fileUrl = file.url || (file.uuid ? `/media/${file.uuid}` : null);

        return (
          <div
            key={file.id || file.uuid}
            style={{
              display: "flex",
              alignItems: "center",
              gap: compact ? 8 : 12,
              padding: compact ? "8px 10px" : "10px 14px",
              border: `1px solid ${t("border-primary")}`,
              borderRadius: 8,
              background: t("bg-surface"),
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: compact ? 28 : 36,
                height: compact ? 28 : 36,
                borderRadius: 6,
                background: `${color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: compact ? 14 : 18,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>

            {/* Info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: compact ? 12 : 13,
                  fontWeight: 500,
                  color: t("text-primary"),
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {displayName}
                  </a>
                ) : (
                  displayName
                )}
              </div>
              {!compact && (
                <div style={{ fontSize: 11, color: t("text-muted"), marginTop: 2 }}>
                  {formatSize(file.size || file.fileSizeBytes)} • {file.mimeType || type}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Download"
                  style={{
                    padding: "4px 8px",
                    fontSize: 11,
                    color: t("accent"),
                    textDecoration: "none",
                    border: `1px solid ${t("border-primary")}`,
                    borderRadius: 4,
                  }}
                >
                  ↓
                </a>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(file.id || file.uuid)}
                  title="Delete"
                  style={{
                    padding: "4px 8px",
                    fontSize: 11,
                    color: "#EF4444",
                    background: "none",
                    border: `1px solid ${t("border-primary")}`,
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileList;
