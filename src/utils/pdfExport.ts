import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReportData } from '@/data/reportData';

// Tipo para cores RGB
type RGB = [number, number, number];

// Cores do tema
const colors: Record<string, RGB> = {
  primary: [59, 130, 246],      // Azul
  success: [34, 197, 94],       // Verde
  warning: [251, 146, 60],      // Laranja
  danger: [239, 68, 68],        // Vermelho
  dark: [30, 41, 59],           // Slate escuro
  muted: [100, 116, 139],       // Cinza
  light: [241, 245, 249],       // Cinza claro
  white: [255, 255, 255],
};

const chartColors: RGB[] = [
  [59, 130, 246],   // Azul
  [34, 197, 94],    // Verde
  [251, 146, 60],   // Laranja
  [239, 68, 68],    // Vermelho
  [168, 85, 247],   // Roxo
  [236, 72, 153],   // Rosa
  [20, 184, 166],   // Teal
];

// Helper para desenhar retângulo arredondado
const drawRoundedRect = (
  doc: jsPDF, 
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  r: number, 
  style: 'F' | 'S' | 'FD' = 'F'
) => {
  doc.roundedRect(x, y, w, h, r, r, style);
};

// Helper para desenhar gráfico de barras horizontal
const drawHorizontalBarChart = (
  doc: jsPDF,
  data: { label: string; value: number; color: RGB }[],
  x: number,
  y: number,
  width: number,
  barHeight: number = 12,
  gap: number = 8
) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  data.forEach((item, index) => {
    const yPos = y + index * (barHeight + gap);
    const barWidth = (item.value / maxValue) * (width - 60);
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(item.label, x, yPos + barHeight / 2 + 2);
    
    // Barra de fundo
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    drawRoundedRect(doc, x + 60, yPos, width - 60, barHeight, 2, 'F');
    
    // Barra de valor
    if (barWidth > 4) {
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      drawRoundedRect(doc, x + 60, yPos, barWidth, barHeight, 2, 'F');
    }
    
    // Valor
    doc.setFontSize(8);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(String(item.value), x + 60 + barWidth + 4, yPos + barHeight / 2 + 2);
  });
  
  return y + data.length * (barHeight + gap);
};

// Helper para desenhar gráfico de pizza
const drawPieChart = (
  doc: jsPDF,
  data: { label: string; value: number; color: RGB }[],
  centerX: number,
  centerY: number,
  radius: number
) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -Math.PI / 2; // Começar do topo
  
  data.forEach((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    
    // Desenhar fatia
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    
    // Aproximação de arco com linhas
    const steps = Math.max(20, Math.floor(sliceAngle * 20));
    const points: [number, number][] = [[centerX, centerY]];
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps;
      points.push([
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      ]);
    }
    
    // Desenhar polígono usando triangles
    for (let i = 1; i < points.length - 1; i++) {
      doc.triangle(
        centerX, centerY,
        points[i][0], points[i][1],
        points[i + 1][0], points[i + 1][1],
        'F'
      );
    }
    
    startAngle = endAngle;
  });
  
  // Círculo branco no centro (efeito donut)
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.circle(centerX, centerY, radius * 0.5, 'F');
};

// Helper para desenhar legenda
const drawLegend = (
  doc: jsPDF,
  data: { label: string; value: number; color: RGB }[],
  x: number,
  y: number,
  columns: number = 1
) => {
  const itemsPerColumn = Math.ceil(data.length / columns);
  const columnWidth = 80;
  
  data.forEach((item, index) => {
    const column = Math.floor(index / itemsPerColumn);
    const row = index % itemsPerColumn;
    const xPos = x + column * columnWidth;
    const yPos = y + row * 12;
    
    // Quadrado colorido
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(xPos, yPos, 6, 6, 'F');
    
    // Label e valor
    doc.setFontSize(8);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(`${item.label} (${item.value})`, xPos + 10, yPos + 5);
  });
  
  return y + Math.ceil(data.length / columns) * 12;
};

// Helper para desenhar card de métrica
const drawMetricCard = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB
) => {
  // Fundo do card
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  drawRoundedRect(doc, x, y, width, height, 3, 'F');
  
  // Barra de cor à esquerda
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y + 3, 3, height - 6, 'F');
  
  // Valor
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(value, x + 10, y + height / 2 - 2);
  
  // Label
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text(label, x + 10, y + height / 2 + 8);
};

// Helper para desenhar gráfico de linha/área
const drawAreaChart = (
  doc: jsPDF,
  data: { label: string; values: { name: string; value: number; color: RGB }[] }[],
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding - 15;
  const maxValue = 100;
  
  // Fundo do gráfico
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(x + padding, y, chartWidth, chartHeight, 'F');
  
  // Linhas de grade horizontais
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  for (let i = 0; i <= 4; i++) {
    const lineY = y + (chartHeight * i) / 4;
    doc.line(x + padding, lineY, x + padding + chartWidth, lineY);
    
    // Labels do eixo Y
    doc.setFontSize(7);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(String(100 - i * 25) + '%', x + 5, lineY + 2);
  }
  
  // Dados por série
  const seriesNames = data[0]?.values.map(v => v.name) || [];
  
  seriesNames.forEach((seriesName, seriesIndex) => {
    const points: [number, number][] = [];
    const defaultColor = chartColors[seriesIndex] || chartColors[0];
    const colorItem = data[0]?.values.find(v => v.name === seriesName);
    const color: RGB = colorItem?.color || defaultColor;
    
    data.forEach((item, index) => {
      const xPos = x + padding + (index * chartWidth) / (data.length - 1 || 1);
      const valueItem = item.values.find(v => v.name === seriesName);
      const value = valueItem?.value || 0;
      const yPos = y + chartHeight - (value / maxValue) * chartHeight;
      points.push([xPos, yPos]);
    });
    
    // Desenhar linha
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1.5);
    for (let i = 0; i < points.length - 1; i++) {
      doc.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    }
    
    // Pontos
    doc.setFillColor(color[0], color[1], color[2]);
    points.forEach(point => {
      doc.circle(point[0], point[1], 2, 'F');
    });
  });
  
  // Labels do eixo X
  doc.setFontSize(7);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  data.forEach((item, index) => {
    const xPos = x + padding + (index * chartWidth) / (data.length - 1 || 1);
    doc.text(item.label, xPos - 5, y + chartHeight + 10);
  });
};

export const generatePDF = (reportData: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  
  // ==================== PÁGINA 1: CAPA E RESUMO ====================
  
  // Header com gradiente simulado
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Logo/Título
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('SecureWatch', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório de Segurança e Produtividade', margin, 35);
  
  // Info do período (canto direito)
  doc.setFontSize(9);
  const periodText = `${format(reportData.period.start, "dd/MM/yyyy", { locale: ptBR })} - ${format(reportData.period.end, "dd/MM/yyyy", { locale: ptBR })}`;
  const daysCount = differenceInDays(reportData.period.end, reportData.period.start) + 1;
  doc.text(periodText, pageWidth - margin, 22, { align: 'right' });
  doc.text(`Período: ${daysCount} dias`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Departamento: ${reportData.department}`, pageWidth - margin, 38, { align: 'right' });
  
  // Data de geração
  doc.setFontSize(8);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text(
    `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    pageWidth - margin, 
    45, 
    { align: 'right' }
  );
  
  let yPos = 60;
  
  // Título da seção
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', margin, yPos);
  
  yPos += 12;
  
  // Cards de métricas
  const cardWidth = (pageWidth - margin * 2 - 12) / 4;
  const cardHeight = 35;
  
  drawMetricCard(doc, 'Total de Colaboradores', String(reportData.summary.totalEmployees), margin, yPos, cardWidth, cardHeight, colors.primary);
  drawMetricCard(doc, 'Produtividade Média', `${reportData.summary.avgProductivity}%`, margin + cardWidth + 4, yPos, cardWidth, cardHeight, colors.success);
  drawMetricCard(doc, 'Total de Alertas', String(reportData.summary.totalAlerts), margin + (cardWidth + 4) * 2, yPos, cardWidth, cardHeight, colors.warning);
  drawMetricCard(doc, 'Tentativas Bloqueadas', String(reportData.summary.blockedAttempts), margin + (cardWidth + 4) * 3, yPos, cardWidth, cardHeight, colors.danger);
  
  yPos += cardHeight + 20;
  
  // ==================== GRÁFICOS ====================
  
  // Gráfico de Pizza - Alertas por Tipo
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribuição de Alertas por Tipo', margin, yPos);
  
  yPos += 8;
  
  const pieData = reportData.alertsByType.map((item, index) => ({
    label: item.type,
    value: item.count,
    color: chartColors[index % chartColors.length]
  }));
  
  drawPieChart(doc, pieData, margin + 40, yPos + 35, 30);
  
  // Legenda ao lado do gráfico
  drawLegend(doc, pieData, margin + 85, yPos + 10, 1);
  
  yPos += 80;
  
  // Gráfico de Barras - Produtividade por Departamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Produtividade por Departamento', margin, yPos);
  
  yPos += 8;
  
  const barData = reportData.productivityByDepartment.map((item) => ({
    label: item.department.substring(0, 12),
    value: item.score,
    color: (item.score >= 85 ? colors.success : item.score >= 70 ? colors.warning : colors.danger) as RGB
  }));
  
  drawHorizontalBarChart(doc, barData, margin, yPos, pageWidth - margin * 2, 10, 6);
  
  // ==================== PÁGINA 2: TABELAS DETALHADAS ====================
  doc.addPage();
  
  // Header simplificado
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SecureWatch - Relatório Detalhado', margin, 13);
  
  yPos = 30;
  
  // Tabela de Alertas por Tipo
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento de Alertas por Tipo', margin, yPos);
  
  yPos += 8;
  
  const totalAlerts = reportData.alertsByType.reduce((sum, a) => sum + a.count, 0);
  const alertsTableData = reportData.alertsByType.map(a => [
    a.type, 
    a.count.toString(),
    `${((a.count / totalAlerts) * 100).toFixed(1)}%`
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Tipo de Alerta', 'Quantidade', 'Percentual']],
    body: alertsTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: colors.danger,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: colors.light },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Tabela de Produtividade por Departamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Produtividade Detalhada por Departamento', margin, yPos);
  
  yPos += 8;
  
  const productivityTableData = reportData.productivityByDepartment.map(p => [
    p.department,
    `${p.score}%`,
    p.employees.toString(),
    p.score >= 85 ? 'Excelente' : p.score >= 70 ? 'Regular' : 'Atenção'
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Departamento', 'Produtividade', 'Colaboradores', 'Status']],
    body: productivityTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: colors.success,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: colors.light },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const status = data.cell.raw as string;
        if (status === 'Excelente') {
          data.cell.styles.textColor = colors.success;
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Regular') {
          data.cell.styles.textColor = colors.warning;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = colors.danger;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Tabela de Colaboradores com Mais Alertas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Colaboradores com Mais Alertas', margin, yPos);
  
  yPos += 8;
  
  const employeesTableData = reportData.topAlertEmployees.map((e, index) => [
    `${index + 1}º`,
    e.name,
    e.department,
    e.alerts.toString()
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Posição', 'Colaborador', 'Departamento', 'Alertas']],
    body: employeesTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: colors.warning,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: colors.light },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30, halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.column.index === 0 && data.section === 'body') {
        const pos = data.row.index;
        if (pos === 0) {
          data.cell.styles.textColor = colors.danger;
          data.cell.styles.fontStyle = 'bold';
        } else if (pos === 1) {
          data.cell.styles.textColor = colors.warning;
          data.cell.styles.fontStyle = 'bold';
        } else if (pos === 2) {
          data.cell.styles.textColor = [251, 146, 60];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  // ==================== PÁGINA 3: ATIVIDADE DIÁRIA ====================
  doc.addPage();
  
  // Header
  doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SecureWatch - Análise de Atividade', margin, 13);
  
  yPos = 35;
  
  // Gráfico de Atividade Diária
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribuição de Atividade por Dia da Semana', margin, yPos);
  
  yPos += 10;
  
  const activityData = reportData.dailyActivity.map(d => ({
    label: d.date,
    values: [
      { name: 'Produtivo', value: d.productive, color: colors.success },
      { name: 'Neutro', value: d.neutral, color: colors.primary },
      { name: 'Improdutivo', value: d.unproductive, color: colors.danger }
    ]
  }));
  
  drawAreaChart(doc, activityData, margin, yPos, pageWidth - margin * 2, 70);
  
  // Legenda
  yPos += 80;
  doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
  doc.rect(margin, yPos, 8, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Tempo Produtivo', margin + 12, yPos + 6);
  
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin + 60, yPos, 8, 8, 'F');
  doc.text('Tempo Neutro', margin + 72, yPos + 6);
  
  doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
  doc.rect(margin + 120, yPos, 8, 8, 'F');
  doc.text('Tempo Improdutivo', margin + 132, yPos + 6);
  
  yPos += 25;
  
  // Tabela de Atividade Diária
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento de Atividade Diária', margin, yPos);
  
  yPos += 8;
  
  const activityTableData = reportData.dailyActivity.map(d => [
    d.date,
    `${d.productive}%`,
    `${d.neutral}%`,
    `${d.unproductive}%`,
    `${d.productive + d.neutral + d.unproductive}%`
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Dia', 'Produtivo', 'Neutro', 'Improdutivo', 'Total']],
    body: activityTableData,
    theme: 'striped',
    headStyles: { 
      fillColor: colors.primary,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: colors.light },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 35, halign: 'center' }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 20;
  
  // Box de Insights
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  drawRoundedRect(doc, margin, yPos, pageWidth - margin * 2, 50, 4, 'F');
  
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(margin, yPos, 4, 50, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  doc.text('Insights do Período', margin + 12, yPos + 12);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  
  const avgProductivity = reportData.dailyActivity.reduce((sum, d) => sum + d.productive, 0) / reportData.dailyActivity.length;
  const bestDay = reportData.dailyActivity.reduce((best, d) => d.productive > best.productive ? d : best);
  const worstDay = reportData.dailyActivity.reduce((worst, d) => d.productive < worst.productive ? d : worst);
  
  doc.text(`• Média de produtividade no período: ${avgProductivity.toFixed(1)}%`, margin + 12, yPos + 24);
  doc.text(`• Melhor dia: ${bestDay.date} com ${bestDay.productive}% de tempo produtivo`, margin + 12, yPos + 34);
  doc.text(`• Dia que requer atenção: ${worstDay.date} com ${worstDay.productive}% de tempo produtivo`, margin + 12, yPos + 44);
  
  // ==================== FOOTER EM TODAS AS PÁGINAS ====================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Linha separadora
    doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Texto do footer
    doc.setFontSize(8);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(
      `SecureWatch - Relatório Confidencial`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }
  
  // Salvar o PDF
  const fileName = `relatorio-securewatch-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
};
