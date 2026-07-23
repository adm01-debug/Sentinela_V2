/**
 * Exportadores (CSV + PDF) do relatório de Live View.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors, drawMetricCard } from './pdf/pdfHelpers';
import type { LiveViewSessionRow, LiveViewAuditRow } from '@/hooks/useLiveViewReport';
import { formatDuration } from '@/hooks/useLiveViewReport';

const CONSENT_LABEL: Record<string, string> = {
  pending: 'Pendente',
  granted: 'Consentido',
  denied: 'Recusado',
  timeout: 'Tempo esgotado',
  not_required: 'Não requerido',
};

const END_REASON_LABEL: Record<string, string> = {
  user_stopped: 'Encerrada pelo admin',
  peer_failed: 'Falha de conexão',
  peer_closed: 'Conexão fechada',
  consent_denied: 'Consentimento recusado',
  consent_timeout: 'Consentimento sem resposta',
};

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(new Date(iso), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  } catch {
    return iso;
  }
}

function csvEscape(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportLiveViewCsv(
  sessions: LiveViewSessionRow[],
  audit: LiveViewAuditRow[],
  periodLabel: string,
): void {
  const lines: string[] = [];
  lines.push(`Relatório Live View;${periodLabel}`);
  lines.push('');
  lines.push('SESSÕES');
  lines.push([
    'Sessão','Agente','Assistido por','Início','Fim','Duração (s)',
    'Status','Consentimento','Motivo do consentimento','Decidido em',
    'Motivo do encerramento','IP','User-Agent',
  ].join(';'));
  sessions.forEach((s) => {
    lines.push([
      s.id, s.agent_label, s.viewer_label,
      s.started_at ?? '', s.ended_at ?? '',
      s.duration_seconds ?? '',
      s.status,
      CONSENT_LABEL[s.consent_state] ?? s.consent_state,
      s.consent_reason ?? '',
      s.consent_decided_at ?? '',
      END_REASON_LABEL[s.end_reason ?? ''] ?? s.end_reason ?? '',
      s.ip ?? '', s.user_agent ?? '',
    ].map(csvEscape).join(';'));
  });
  lines.push('');
  lines.push('EVENTOS DE AUDITORIA');
  lines.push(['Sessão','Evento','Data/Hora','Payload'].join(';'));
  audit.forEach((a) => {
    lines.push([
      a.session_id, a.event, a.created_at,
      a.payload ? JSON.stringify(a.payload) : '',
    ].map(csvEscape).join(';'));
  });

  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `live-view-report-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLiveViewPdf(
  sessions: LiveViewSessionRow[],
  audit: LiveViewAuditRow[],
  periodLabel: string,
  agentLabel: string,
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Sessões de Visualização Remota', 14, 14);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`${periodLabel}  ·  Agente: ${agentLabel}`, 14, 19);

  // Metrics
  const total = sessions.length;
  const denied = sessions.filter((s) => s.consent_state === 'denied').length;
  const granted = sessions.filter((s) => s.consent_state === 'granted' || s.consent_state === 'not_required').length;
  const totalSec = sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0);

  const cardW = (pageW - 28 - 18) / 4;
  drawMetricCard(doc, 'Sessões', String(total), 14, 28, cardW, 20, colors.primary);
  drawMetricCard(doc, 'Consentidas', String(granted), 14 + (cardW + 6), 28, cardW, 20, colors.success);
  drawMetricCard(doc, 'Recusadas', String(denied), 14 + (cardW + 6) * 2, 28, cardW, 20, colors.danger);
  drawMetricCard(doc, 'Tempo total', formatDuration(totalSec), 14 + (cardW + 6) * 3, 28, cardW, 20, colors.dark);

  // Sessions table
  autoTable(doc, {
    startY: 54,
    head: [['Início', 'Agente', 'Assistido por', 'Duração', 'Consent.', 'Motivo consent.', 'Encerramento']],
    body: sessions.map((s) => [
      fmtDate(s.started_at ?? s.created_at),
      s.agent_label,
      s.viewer_label,
      formatDuration(s.duration_seconds),
      CONSENT_LABEL[s.consent_state] ?? s.consent_state,
      s.consent_reason ?? '—',
      END_REASON_LABEL[s.end_reason ?? ''] ?? s.end_reason ?? '—',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: colors.dark, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 3: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  // Audit page
  doc.addPage();
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Trilha de Auditoria (live_view_audit)', 14, 9);

  autoTable(doc, {
    startY: 20,
    head: [['Data/Hora', 'Sessão', 'Evento', 'Payload']],
    body: audit.map((a) => [
      fmtDate(a.created_at),
      a.session_id.slice(0, 8),
      a.event,
      a.payload ? JSON.stringify(a.payload) : '—',
    ]),
    styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: colors.primary, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 3: { cellWidth: 130 } },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(
      `Sentinela · Live View · Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}  ·  Página ${i}/${pages}`,
      14,
      doc.internal.pageSize.getHeight() - 6,
    );
  }

  doc.save(`live-view-report-${format(new Date(), 'yyyyMMdd-HHmm')}.pdf`);
}
