/**
 * Exportador PDF da Auditoria de Escalações de SLA.
 * Snapshot executivo: saúde do cron, performance e erros recentes.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors } from './pdf/pdfHelpers';

interface RecentError {
  created_at: string;
  status: number | null;
  message: string;
}

export interface EscalationAuditReport {
  generatedAt: Date;
  heartbeat: {
    status: 'ok' | 'warn' | 'down';
    lastRun: Date | null;
    minutesSinceLastRun: number | null;
  };
  performance: {
    p50: number;
    p95: number;
    successRate: number;
    sampleSize: number;
  };
  counts: {
    breached: number;
    critical: number;
    warning: number;
    total: number;
  };
  errors24h: {
    errorRate: number;
    total: number;
    failed: number;
    recent: RecentError[];
  };
  histogram: { label: string; count: number }[];
}

export function exportEscalationAuditPdf(report: EscalationAuditReport): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Auditoria de Escalações de SLA', margin, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Gerado em ${format(report.generatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    margin,
    19,
  );

  doc.setTextColor(30, 30, 30);
  let y = 36;

  // KPIs
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Indicadores', margin, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 9 },
    head: [['Indicador', 'Valor']],
    body: [
      [
        'Saúde do cron',
        report.heartbeat.status === 'ok'
          ? 'Saudável'
          : report.heartbeat.status === 'warn'
            ? 'Atenção'
            : 'Inativo',
      ],
      [
        'Última execução',
        report.heartbeat.lastRun
          ? `${format(report.heartbeat.lastRun, "dd/MM/yyyy HH:mm", { locale: ptBR })} (${report.heartbeat.minutesSinceLastRun ?? '?'} min atrás)`
          : 'Sem execuções registradas',
      ],
      ['Latência p50', `${report.performance.p50} ms`],
      ['Latência p95', `${report.performance.p95} ms`],
      ['Taxa de sucesso', `${report.performance.successRate}%`],
      ['Amostra analisada', `${report.performance.sampleSize} execuções`],
      ['SLAs violados', String(report.counts.breached)],
      ['Críticos (≤4h)', String(report.counts.critical)],
      ['Atenção (≤12h)', String(report.counts.warning)],
      [
        'Taxa de erro 24h',
        `${report.errors24h.errorRate}% (${report.errors24h.failed}/${report.errors24h.total})`,
      ],
    ],
  });

  // Histograma
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Distribuição de latência', margin, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    theme: 'striped',
    styles: { fontSize: 9 },
    head: [['Faixa', 'Execuções']],
    body: report.histogram.map((h) => [h.label, String(h.count)]),
  });

  // Falhas recentes
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Falhas recentes (24h)', margin, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [colors.primary[0], colors.primary[1], colors.primary[2]] },
    head: [['Quando', 'HTTP', 'Mensagem']],
    body:
      report.errors24h.recent.length === 0
        ? [['—', '—', 'Nenhuma falha registrada nas últimas 24h.']]
        : report.errors24h.recent.map((e) => [
            format(new Date(e.created_at), 'dd/MM HH:mm', { locale: ptBR }),
            String(e.status ?? '?'),
            e.message,
          ]),
  });

  doc.save(`auditoria-escalacoes-${format(report.generatedAt, 'yyyy-MM-dd-HHmm')}.pdf`);
}
