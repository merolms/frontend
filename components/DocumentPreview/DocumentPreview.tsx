"use client";

import { useState } from "react";

import { t } from "@/styles/theme";

interface DocumentPreviewProps {
  url: string;
  title?: string;
}

/**
 * DocumentPreview — PDF thumbnail + modal viewer.
 * Uses browser-native PDF rendering via <iframe> (no extra deps).
 *
 * Props:
 *   url    - Direct URL to the PDF file
 *   title  - Display title
 */
const DocumentPreview = ({ url, title }: DocumentPreviewProps) => {
  const [open, setOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      {/* Thumbnail card */}
      <div
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          border: `1px solid ${t("border-primary")}`,
          borderRadius: 8,
          cursor: "pointer",
          background: t("bg-surface"),
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = t("accent"))}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = t("border-primary"))}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          📄
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: t("text-primary"),
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title || "Document"}
          </div>
          <div style={{ fontSize: 11, color: t("text-muted") }}>Click to preview</div>
        </div>
        <div style={{ color: t("text-muted"), fontSize: 18 }}>↗</div>
      </div>

      {/* Full-screen modal */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={() => setOpen(false)}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: t("bg-surface"),
              borderBottom: `1px solid ${t("border-primary")}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: t("text-primary") }}>
              {title || "Document Preview"}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: t("accent"),
                  textDecoration: "none",
                  padding: "4px 10px",
                  border: `1px solid ${t("accent")}`,
                  borderRadius: 4,
                }}
              >
                Open in new tab
              </a>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                  color: t("text-muted"),
                  padding: "2px 8px",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* PDF iframe */}
          <div style={{ flex: 1, background: "#333" }} onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`${url}#toolbar=1&navpanes=0`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={title || "Document preview"}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentPreview;
