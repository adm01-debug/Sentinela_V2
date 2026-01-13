import React from "react";
export const LoadingOverlay: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`LoadingOverlay ${className || ""}`}>LoadingOverlay Component</div>
);
export default LoadingOverlay;
