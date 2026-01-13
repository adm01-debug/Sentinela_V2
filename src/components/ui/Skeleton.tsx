import React from "react";
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`Skeleton ${className || ""}`}>Skeleton Component</div>
);
export default Skeleton;
