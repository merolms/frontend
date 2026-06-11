import React from "react";

const Stepper = ({ steps, current, className }) => (
  <div className={`flex items-center gap-2 ${className || ""}`}>
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <div className="flex items-center gap-1.5">
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
              i + 1 <= current ? "bg-primary text-secondary" : "bg-bg-surface-active text-text-muted"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-xs ${i + 1 <= current ? "text-text-primary font-medium" : "text-text-muted"}`}
          >
            {step.title}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`h-px w-8 ${i + 1 < current ? "bg-primary" : "bg-border"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export { Stepper };
