import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GeofenceViolationRow {
  created_at: string;
  employee_name: string;
  device: string;
  distance_meters: number;
  action_taken: string;
}

export const generateGeofencePDFReport = (violations: GeofenceViolationRow[], periodName: string) => {
  const doc = new jsPDF();
  const now = format(new Date(), "dd/MM/yyyy HH:mm");

  // Title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text('Relatório Mensal de Violações de Geofence', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(127, 140, 141);
  doc.text(`Período: ${periodName} | Gerado em: ${now}`, 14, 30);

  // Executive Summary
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text('Resumo Executivo', 14, 45);
  
  const totalViolations = violations.length;
  const uniqueEmployees = new Set(violations.map(v => v.employee_name)).size;
  const uniqueDevices = new Set(violations.map(v => v.device)).size;

  autoTable(doc, {
    startY: 50,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total de Violações Detectadas', totalViolations.toString()],
      ['Colaboradores Envolvidos', uniqueEmployees.toString()],
      ['Dispositivos Monitorados com Alertas', uniqueDevices.toString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219] }
  });

  // Detailed Table
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Detalhamento por Colaborador', 14, 22);

  autoTable(doc, {
    startY: 30,
    head: [['Data/Hora', 'Colaborador', 'Dispositivo', 'Distância', 'Ação']],
    body: violations.map(v => [
      format(new Date(v.created_at), "dd/MM/yy HH:mm"),
      v.employee_name,
      v.device,
      `${v.distance_meters}m`,
      v.action_taken === 'blocked' ? 'Bloqueado' : 'Notificado'
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [52, 152, 219] }
  });

  doc.save(`relatorio-geofence-${periodName.replace(/\s/g, '-')}.pdf`);
};
