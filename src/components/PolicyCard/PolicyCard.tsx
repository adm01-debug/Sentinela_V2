import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Shield, Clock, Users } from "lucide-react";

interface PolicyCardProps {
  name: string;
  description: string;
  type: "monitoring" | "security" | "compliance";
  status: "active" | "draft" | "disabled";
  affectedUsers: number;
  lastUpdated: string;
  onEdit?: () => void;
  onToggle?: () => void;
}

export function PolicyCard({ name, description, type, status, affectedUsers, lastUpdated, onEdit, onToggle }: PolicyCardProps) {
  const statusColors = { active: "bg-green-500", draft: "bg-yellow-500", disabled: "bg-gray-500" };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>{name}</CardTitle>
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>{affectedUsers} users affected</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Updated: {lastUpdated}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="outline" size="sm" onClick={onToggle}>
          {status === "active" ? "Disable" : "Enable"}
        </Button>
      </CardFooter>
    </Card>
  );
}
