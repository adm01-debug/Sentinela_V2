import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationBadgeProps {
  type: "achievement" | "streak" | "level" | "points";
  value: string | number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const icons = {
  achievement: Trophy,
  streak: Flame,
  level: Star,
  points: Award
};

const colors = {
  achievement: "bg-yellow-500",
  streak: "bg-orange-500",
  level: "bg-purple-500",
  points: "bg-blue-500"
};

export function GamificationBadge({ type, value, label, size = "md" }: GamificationBadgeProps) {
  const Icon = icons[type];
  const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  
  return (
    <Badge className={cn("flex items-center gap-1", colors[type])}>
      <Icon className={sizes[size]} />
      <span>{value}</span>
      {label && <span className="text-xs opacity-75">{label}</span>}
    </Badge>
  );
}
