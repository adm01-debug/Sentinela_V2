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

/** Baixa uma imagem e converte em dataURL para embutir no PDF. Retorna null em falha. */
const fetchImageAsDataUrl = async (
  url: string,
  timeoutMs = 4000,
): Promise<{ data: string; format: 'JPEG' | 'PNG'; w: number; h: number } | null> => {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size > 3 * 1024 * 1024) return null; // skip >3MB
    const dataUrl: string = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(blob);
    });
    const format: 'JPEG' | 'PNG' = blob.type.includes('png') ? 'PNG' : 'JPEG';
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 400, h: 300 });
      img.src = dataUrl;
    });
    return { data: dataUrl, format, w: dims.w, h: dims.h };
  } catch {
    return null;
  }
};

export const generateViolationsPdf = async (payload: ViolationsPdfPayload): Promise<void> => {
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

  // Tendência dos últimos 14 dias (mini bar chart embutido)
  if (violations.length > 0) {
    const days = 14;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const buckets: { label: string; count: number; crit: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      buckets.push({ label: format(d, 'dd/MM'), count: 0, crit: 0 });
    }
    const startTs = today.getTime() - (days - 1) * 86400000;
    violations.forEach(v => {
      const t = new Date(v.created_at).getTime();
      const idx = Math.floor((t - startTs) / 86400000);
      if (idx >= 0 && idx < days) {
        buckets[idx].count++;
        if (v.severity === 'critical') buckets[idx].crit++;
      }
    });
    const max = Math.max(1, ...buckets.map(b => b.count));
    const chartH = 32;
    const chartW = pageWidth - margin * 2;
    const barW = (chartW - 8) / days;

    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(`Tendência dos últimos ${days} dias`, margin, y);
    y += 4;
    // eixo base
    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
    doc.line(margin, y + chartH, margin + chartW, y + chartH);
    buckets.forEach((b, i) => {
      const x = margin + 4 + i * barW;
      const h = (b.count / max) * chartH;
      const critH = (b.crit / max) * chartH;
      // total
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(x, y + chartH - h, barW - 2, h, 'F');
      // parcela crítica
      if (critH > 0) {
        doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
        doc.rect(x, y + chartH - critH, barW - 2, critH, 'F');
      }
      // valor
      if (b.count > 0) {
        doc.setFontSize(6); doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text(String(b.count), x + (barW - 2) / 2, y + chartH - h - 1, { align: 'center' });
      }
      // label dia (a cada 2)
      if (i % 2 === 0) {
        doc.setFontSize(6); doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text(b.label, x + (barW - 2) / 2, y + chartH + 4, { align: 'center' });
      }
    });
    // legenda
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin + chartW - 60, y - 3, 3, 3, 'F');
    doc.setFontSize(7); doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text('Total', margin + chartW - 55, y - 0.5);
    doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.rect(margin + chartW - 38, y - 3, 3, 3, 'F');
    doc.text('Críticas', margin + chartW - 33, y - 0.5);
    y += chartH + 10;
  }



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

  // Evidências visuais — top violações críticas/altas com screenshot associado
  const severityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const withShots = violations
    .filter(v => !!v.screenshot_url)
    .sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)
      || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  if (withShots.length > 0) {
    doc.addPage();
    let ey = 20;
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text('Evidências visuais (top críticas)', margin, ey);
    ey += 4;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(`Até ${withShots.length} screenshots das violações mais severas do período`, margin, ey + 3);
    ey += 10;

    const cellW = (pageWidth - margin * 2 - 8) / 2;
    const cellH = 70;
    const images = await Promise.all(withShots.map(v => fetchImageAsDataUrl(v.screenshot_url as string)));

    for (let i = 0; i < withShots.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      if (row > 0 && col === 0 && ey + cellH > 270) {
        doc.addPage(); ey = 20;
      }
      const x = margin + col * (cellW + 8);
      const y2 = ey + row * (cellH + 6);

      // moldura
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
      doc.rect(x, y2, cellW, cellH);

      const v = withShots[i];
      const img = images[i];
      const imgAreaH = cellH - 16;
      if (img) {
        const aspect = img.w / img.h;
        let dw = cellW - 4; let dh = dw / aspect;
        if (dh > imgAreaH - 2) { dh = imgAreaH - 2; dw = dh * aspect; }
        const ix = x + (cellW - dw) / 2;
        const iy = y2 + 2 + (imgAreaH - dh) / 2;
        try {
          doc.addImage(img.data, img.format, ix, iy, dw, dh, undefined, 'FAST');
        } catch {
          doc.setFontSize(8); doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
          doc.text('Falha ao renderizar imagem', x + cellW / 2, y2 + imgAreaH / 2, { align: 'center' });
        }
      } else {
        doc.setFontSize(8); doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text('Screenshot indisponível', x + cellW / 2, y2 + imgAreaH / 2, { align: 'center' });
      }

      // caption
      const capY = y2 + cellH - 12;
      doc.setDrawColor(235, 235, 235);
      doc.line(x + 2, capY, x + cellW - 2, capY);
      doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      const title = `${v.employee_name} • ${SEVERITY_LABEL[v.severity] || v.severity}`;
      doc.text(doc.splitTextToSize(title, cellW - 4)[0], x + 3, capY + 4);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      const sub = `${format(new Date(v.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })} • ${typeLabels[v.violation_type] || v.violation_type}`;
      doc.text(doc.splitTextToSize(sub, cellW - 4)[0], x + 3, capY + 8);
    }
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
