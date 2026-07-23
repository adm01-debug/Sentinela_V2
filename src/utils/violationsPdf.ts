/**
 * PDF export for Violações de Segurança.
 * Respeita filtros e intervalo selecionado, com opção de agrupar por colaborador.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors, drawMetricCard, type RGB } from './pdf/pdfHelpers';
import type { Violation } from '@/hooks/useViolationsPage';

export interface ViolationsPdfPayload {
  violations: Violation[];
  periodLabel: string;
  filters: {
    search?: string;
    severity?: string;
    status?: string;
    type?: string;
  };
  typeLabels: Record<string, string>;
  groupByEmployee?: boolean;
}

const SEVERITY_COLOR: Record<string, RGB> = {
  critical: colors.danger,
  high: colors.warning,
  medium: colors.primary,
  low: colors.muted,
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Aberta', investigating: 'Investigando',
  resolved: 'Resolvida', dismissed: 'Descartada',
};

export const generateViolationsPdf = (payload: ViolationsPdfPayload): void => {
  const { violations, periodLabel, filters, typeLabels, groupByEmployee } = payload;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Violações', margin, 20);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(periodLabel, margin, 30);
  doc.setFontSize(9);
  doc.text(
    `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
    pageWidth - margin, 20, { align: 'right' },
  );
  const filterParts = [
    filters.search ? `Busca: "${filters.search}"` : null,
    filters.severity && filters.severity !== 'all' ? `Severidade: ${SEVERITY_LABEL[filters.severity] || filters.severity}` : null,
    filters.status && filters.status !== 'all' ? `Status: ${STATUS_LABEL[filters.status] || filters.status}` : null,
    filters.type && filters.type !== 'all' ? `Tipo: ${typeLabels[filters.type] || filters.type}` : null,
  ].filter(Boolean);
  const filterLine = filterParts.length ? filterParts.join(' • ') : 'Sem filtros aplicados';
  doc.text(filterLine, pageWidth - margin, 30, { align: 'right' });

  let y = 50;

  // Metric cards
  const total = violations.length;
  const bySeverity = violations.reduce<Record<string, number>>((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1; return acc;
  }, {});
  const byStatus = violations.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1; return acc;
  }, {});
  const cardWidth = (pageWidth - margin * 2 - 12) / 4;
  drawMetricCard(doc, 'Total', String(total), margin, y, cardWidth, 22, colors.primary);
  drawMetricCard(doc, 'Críticas', String(bySeverity.critical || 0), margin + (cardWidth + 4), y, cardWidth, 22, colors.danger);
  drawMetricCard(doc, 'Abertas', String(byStatus.open || 0), margin + (cardWidth + 4) * 2, y, cardWidth, 22, colors.warning);
  drawMetricCard(doc, 'Resolvidas', String(byStatus.resolved || 0), margin + (cardWidth + 4) * 3, y, cardWidth, 22, colors.success);
  y += 30;

  // Breakdown por severidade
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Distribuição por severidade', margin, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [['Severidade', 'Qtd', '%']],
    body: (['critical', 'high', 'medium', 'low'] as const).map(s => [
      SEVERITY_LABEL[s],
      String(bySeverity[s] || 0),
      total > 0 ? `${Math.round(((bySeverity[s] || 0) / total) * 100)}%` : '0%',
    ]),
    theme: 'grid',
    headStyles: { fillColor: colors.dark, textColor: colors.white, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Corpo — agrupado ou plano
  if (groupByEmployee) {
    const groups = new Map<string, Violation[]>();
    violations.forEach(v => {
      const key = v.employee_name || 'Desconhecido';
      const list = groups.get(key) ?? [];
      list.push(v);
      groups.set(key, list);
    });
    const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    ordered.forEach(([name, list]) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text(`${name}  (${list.length})`, margin, y);
      y += 3;
      autoTable(doc, {
        startY: y,
        head: [['Data', 'Tipo', 'Severidade', 'Status', 'Descrição']],
        body: list.map(v => [
          format(new Date(v.created_at), 'dd/MM HH:mm', { locale: ptBR }),
          typeLabels[v.violation_type] || v.violation_type,
          SEVERITY_LABEL[v.severity] || v.severity,
          STATUS_LABEL[v.status] || v.status,
          v.description || '—',
        ]),
        theme: 'striped',
        headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 24 }, 1: { cellWidth: 38 },
          2: { cellWidth: 22 }, 3: { cellWidth: 24 }, 4: { cellWidth: 'auto' },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const raw = list[data.row.index].severity;
            const c = SEVERITY_COLOR[raw];
            if (c) { data.cell.styles.textColor = c; data.cell.styles.fontStyle = 'bold'; }
          }
        },
        margin: { left: margin, right: margin },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    });
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Colaborador', 'Tipo', 'Sev.', 'Status', 'Descrição']],
      body: violations.map(v => [
        format(new Date(v.created_at), 'dd/MM HH:mm', { locale: ptBR }),
        v.employee_name,
        typeLabels[v.violation_type] || v.violation_type,
        SEVERITY_LABEL[v.severity] || v.severity,
        STATUS_LABEL[v.status] || v.status,
        v.description || '—',
      ]),
      theme: 'striped',
      headStyles: { fillColor: colors.primary, textColor: colors.white, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 22 }, 1: { cellWidth: 34 }, 2: { cellWidth: 32 },
        3: { cellWidth: 16 }, 4: { cellWidth: 22 }, 5: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const raw = violations[data.row.index].severity;
          const c = SEVERITY_COLOR[raw];
          if (c) { data.cell.styles.textColor = c; data.cell.styles.fontStyle = 'bold'; }
        }
      },
      margin: { left: margin, right: margin },
    });
  }

  // Footer com paginação
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' },
    );
    doc.text('Sentinela • Relatório confidencial', margin, doc.internal.pageSize.getHeight() - 8);
  }

  const stamp = format(new Date(), 'yyyyMMdd_HHmm');
  doc.save(`violacoes_${stamp}.pdf`);
};
