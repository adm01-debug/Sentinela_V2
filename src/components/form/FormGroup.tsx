import React from "react";
export const FormGroup: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`FormGroup ${className || ""}`}>{children}</div>
);
