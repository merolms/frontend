/**
 * LoadingState — reusable loading skeleton.
 *
 * Props:
 *   count    - number of skeleton items (default: 3)
 *   height   - height of each skeleton (default: "h-24")
 *   compact  - boolean for smaller skeletons
 */
const LoadingState = ({ count = 3, height = "h-24", compact = false }) => {
  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`bg-bg-surface border-border animate-pulse rounded-xl border ${height}`}
        />
      ))}
    </div>
  );
};

export default LoadingState;
