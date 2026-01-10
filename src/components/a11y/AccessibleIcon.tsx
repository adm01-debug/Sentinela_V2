import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AccessibleIconProps {
  icon: LucideIcon;
  label: string;
  size?: number;
  className?: string;
}

export const AccessibleIcon: React.FC<AccessibleIconProps> = ({
  icon: Icon,
  label,
  size = 24,
  className,
}) => (
  <span role="img" aria-label={label} className={className}>
    <Icon size={size} aria-hidden="true" />
  </span>
);

export default AccessibleIcon;
