/**
 * PDF export for the "Daily Journey" tab of an employee.
 * Uses jsPDF + autoTable, matching the SecureWatch report visual language.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors } from './pdf/pdfHelpers';
import type { JourneyEvent, JourneySummary } from '@/hooks/useDailyJourney';

interface JourneyPdfPayload {
  employeeName: string;
  date: string; // yyyy-MM-dd
  events: JourneyEvent[];
  summary?: JourneySummary;
}

const eventTypeLabel = (type: JourneyEvent['type']): string => {
  switch (type) {
    case 'check_in': return 'Check-in';
    case 'check_out': return 'Check-out';
    case 'violation': return 'Violação';
    case 'activity': return 'Atividade';
    case 'screenshot': return 'Screenshot';
    default: return type;
  }
};

export const generateJourneyPdf = ({ employeeName, date, events, summary }: JourneyPdfPayload): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const parsedDate = parseISO(date);

  // Header
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('Jornada Diária', margin, 20);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(employeeName, margin, 30);
  doc.setFontSize(9);
  doc.text(format(parsedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }), pageWidth - margin, 20, { align: 'right' });
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pageWidth - margin, 30, { align: 'right' });

  let yPos = 55;

  // Summary metrics
  if (summary && summary.totalSeconds > 0) {
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text('Resumo do Dia', margin, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor']],
      body: [
        ['Score de produtividade', `${summary.productivityScore}%`],
        ['Tempo produtivo', `${Math.round(summary.productiveSeconds / 60)} min`],
        ['Tempo neutro', `${Math.round(summary.neutralSeconds / 60)} min`],
        ['Tempo improdutivo', `${Math.round(summary.unproductiveSeconds / 60)} min`],
        ['Tempo total monitorado', `${Math.round(summary.totalSeconds / 60)} min`],
      ],
      theme: 'striped',
      headStyles: { fillColor: colors.primary, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: colors.light },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 60, halign: 'right' } },
    });
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    if (summary.topApps.length > 0) {
      doc.setFontSize(13); doc.setFont('helvetica', 'bold');
      doc.text('Top Aplicações', margin, yPos);
      yPos += 8;
      autoTable(doc, {
        startY: yPos,
        head: [['Aplicação', 'Tempo (min)']],
        body: summary.topApps.map((a) => [a.name, String(Math.round(a.seconds / 60))]),
        theme: 'striped',
        headStyles: { fillColor: colors.success, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: colors.light },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 40, halign: 'right' } },
      });
      yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }
  }

  // Events table
  if (yPos > pageHeight - 60) { doc.addPage(); yPos = 20; }
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text(`Eventos (${events.length})`, margin, yPos);
  yPos += 8;

  if (events.length === 0) {
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text('Nenhum evento registrado nesta data.', margin, yPos + 6);
  } else {
    autoTable(doc, {
      startY: yPos,
      head: [['Hora', 'Tipo', 'Descrição']],
      body: events.map((e) => [
        format(new Date(e.timestamp), 'HH:mm:ss'),
        eventTypeLabel(e.type),
        e.description ?? e.title ?? '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: colors.dark, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: colors.light },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 122 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === 'body') {
          const raw = String(data.cell.raw ?? '');
          if (raw === 'Violação') { data.cell.styles.textColor = colors.danger; data.cell.styles.fontStyle = 'bold'; }
          else if (raw === 'Check-in') { data.cell.styles.textColor = colors.success; }
          else if (raw === 'Check-out') { data.cell.styles.textColor = colors.warning; }
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

  const safeName = employeeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  doc.save(`jornada-${safeName}-${date}.pdf`);
};
