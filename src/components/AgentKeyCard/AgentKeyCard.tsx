import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Key, Copy, Trash2 } from "lucide-react";

interface AgentKeyCardProps {
  name: string;
  apiKey: string;
  createdAt: string;
  lastUsed?: string;
  status: "active" | "inactive" | "revoked";
  onCopy?: () => void;
  onRevoke?: () => void;
}

export function AgentKeyCard({ name, apiKey, createdAt, lastUsed, status, onCopy, onRevoke }: AgentKeyCardProps) {
  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-yellow-500",
    revoked: "bg-red-500"
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>{name}</CardTitle>
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>
        <CardDescription>Created: {createdAt}</CardDescription>
      </CardHeader>
      <CardContent>
        <code className="block p-2 bg-muted rounded text-xs font-mono truncate">
          {apiKey}
        </code>
        {lastUsed && <p className="text-xs text-muted-foreground mt-2">Last used: {lastUsed}</p>}
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
        <Button variant="destructive" size="sm" onClick={onRevoke}>
          <Trash2 className="h-4 w-4 mr-1" /> Revoke
        </Button>
      </CardFooter>
    </Card>
  );
}
