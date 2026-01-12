import { useState } from 'react';
import { cn } from '@/utils/cn';

interface TextTruncateProps {
  text: string;
  maxLength?: number;
  expandable?: boolean;
  className?: string;
}

export function TextTruncate({ text, maxLength = 100, expandable = true, className }: TextTruncateProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText = expanded || !shouldTruncate ? text : `${text.slice(0, maxLength)}...`;

  return (
    <span className={className}>
      {displayText}
      {shouldTruncate && expandable && (
        <button onClick={() => setExpanded(!expanded)} className="ml-1 text-primary text-sm hover:underline">
          {expanded ? 'ver menos' : 'ver mais'}
        </button>
      )}
    </span>
  );
}
