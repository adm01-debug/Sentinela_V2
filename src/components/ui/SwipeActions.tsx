import * as React from "react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  color?: string;
  bgColor?: string;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
  actionWidth?: number;
  threshold?: number;
  disabled?: boolean;
}

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  className,
  actionWidth = 80,
  threshold = 40,
  disabled = false,
}: SwipeActionsProps) {
  const [offset, setOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const startX = React.useRef(0);
  const currentOffset = React.useRef(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const maxLeftOffset = leftActions.length * actionWidth;
  const maxRightOffset = rightActions.length * actionWidth;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentOffset.current = offset;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    const diff = e.touches[0].clientX - startX.current;
    let newOffset = currentOffset.current + diff;
    newOffset = Math.max(-maxRightOffset, Math.min(maxLeftOffset, newOffset));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset > threshold && leftActions.length > 0) {
      setOffset(maxLeftOffset);
    } else if (offset < -threshold && rightActions.length > 0) {
      setOffset(-maxRightOffset);
    } else {
      setOffset(0);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setOffset(0);
  };

  const renderActions = (actions: SwipeAction[], side: "left" | "right") => (
    <div className={cn("absolute top-0 bottom-0 flex", side === "left" ? "left-0" : "right-0", side === "left" ? "-translate-x-full" : "translate-x-full")}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => handleActionClick(action)}
          className={cn("flex flex-col items-center justify-center text-white transition-colors", action.bgColor || (side === "left" ? "bg-green-500" : "bg-red-500"))}
          style={{ width: actionWidth, color: action.color }}
        >
          {action.icon}
          {action.label && <span className="text-xs mt-1">{action.label}</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {leftActions.length > 0 && renderActions(leftActions, "left")}
      {rightActions.length > 0 && renderActions(rightActions, "right")}
      <div
        className={cn("relative bg-background", isDragging ? "" : "transition-transform duration-200")}
        style={{ transform: \`translateX(\${offset}px)\` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

export default SwipeActions;
