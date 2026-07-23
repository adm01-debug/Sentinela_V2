/**
 * PDF export for the Analytics → Productivity page.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors } from './pdf/pdfHelpers';
import type { RankingEntry } from '@/hooks/useWeeklyProductivityRanking';

export interface AnalyticsPdfPayload {
  periodLabel: string;
  filters: { employee?: string; device?: string };
  score: {
    productiveSeconds: number;
    neutralSeconds: number;
    unproductiveSeconds: number;
    idleSeconds: number;
  };
  topApps: Array<{ name: string; seconds: number; category?: string }>;
  ranking: RankingEntry[];
  teamAverageScore: number;
}

const min = (s: number) => `${Math.round(s / 60)} min`;
const pct = (part: number, total: number) => (total > 0 ? `${Math.round((part / total) * 100)}%` : '0%');

export const generateAnalyticsPdf = (payload: AnalyticsPdfPayload): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('Analytics de Produtividade', margin, 20);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(payload.periodLabel, margin, 30);
  doc.setFontSize(9);
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pageWidth - margin, 20, { align: 'right' });
  const filterLine = [
    payload.filters.employee ? `Colaborador: ${payload.filters.employee}` : 'Todos os colaboradores',
    payload.filters.device ? `Dispositivo: ${payload.filters.device}` : null,
  ].filter(Boolean).join(' • ');
  doc.text(filterLine, pageWidth - margin, 30, { align: 'right' });

  let y = 55;

  // Score breakdown
  const total = payload.score.productiveSeconds + payload.score.neutralSeconds + payload.score.unproductiveSeconds;
  const productivityScore = total > 0 ? Math.round((payload.score.productiveSeconds / total) * 100) : 0;

  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Indicador', 'Valor', '% do total']],
    body: [
      ['Score de produtividade', `${productivityScore}%`, '—'],
      ['Média da equipe', `${payload.teamAverageScore}%`, '—'],
      ['Tempo produtivo', min(payload.score.productiveSeconds), pct(payload.score.productiveSeconds, total)],
      ['Tempo neutro', min(payload.score.neutralSeconds), pct(payload.score.neutralSeconds, total)],
      ['Tempo improdutivo', min(payload.score.unproductiveSeconds), pct(payload.score.unproductiveSeconds, total)],
      ['Ociosidade', min(payload.score.idleSeconds), '—'],
      ['Tempo total monitorado', min(total), '100%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: colors.primary, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: colors.light },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 45, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // Top apps
  if (payload.topApps.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = 20; }
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('Top Aplicações', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['#', 'Aplicação', 'Categoria', 'Tempo (min)']],
      body: payload.topApps.slice(0, 15).map((a, i) => [
        String(i + 1),
        a.name,
        a.category ?? '—',
        String(Math.round(a.seconds / 60)),
      ]),
      theme: 'striped',
      headStyles: { fillColor: colors.success, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: colors.light },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30, halign: 'right' },
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  }

  // Ranking
  if (payload.ranking.length > 0) {
    if (y > pageHeight - 60) { doc.addPage(); y = 20; }
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('Ranking Semanal', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['#', 'Colaborador', 'Score', 'Produtivo (min)', 'Dias ativos']],
      body: payload.ranking.slice(0, 25).map((r, i) => [
        String(i + 1),
        r.employeeName,
        `${r.score}%`,
        String(Math.round(r.productiveSeconds / 60)),
        String(r.activeDays),
      ]),
      theme: 'striped',
      headStyles: { fillColor: colors.dark, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: colors.light },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const val = parseInt(String(data.cell.raw).replace('%', ''), 10);
          if (val >= payload.teamAverageScore) {
            data.cell.styles.textColor = colors.success;
            data.cell.styles.fontStyle = 'bold';
          } else if (val < payload.teamAverageScore - 10) {
            data.cell.styles.textColor = colors.danger;
          }
        }
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]); doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.setFontSize(8); doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('SecureWatch - Relatório Confidencial', margin, pageHeight - 8);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const stamp = format(new Date(), 'yyyy-MM-dd-HHmm');
  doc.save(`analytics-produtividade-${stamp}.pdf`);
};
