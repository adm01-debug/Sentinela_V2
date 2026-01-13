import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name: string;
  email?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showInfo?: boolean;
  status?: "online" | "offline" | "away" | "busy";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl"
};

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500"
};

export function UserAvatar({ 
  src, 
  name, 
  email, 
  size = "md", 
  showInfo = false, 
  status,
  className 
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={src} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {status && (
          <span className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            statusColors[status]
          )} />
        )}
      </div>
      {showInfo && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          {email && <span className="text-xs text-muted-foreground">{email}</span>}
        </div>
      )}
    </div>
  );
}
