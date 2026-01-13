import React from 'react';
export interface ComponentProps { className?: string; children?: React.ReactNode; }
export const Component: React.FC<ComponentProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};
export default Component;
