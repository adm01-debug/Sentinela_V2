import React from "react";
export const FormError: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`FormError ${className || ""}`}>{children}</div>
);
