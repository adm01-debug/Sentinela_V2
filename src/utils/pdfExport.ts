// @ts-nocheck
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors, chartColors, drawRoundedRect, drawMetricCard, drawHorizontalBarChart, drawPieChart, drawLegend, drawAreaChart, type RGB } from './pdf/pdfHelpers';
import type { ReportData } from '@/data/reportData';

export const generatePDF = (reportData: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ==================== PAGE 1: COVER & SUMMARY ====================
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(28); doc.setFont('helvetica', 'bold');
  doc.text('SecureWatch', margin, 25);
  doc.setFontSize(12); doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Segurança e Produtividade', margin, 35);

  doc.setFontSize(9);
  const periodText = `${format(reportData.period.start, "dd/MM/yyyy", { locale: ptBR })} - ${format(reportData.period.end, "dd/MM/yyyy", { locale: ptBR })}`;
  const daysCount = differenceInDays(reportData.period.end, reportData.period.start) + 1;
  doc.text(periodText, pageWidth - margin, 22, { align: 'right' });
  doc.text(`Período: ${daysCount} dias`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Departamento: ${reportData.department}`, pageWidth - margin, 38, { align: 'right' });

  doc.setFontSize(8); doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth - margin, 45, { align: 'right' });

  let yPos = 60;
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', margin, yPos);
  yPos += 12;

  const cardWidth = (pageWidth - margin * 2 - 12) / 4;
  const cardHeight = 35;
  drawMetricCard(doc, 'Total de Colaboradores', String(reportData.summary.totalEmployees), margin, yPos, cardWidth, cardHeight, colors.primary);
  drawMetricCard(doc, 'Produtividade Média', `${reportData.summary.avgProductivity}%`, margin + cardWidth + 4, yPos, cardWidth, cardHeight, colors.success);
  drawMetricCard(doc, 'Total de Alertas', String(reportData.summary.totalAlerts), margin + (cardWidth + 4) * 2, yPos, cardWidth, cardHeight, colors.warning);
  drawMetricCard(doc, 'Tentativas Bloqueadas', String(reportData.summary.blockedAttempts), margin + (cardWidth + 4) * 3, yPos, cardWidth, cardHeight, colors.danger);
  yPos += cardHeight + 20;

  // Pie chart
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Distribuição de Alertas por Tipo', margin, yPos);
  yPos += 8;
  const pieData = reportData.alertsByType.map((item, index) => ({ label: item.type, value: item.count, color: chartColors[index % chartColors.length] }));
  drawPieChart(doc, pieData, margin + 40, yPos + 35, 30);
  drawLegend(doc, pieData, margin + 85, yPos + 10, 1);
  yPos += 80;

  // Bar chart
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Produtividade por Departamento', margin, yPos);
  yPos += 8;
  const barData = reportData.productivityByDepartment.map((item) => ({
    label: item.department.substring(0, 12), value: item.score,
    color: (item.score >= 85 ? colors.success : item.score >= 70 ? colors.warning : colors.danger) as RGB
  }));
  drawHorizontalBarChart(doc, barData, margin, yPos, pageWidth - margin * 2, 10, 6);

  // ==================== PAGE 2: DETAILED TABLES ====================
  doc.addPage();
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]); doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('SecureWatch - Relatório Detalhado', margin, 13);
  yPos = 30;

  // Alerts table
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento de Alertas por Tipo', margin, yPos); yPos += 8;
  const totalAlerts = reportData.alertsByType.reduce((sum, a) => sum + a.count, 0);
  autoTable(doc, { startY: yPos, head: [['Tipo de Alerta', 'Quantidade', 'Percentual']], body: reportData.alertsByType.map(a => [a.type, a.count.toString(), `${((a.count / totalAlerts) * 100).toFixed(1)}%`]), theme: 'striped', headStyles: { fillColor: colors.danger, textColor: 255, fontStyle: 'bold', fontSize: 9 }, bodyStyles: { fontSize: 9 }, alternateRowStyles: { fillColor: colors.light }, margin: { left: margin, right: margin }, columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 40, halign: 'center' }, 2: { cellWidth: 40, halign: 'center' } } });
  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Productivity table
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Produtividade Detalhada por Departamento', margin, yPos); yPos += 8;
  autoTable(doc, { startY: yPos, head: [['Departamento', 'Produtividade', 'Colaboradores', 'Status']], body: reportData.productivityByDepartment.map(p => [p.department, `${p.score}%`, p.employees.toString(), p.score >= 85 ? 'Excelente' : p.score >= 70 ? 'Regular' : 'Atenção']), theme: 'striped', headStyles: { fillColor: colors.success, textColor: 255, fontStyle: 'bold', fontSize: 9 }, bodyStyles: { fontSize: 9 }, alternateRowStyles: { fillColor: colors.light }, margin: { left: margin, right: margin }, columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 35, halign: 'center' }, 2: { cellWidth: 35, halign: 'center' }, 3: { cellWidth: 35, halign: 'center' } }, didParseCell: (data) => { if (data.column.index === 3 && data.section === 'body') { const status = data.cell.raw as string; if (status === 'Excelente') { data.cell.styles.textColor = colors.success; data.cell.styles.fontStyle = 'bold'; } else if (status === 'Regular') { data.cell.styles.textColor = colors.warning; data.cell.styles.fontStyle = 'bold'; } else { data.cell.styles.textColor = colors.danger; data.cell.styles.fontStyle = 'bold'; } } } });
  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Top alert employees table
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Colaboradores com Mais Alertas', margin, yPos); yPos += 8;
  autoTable(doc, { startY: yPos, head: [['Posição', 'Colaborador', 'Departamento', 'Alertas']], body: reportData.topAlertEmployees.map((e, index) => [`${index + 1}º`, e.name, e.department, e.alerts.toString()]), theme: 'striped', headStyles: { fillColor: colors.warning, textColor: 255, fontStyle: 'bold', fontSize: 9 }, bodyStyles: { fontSize: 9 }, alternateRowStyles: { fillColor: colors.light }, margin: { left: margin, right: margin }, columnStyles: { 0: { cellWidth: 20, halign: 'center' }, 1: { cellWidth: 55 }, 2: { cellWidth: 50 }, 3: { cellWidth: 30, halign: 'center' } }, didParseCell: (data) => { if (data.column.index === 0 && data.section === 'body') { const pos = data.row.index; if (pos === 0) { data.cell.styles.textColor = colors.danger; data.cell.styles.fontStyle = 'bold'; } else if (pos === 1) { data.cell.styles.textColor = colors.warning; data.cell.styles.fontStyle = 'bold'; } else if (pos === 2) { data.cell.styles.textColor = [251, 146, 60]; data.cell.styles.fontStyle = 'bold'; } } } });

  // ==================== PAGE 3: DAILY ACTIVITY ====================
  doc.addPage();
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]); doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('SecureWatch - Análise de Atividade', margin, 13);
  yPos = 35;

  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Distribuição de Atividade por Dia da Semana', margin, yPos); yPos += 10;
  const activityData = reportData.dailyActivity.map(d => ({ label: d.date, values: [{ name: 'Produtivo', value: d.productive, color: colors.success }, { name: 'Neutro', value: d.neutral, color: colors.primary }, { name: 'Improdutivo', value: d.unproductive, color: colors.danger }] }));
  drawAreaChart(doc, activityData, margin, yPos, pageWidth - margin * 2, 70);

  yPos += 80;
  // Legend
  doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]); doc.rect(margin, yPos, 8, 8, 'F');
  doc.setFontSize(8); doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]); doc.text('Tempo Produtivo', margin + 12, yPos + 6);
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]); doc.rect(margin + 60, yPos, 8, 8, 'F'); doc.text('Tempo Neutro', margin + 72, yPos + 6);
  doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]); doc.rect(margin + 120, yPos, 8, 8, 'F'); doc.text('Tempo Improdutivo', margin + 132, yPos + 6);
  yPos += 25;

  // Activity table
  doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('Detalhamento de Atividade Diária', margin, yPos); yPos += 8;
  autoTable(doc, { startY: yPos, head: [['Dia', 'Produtivo', 'Neutro', 'Improdutivo', 'Total']], body: reportData.dailyActivity.map(d => [d.date, `${d.productive}%`, `${d.neutral}%`, `${d.unproductive}%`, `${d.productive + d.neutral + d.unproductive}%`]), theme: 'striped', headStyles: { fillColor: colors.primary, textColor: 255, fontStyle: 'bold', fontSize: 9 }, bodyStyles: { fontSize: 9 }, alternateRowStyles: { fillColor: colors.light }, margin: { left: margin, right: margin }, columnStyles: { 0: { cellWidth: 30, halign: 'center' }, 1: { cellWidth: 35, halign: 'center' }, 2: { cellWidth: 35, halign: 'center' }, 3: { cellWidth: 35, halign: 'center' }, 4: { cellWidth: 35, halign: 'center' } } });
  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  // Insights box
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]); drawRoundedRect(doc, margin, yPos, pageWidth - margin * 2, 50, 4, 'F');
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]); doc.rect(margin, yPos, 4, 50, 'F');
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]); doc.text('Insights do Período', margin + 12, yPos + 12);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  const avgProductivity = reportData.dailyActivity.reduce((sum, d) => sum + d.productive, 0) / reportData.dailyActivity.length;
  const bestDay = reportData.dailyActivity.reduce((best, d) => d.productive > best.productive ? d : best);
  const worstDay = reportData.dailyActivity.reduce((worst, d) => d.productive < worst.productive ? d : worst);
  doc.text(`• Média de produtividade no período: ${avgProductivity.toFixed(1)}%`, margin + 12, yPos + 24);
  doc.text(`• Melhor dia: ${bestDay.date} com ${bestDay.productive}% de tempo produtivo`, margin + 12, yPos + 34);
  doc.text(`• Dia que requer atenção: ${worstDay.date} com ${worstDay.productive}% de tempo produtivo`, margin + 12, yPos + 44);

  // ==================== FOOTER ====================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]); doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.setFontSize(8); doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(`SecureWatch - Relatório Confidencial`, margin, pageHeight - 8);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const fileName = `relatorio-securewatch-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
};
