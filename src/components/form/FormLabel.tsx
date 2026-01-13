import React from "react";
export const FormLabel: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`FormLabel ${className || ""}`}>{children}</div>
);
