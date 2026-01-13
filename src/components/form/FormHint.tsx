import React from "react";
export const FormHint: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`FormHint ${className || ""}`}>{children}</div>
);
