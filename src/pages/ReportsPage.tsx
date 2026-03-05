import { useState } from 'react';
import { useReports, useGenerateReport, useReportTemplates } from '@/hooks/useReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const ReportsPage = () => {
  const { data: reports, isLoading } = useReports();
  const { data: templates } = useReportTemplates();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {((reports as any)?.data || reports || []).map((report: any) => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <p className="font-medium">{report.name || report.report_type}</p>
                <p className="text-sm text-muted-foreground">{report.status}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
