import { memo, ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
type TooltipAlign = 'start' | 'center' | 'end';

interface SimpleTooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  delayDuration?: number;
  className?: string;
  disabled?: boolean;
}

// ============================================================
// SimpleTooltip - Easy to use tooltip wrapper
// ============================================================

function SimpleTooltipComponent({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
  disabled = false,
}: SimpleTooltipProps) {
  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} className={className}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const SimpleTooltip = memo(SimpleTooltipComponent);

// ============================================================
// InfoTooltip - Icon with tooltip
// ============================================================

import { Info, HelpCircle, AlertCircle } from 'lucide-react';

type InfoTooltipVariant = 'info' | 'help' | 'warning';

interface InfoTooltipProps {
  content: ReactNode;
  variant?: InfoTooltipVariant;
  side?: TooltipSide;
  className?: string;
  iconClassName?: string;
}

const variantIcons = {
  info: Info,
  help: HelpCircle,
  warning: AlertCircle,
};

const variantColors = {
  info: 'text-blue-500',
  help: 'text-muted-foreground',
  warning: 'text-orange-500',
};

function InfoTooltipComponent({
  content,
  variant = 'info',
  side = 'top',
  className,
  iconClassName,
}: InfoTooltipProps) {
  const Icon = variantIcons[variant];

  return (
    <SimpleTooltip content={content} side={side} className={className}>
      <span className="inline-flex cursor-help">
        <Icon className={cn('h-4 w-4', variantColors[variant], iconClassName)} />
      </span>
    </SimpleTooltip>
  );
}

export const InfoTooltip = memo(InfoTooltipComponent);

// ============================================================
// TruncatedText - Text with tooltip on overflow
// ============================================================

import { useRef, useState, useEffect } from 'react';

interface TruncatedTextProps {
  text: string;
  className?: string;
  maxWidth?: string | number;
  side?: TooltipSide;
}

function TruncatedTextComponent({
  text,
  className,
  maxWidth = '100%',
  side = 'top',
}: TruncatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [text]);

  const style = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  };

  return (
    <SimpleTooltip content={text} disabled={!isTruncated} side={side}>
      <span
        ref={textRef}
        className={cn('block truncate', className)}
        style={style}
      >
        {text}
      </span>
    </SimpleTooltip>
  );
}

export const TruncatedText = memo(TruncatedTextComponent);

// ============================================================
// CopyableText - Text that can be copied with tooltip feedback
// ============================================================

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';

interface CopyableTextProps {
  text: string;
  displayText?: string;
  className?: string;
  showIcon?: boolean;
}

function CopyableTextComponent({
  text,
  displayText,
  className,
  showIcon = true,
}: CopyableTextProps) {
  const { copy, copied } = useClipboard({ showToast: false });

  const handleCopy = useCallback(() => {
    copy(text);
  }, [copy, text]);

  return (
    <SimpleTooltip content={copied ? 'Copiado!' : 'Clique para copiar'}>
      <button
        onClick={handleCopy}
        className={cn(
          'inline-flex items-center gap-1 hover:text-primary transition-colors',
          className
        )}
      >
        <span>{displayText || text}</span>
        {showIcon && (
          copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 opacity-50" />
          )
        )}
      </button>
    </SimpleTooltip>
  );
}

export const CopyableText = memo(CopyableTextComponent);
