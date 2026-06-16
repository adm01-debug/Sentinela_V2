import { memo } from "react";
import { Download } from "lucide-react";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import { Report } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  reports: Report[];
  isLoading?: boolean;
}

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "default",
  generating: "secondary",
  completed: "default",
  failed: "destructive",
};

const ReportListBase = ({ reports, isLoading }: Props) => {
  if (isLoading)
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );

  const handleDownload = (_id: string) => {
    toast.info("Download de relatórios será implementado em breve");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => {
          const reportData = report as unknown as { created_at?: string; createdAt?: string };
          const date = new Date(reportData.created_at || reportData.createdAt || "");
          return (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.name}</TableCell>
              <TableCell>{report.type}</TableCell>
              <TableCell>
                <Badge variant={statusVariants[report.status] || "default"}>{report.status}</Badge>
              </TableCell>
              <TableCell>{isValid(date) ? format(date, "dd/MM/yyyy") : "-"}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleDownload(report.id)}>
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export const ReportList = memo(ReportListBase);
