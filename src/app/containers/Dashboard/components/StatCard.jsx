import React from 'react';

const StatCard = ({ title, value, icon, color, trend, trendUp }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-xs text-text-muted">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-xl font-bold text-text-primary">{value}</span>
        </div>
        <p className={`text-[11px] ${trendUp ? 'text-success' : 'text-error'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      </div>
    </div>
  </div>
);

export default StatCard;
