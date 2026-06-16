import * as React from "react";
import { useState } from "react";
import { Shield, CheckCircle, XCircle, Clock, User, Lock, Key, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  category: "auth" | "data" | "admin" | "system" | "security";
  severity: "info" | "warning" | "error" | "critical";
  userId?: string;
  userEmail?: string;
  ip?: string;
  details?: unknown;
  success: boolean;
}

const categoryIcons = { auth: Key, data: Lock, admin: User, system: Globe, security: Shield };
const severityColors = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  critical: "bg-red-500 text-white",
};

export function SecurityAuditLog({
  entries,
  maxHeight = 400,
  className,
}: {
  entries: AuditLogEntry[];
  maxHeight?: number;
  className?: string;
}) {
  const [filter, setFilter] = useState<AuditLogEntry["category"] | "all">("all");
  const filtered = filter === "all" ? entries : entries.filter((e) => e.category === filter);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit Log
          </CardTitle>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AuditLogEntry["category"] | "all")}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="auth">Authentication</option>
            <option value="data">Data Access</option>
            <option value="admin">Admin</option>
            <option value="security">Security</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-2">
            {filtered.map((entry) => {
              const Icon = categoryIcons[entry.category];
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "rounded-full p-2",
                      entry.success ? "bg-green-100" : "bg-red-100"
                    )}
                  >
                    {entry.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{entry.action}</span>
                      <Badge className={severityColors[entry.severity]}>{entry.severity}</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {entry.category}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {entry.timestamp.toLocaleString()}
                      </span>
                      {entry.userEmail && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.userEmail}
                        </span>
                      )}
                      {entry.ip && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {entry.ip}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">No audit log entries</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SecurityAuditLog;
