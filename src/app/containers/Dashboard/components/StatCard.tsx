import PropTypes from "prop-types";

const StatCard = ({ title, value, icon, trend, trendUp }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-text-muted text-xs">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-text-primary text-xl font-bold">{value}</span>
        </div>
        <p className={`text-[11px] ${trendUp ? "text-success" : "text-error"}`}>
          {trendUp ? "↑" : "↓"} {trend}
        </p>
      </div>
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node,
  trend: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trendUp: PropTypes.bool,
};

export default StatCard;
