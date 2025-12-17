import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReportData } from '@/data/reportData';

export const generatePDF = (reportData: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SecureWatch', 14, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Segurança e Produtividade', 14, 30);
  
  // Period and Department info
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  const periodText = `Período: ${format(reportData.period.start, "dd/MM/yyyy", { locale: ptBR })} - ${format(reportData.period.end, "dd/MM/yyyy", { locale: ptBR })}`;
  const deptText = `Departamento: ${reportData.department}`;
  doc.text(periodText, pageWidth - 14, 20, { align: 'right' });
  doc.text(deptText, pageWidth - 14, 28, { align: 'right' });
  
  let yPos = 50;
  
  // Summary Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', 14, yPos);
  
  yPos += 10;
  
  const summaryData = [
    ['Total de Colaboradores', reportData.summary.totalEmployees.toString()],
    ['Produtividade Média', `${reportData.summary.avgProductivity}%`],
    ['Total de Alertas', reportData.summary.totalAlerts.toString()],
    ['Tentativas Bloqueadas', reportData.summary.blockedAttempts.toString()],
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [['Métrica', 'Valor']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Alerts by Type
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Alertas por Tipo', 14, yPos);
  
  yPos += 10;
  
  const alertsData = reportData.alertsByType.map(a => [a.type, a.count.toString()]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Tipo de Alerta', 'Quantidade']],
    body: alertsData,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Productivity by Department
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Produtividade por Departamento', 14, yPos);
  
  yPos += 10;
  
  const productivityData = reportData.productivityByDepartment.map(p => [
    p.department,
    `${p.score}%`,
    p.employees.toString(),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Departamento', 'Produtividade', 'Colaboradores']],
    body: productivityData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });
  
  // New page for employees with most alerts
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Colaboradores com Mais Alertas', 14, yPos);
  
  yPos += 10;
  
  const employeesData = reportData.topAlertEmployees.map(e => [
    e.name,
    e.department,
    e.alerts.toString(),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Colaborador', 'Departamento', 'Alertas']],
    body: employeesData,
    theme: 'striped',
    headStyles: { fillColor: [251, 146, 60], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const fileName = `relatorio-securewatch-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
};
