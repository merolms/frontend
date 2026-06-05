import React from "react";

/**
 * PageHeader — reusable page header with title, subtitle, and actions.
 *
 * Props:
 *   title      - Page title (required)
 *   subtitle   - Page subtitle
 *   actions    - React node (buttons, etc.)
 *   breadcrumbs - Array of { label, path } objects
 */
const PageHeader = ({ title, subtitle, actions, breadcrumbs }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div
          className="text-text-muted flex items-center gap-1 text-xs"
          style={{ marginBottom: 8 }}
        >
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={{ margin: "0 4px" }}>/</span>}
              {bc.path ? (
                <span className="text-primary cursor-pointer hover:underline">{bc.label}</span>
              ) : (
                <span>{bc.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>
          )}
        </div>
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
