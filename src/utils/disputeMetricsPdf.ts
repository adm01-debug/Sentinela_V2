/**
 * Exportador PDF do Dashboard de Métricas de Contestação (LGPD/SLA 72h).
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors, drawMetricCard, drawHorizontalBarChart, chartColors } from './pdf/pdfHelpers';
import type { DisputeMetrics } from '@/hooks/useDisputeMetrics';
import { DISPUTE_SLA_HOURS } from '@/hooks/useDisputeMetrics';
import {
  DISPUTE_CATEGORY_LABEL,
  DISPUTE_STATUS_LABEL,
  type DisputeCategory,
  type DisputeStatus,
} from '@/hooks/useViolationDisputes';

interface Params {
  from: string;
  to: string;
  metrics: DisputeMetrics;
}

export function exportDisputeMetricsPdf({ from, to, metrics }: Params): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Métricas de Contestação — LGPD', margin, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`SLA formal: ${DISPUTE_SLA_HOURS}h para julgamento`, margin, 19);
  doc.text(
    `Período: ${format(new Date(from), 'dd/MM/yyyy', { locale: ptBR })} a ${format(
      new Date(to),
      'dd/MM/yyyy',
      { locale: ptBR },
    )}`,
    margin,
    24,
  );

  let y = 36;

  // KPI cards (4 columns)
  const cardW = (pageWidth - margin * 2 - 9) / 4;
  const cardH = 22;
  const backlogFora =
    (metrics.backlogAgeBuckets.find((b) => b.label === '72h-7d')?.count ?? 0) +
    (metrics.backlogAgeBuckets.find((b) => b.label === '>7d')?.count ?? 0);

  drawMetricCard(doc, 'Total', String(metrics.total), margin, y, cardW, cardH, colors.primary);
  drawMetricCard(
    doc,
    `Compliance ${DISPUTE_SLA_HOURS}h`,
    `${metrics.slaCompliancePct.toFixed(1)}%`,
    margin + (cardW + 3),
    y,
    cardW,
    cardH,
    metrics.slaCompliancePct >= 90
      ? colors.success
      : metrics.slaCompliancePct >= 70
      ? colors.warning
      : colors.danger,
  );
  drawMetricCard(
    doc,
    'Tempo médio (h)',
    metrics.avgResolutionHours ? metrics.avgResolutionHours.toFixed(1) : '—',
    margin + (cardW + 3) * 2,
    y,
    cardW,
    cardH,
    colors.dark,
  );
  drawMetricCard(
    doc,
    'Backlog > 72h',
    String(backlogFora),
    margin + (cardW + 3) * 3,
    y,
    cardW,
    cardH,
    backlogFora > 0 ? colors.danger : colors.success,
  );
  y += cardH + 8;

  // Executive summary
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumo executivo', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summary = [
    `Pendentes/em análise: ${metrics.pending}`,
    `Julgadas no SLA: ${metrics.resolvedWithinSla} · Fora do SLA: ${metrics.resolvedBreachedSla}`,
    metrics.p90ResolutionHours != null
      ? `Percentil 90 de tempo de julgamento: ${metrics.p90ResolutionHours.toFixed(1)}h`
      : 'Sem dados suficientes para calcular p90.',
    metrics.slaCompliancePct >= 90
      ? 'Compliance saudável — manter cadência atual.'
      : metrics.slaCompliancePct >= 70
      ? 'Atenção: compliance abaixo da meta, revisar priorização.'
      : 'Crítico: risco regulatório, escalar imediatamente.',
  ];
  summary.forEach((line) => {
    doc.text(`• ${line}`, margin, y);
    y += 5;
  });
  y += 4;

  // Backlog por idade
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Backlog por idade', margin, y);
  y += 4;
  const backlogData = metrics.backlogAgeBuckets.map((b, i) => ({
    label: b.label,
    value: b.count,
    color: chartColors[i % chartColors.length],
  }));
  if (backlogData.some((d) => d.value > 0)) {
    drawHorizontalBarChart(doc, backlogData, margin, y, pageWidth - margin * 2);
    y += backlogData.length * 20 + 4;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('Nenhum item no backlog no período.', margin, y + 4);
    y += 10;
  }

  // Status table
  autoTable(doc, {
    startY: y,
    head: [['Status', 'Quantidade']],
    body: (Object.entries(metrics.byStatus) as [DisputeStatus, number][]).map(([k, v]) => [
      DISPUTE_STATUS_LABEL[k] ?? k,
      String(v),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: colors.primary },
    margin: { left: margin, right: margin },
    theme: 'striped',
  });
  const afterStatus = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // Category table
  autoTable(doc, {
    startY: afterStatus,
    head: [['Categoria', 'Quantidade']],
    body: Object.entries(metrics.byCategory).map(([k, v]) => [
      DISPUTE_CATEGORY_LABEL[k as DisputeCategory] ?? k,
      String(v),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: colors.dark },
    margin: { left: margin, right: margin },
    theme: 'striped',
  });

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(
      `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })} · Página ${i}/${pages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' },
    );
  }

  doc.save(`disputas-sla-${from}_${to}.pdf`);
}
