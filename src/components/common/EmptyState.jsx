/**
 * EmptyState — reusable empty state with icon, message, and optional action.
 *
 * Props:
 *   icon        - React node (default: 📭)
 *   title       - Main message (required)
 *   description - Secondary message
 *   action      - React node (button/link)
 *   compact     - boolean for smaller padding
 */
const EmptyState = ({ icon = "📭", title, description, action, compact = false }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: compact ? "24px 16px" : "48px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: compact ? 32 : 48, marginBottom: compact ? 8 : 16, opacity: 0.5 }}>
        {icon}
      </div>
      <p
        style={{
          fontSize: compact ? 13 : 14,
          fontWeight: 500,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {title}
      </p>
      {description && (
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
