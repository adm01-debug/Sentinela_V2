"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from "lucide-react";
import { formatDate } from "@/helpers/date";

interface Report {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: "ready" | "processing" | "failed";
}

interface Props {
  reports: Report[];
  onDownload?: (id: string) => void;
}

export function ReportList({ reports, onDownload }: Props) {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div>
                <h4 className="font-medium">{report.name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(report.createdAt)}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => onDownload?.(report.id)} disabled={report.status !== "ready"}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
