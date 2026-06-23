/**
 * ProgressBar — styled horizontal progress bar.
 *
 * Props:
 *   progress  - number 0-100
 *   color     - CSS color string
 *   size      - "sm" | "md" | "lg"
 *   showLabel - boolean to show percentage text
 */
const ProgressBar = ({ progress, color = "#6366F1", size = "md", showLabel = false }) => {
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  const h = heights[size] || heights.md;
  const clamped = Math.max(0, Math.min(100, progress || 0));

  return (
    <div className="flex items-center gap-2">
      <div className={`w-full ${h} bg-bg-surface-active overflow-hidden rounded-full`}>
        <div
          className={`${h} rounded-full transition-all duration-500`}
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span
          className="text-text-muted flex-shrink-0 text-xs font-medium"
          style={{ minWidth: 32 }}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
