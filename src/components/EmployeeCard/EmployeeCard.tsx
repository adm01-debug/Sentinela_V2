import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface EmployeeCardProps {
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  status: "active" | "inactive" | "on-leave";
  onClick?: () => void;
}

export function EmployeeCard({ name, email, role, department, avatar, status, onClick }: EmployeeCardProps) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    "on-leave": "bg-yellow-500"
  };

  return (
    <Card 
      className={`cursor-pointer hover:bg-accent/50 transition-colors ${onClick ? '' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <Badge className={statusColors[status]}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <span>{role}</span>
          <span className="text-muted-foreground">{department}</span>
        </div>
      </CardContent>
    </Card>
  );
}
