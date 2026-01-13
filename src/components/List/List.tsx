import React from "react";
import { cn } from "@/lib/utils";

interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export function List({ children, className, ...props }: ListProps) {
  return (
    <ul className={cn("space-y-2", className)} {...props}>
      {children}
    </ul>
  );
}

export function ListItem({ children, className, ...props }: ListItemProps) {
  return (
    <li className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </li>
  );
}
