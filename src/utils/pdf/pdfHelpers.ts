import jsPDF from "jspdf";

export type RGB = [number, number, number];

export const colors: Record<string, RGB> = {
  primary: [59, 130, 246],
  success: [34, 197, 94],
  warning: [251, 146, 60],
  danger: [239, 68, 68],
  dark: [30, 41, 59],
  muted: [100, 116, 139],
  light: [241, 245, 249],
  white: [255, 255, 255],
};

export const chartColors: RGB[] = [
  [59, 130, 246],
  [34, 197, 94],
  [251, 146, 60],
  [239, 68, 68],
  [168, 85, 247],
  [236, 72, 153],
  [20, 184, 166],
];

export const drawRoundedRect = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  style: "F" | "S" | "FD" = "F"
) => {
  doc.roundedRect(x, y, w, h, r, r, style);
};

export const drawMetricCard = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB
) => {
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  drawRoundedRect(doc, x, y, width, height, 3, "F");
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(x, y + 3, 3, height - 6, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(value, x + 10, y + height / 2 - 2);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text(label, x + 10, y + height / 2 + 8);
};

export const drawHorizontalBarChart = (
  doc: jsPDF,
  data: { label: string; value: number; color: RGB }[],
  x: number,
  y: number,
  width: number,
  barHeight = 12,
  gap = 8
) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  data.forEach((item, index) => {
    const yPos = y + index * (barHeight + gap);
    const barWidth = (item.value / maxValue) * (width - 60);
    doc.setFontSize(9);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(item.label, x, yPos + barHeight / 2 + 2);
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    drawRoundedRect(doc, x + 60, yPos, width - 60, barHeight, 2, "F");
    if (barWidth > 4) {
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      drawRoundedRect(doc, x + 60, yPos, barWidth, barHeight, 2, "F");
    }
    doc.setFontSize(8);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(String(item.value), x + 60 + barWidth + 4, yPos + barHeight / 2 + 2);
  });
  return y + data.length * (barHeight + gap);
};

export const drawPieChart = (
  doc: jsPDF,
  data: { label: string; value: number; color: RGB }[],
  centerX: number,
  centerY: number,
  radius: number
) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -Math.PI / 2;
  data.forEach((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    const steps = Math.max(20, Math.floor(sliceAngle * 20));
    const points: [number, number][] = [[centerX, centerY]];
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + (sliceAngle * i) / steps;
      points.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)]);
    }
    for (let i = 1; i < points.length - 1; i++) {
      doc.triangle(
        centerX,
        centerY,
        points[i][0],
        points[i][1],
        points[i + 1][0],
        points[i + 1][1],
        "F"
      );
    }
    startAngle = endAngle;
  });
  doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
  doc.circle(centerX, centerY, radius * 0.5, "F");
};

export const drawLegend = (
  doc: jsPDF,
  data: { label: string; value: number; color: RGB }[],
  x: number,
  y: number,
  columns = 1
) => {
  const itemsPerColumn = Math.ceil(data.length / columns);
  const columnWidth = 80;
  data.forEach((item, index) => {
    const column = Math.floor(index / itemsPerColumn);
    const row = index % itemsPerColumn;
    const xPos = x + column * columnWidth;
    const yPos = y + row * 12;
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(xPos, yPos, 6, 6, "F");
    doc.setFontSize(8);
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.text(`${item.label} (${item.value})`, xPos + 10, yPos + 5);
  });
  return y + Math.ceil(data.length / columns) * 12;
};

export const drawAreaChart = (
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
  doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.rect(x + padding, y, chartWidth, chartHeight, "F");
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  for (let i = 0; i <= 4; i++) {
    const lineY = y + (chartHeight * i) / 4;
    doc.line(x + padding, lineY, x + padding + chartWidth, lineY);
    doc.setFontSize(7);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text(String(100 - i * 25) + "%", x + 5, lineY + 2);
  }
  const seriesNames = data[0]?.values.map((v) => v.name) || [];
  seriesNames.forEach((seriesName, seriesIndex) => {
    const points: [number, number][] = [];
    const defaultColor = chartColors[seriesIndex] || chartColors[0];
    const colorItem = data[0]?.values.find((v) => v.name === seriesName);
    const color: RGB = colorItem?.color || defaultColor;
    data.forEach((item, index) => {
      const xPos = x + padding + (index * chartWidth) / (data.length - 1 || 1);
      const valueItem = item.values.find((v) => v.name === seriesName);
      const value = valueItem?.value || 0;
      const yPos = y + chartHeight - (value / maxValue) * chartHeight;
      points.push([xPos, yPos]);
    });
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1.5);
    for (let i = 0; i < points.length - 1; i++)
      doc.line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1]);
    doc.setFillColor(color[0], color[1], color[2]);
    points.forEach((point) => doc.circle(point[0], point[1], 2, "F"));
  });
  doc.setFontSize(7);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  data.forEach((item, index) => {
    const xPos = x + padding + (index * chartWidth) / (data.length - 1 || 1);
    doc.text(item.label, xPos - 5, y + chartHeight + 10);
  });
};
