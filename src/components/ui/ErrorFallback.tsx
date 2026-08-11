import React from "react";
export const ErrorFallback: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`ErrorFallback ${className || ""}`}>ErrorFallback Component</div>
);
export default ErrorFallback;
