import React from "react";
export const FormField: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`FormField ${className || ""}`}>{children}</div>
);
