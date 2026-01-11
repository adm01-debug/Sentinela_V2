import { useState } from 'react';
import { useReports, useGenerateReport, useReportTemplates } from '@/hooks';
import { ReportList } from '@/components/ReportList';
import { GenerateReportDialog } from '@/components/GenerateReportDialog';
import { Button } from '@/components/ui/Button';

export const ReportsPage = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const { data: reports, isLoading } = useReports();
  const { data: templates } = useReportTemplates();
  const generateReport = useGenerateReport();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button onClick={() => setShowGenerateDialog(true)}>Generate Report</Button>
      </div>
      <ReportList reports={reports?.data || []} isLoading={isLoading} />
      <GenerateReportDialog
        open={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        templates={templates || []}
        onGenerate={(data) => { generateReport.mutate(data); setShowGenerateDialog(false); }}
      />
    </div>
  );
};