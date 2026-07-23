/**
 * Exportadores (CSV + PDF) do Relatório de Ciência (LGPD) por colaborador.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors, drawMetricCard } from './pdf/pdfHelpers';
import type {
  AckReportData,
  AckViolationRow,
  EmployeeAckStats,
} from '@/hooks/useAcknowledgmentReport';
import { formatAckDuration } from '@/hooks/useAcknowledgmentReport';

function fmt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch {
    return iso;
  }
}

function csvEscape(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAcknowledgmentCsv(data: AckReportData, filenamePrefix = 'ciencia'): void {
  const headers = [
    'colaborador',
    'politica',
    'tipo',
    'severidade',
    'criada_em',
    'notificada_em',
    'ciencia_em',
    'tempo_ate_ciencia_s',
    'justificativa',
    'ip',
    'dispositivo',
  ];
  const lines: string[] = [headers.join(';')];
  for (const r of data.rows) {
    const notifiedAt = r.employee_notified_at ? new Date(r.employee_notified_at).getTime() : null;
    const ackAt = r.employee_acknowledged_at
      ? new Date(r.employee_acknowledged_at).getTime()
      : null;
    const dt = notifiedAt && ackAt ? Math.round((ackAt - notifiedAt) / 1000) : '';
    lines.push(
      [
        r.employee_name,
        r.policy_name ?? '',
        r.violation_type ?? '',
        r.severity ?? '',
        r.created_at,
        r.employee_notified_at ?? '',
        r.employee_acknowledged_at ?? '',
        dt,
        r.employee_ack_reason ?? '',
        r.employee_ack_ip ?? '',
        r.employee_ack_device ?? '',
      ]
        .map(csvEscape)
        .join(';'),
    );
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  download(blob, `${filenamePrefix}-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`);
}

export function exportAcknowledgmentPdf(
  data: AckReportData,
  meta: { from: string; to: string; employee?: string | null },
): void {
  const doc = new jsPDF({ orientation: 'landscape' });
  const w = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, w, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Ciência LGPD — Violações', 14, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Período: ${fmt(meta.from)} — ${fmt(meta.to)}${meta.employee ? ` · ${meta.employee}` : ''}`,
    14,
    21,
  );

  // Metric cards
  const y = 32;
  const cardW = (w - 28 - 12) / 4;
  drawMetricCard(doc, 'Total violações', String(data.totals.total), 14, y, cardW, 22, colors.dark);
  drawMetricCard(
    doc,
    'Ciência confirmada',
    String(data.totals.acknowledged),
    14 + (cardW + 4),
    y,
    cardW,
    22,
    colors.success,
  );
  drawMetricCard(
    doc,
    'Aguardando ciência',
    String(data.totals.pending),
    14 + (cardW + 4) * 2,
    y,
    cardW,
    22,
    colors.warning,
  );
  drawMetricCard(
    doc,
    'Taxa de ciência',
    `${data.totals.ackRate.toFixed(1)}%`,
    14 + (cardW + 4) * 3,
    y,
    cardW,
    22,
    colors.primary,
  );

  // Per-employee table
  autoTable(doc, {
    startY: y + 30,
    head: [
      [
        'Colaborador',
        'Total',
        'Notificadas',
        'Ciência',
        'Pendente',
        'Sem notificação',
        'Taxa',
        'Tempo médio',
      ],
    ],
    body: data.perEmployee.map((e) => [
      e.employee,
      e.total,
      e.notified,
      e.acknowledged,
      e.pending,
      e.notNotified,
      `${e.ackRate.toFixed(1)}%`,
      formatAckDuration(e.avgAckSeconds),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: colors.dark, textColor: 255 },
    didParseCell: (hook) => {
      if (hook.section === 'body' && hook.column.index === 6) {
        const emp = data.perEmployee[hook.row.index];
        if (emp) {
          const rate = emp.ackRate;
          if (rate >= 90) hook.cell.styles.textColor = colors.success;
          else if (rate >= 60) hook.cell.styles.textColor = colors.warning;
          else if (emp.notified > 0) hook.cell.styles.textColor = colors.danger;
        }
      }
    },
  });

  // Detail table (new page)
  doc.addPage();
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Detalhamento das violações', 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [
      ['Colaborador', 'Política', 'Severidade', 'Criada', 'Notificada', 'Ciente em', 'Justificativa'],
    ],
    body: data.rows.map((r: AckViolationRow) => [
      r.employee_name,
      r.policy_name ?? '—',
      r.severity ?? '—',
      fmt(r.created_at),
      fmt(r.employee_notified_at),
      fmt(r.employee_acknowledged_at),
      r.employee_ack_reason ?? '—',
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: colors.primary, textColor: 255 },
    columnStyles: { 6: { cellWidth: 60 } },
  });

  // Footer on last page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(
      `Sentinela · Relatório LGPD · Página ${i}/${pages} · Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      14,
      doc.internal.pageSize.getHeight() - 6,
    );
  }

  doc.save(`ciencia-lgpd-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`);
}

export type { EmployeeAckStats };
