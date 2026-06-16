import { useCallback, useState } from "react";
import { logger } from "@/lib/logger";

export type ExportFormat = "png" | "svg" | "pdf" | "csv";

export interface UseChartExportOptions {
  filename?: string;
  backgroundColor?: string;
}

export function useChartExport(options: UseChartExportOptions = {}) {
  const { filename = "chart", backgroundColor = "#ffffff" } = options;
  const [isExporting, setIsExporting] = useState(false);

  const exportToPNG = useCallback(
    async (chartRef: HTMLElement | null, customFilename?: string) => {
      if (!chartRef) return;
      setIsExporting(true);
      try {
        const html2canvas = (await import("html2canvas" as string)).default;
        const canvas = await html2canvas(chartRef, { backgroundColor });
        const link = document.createElement("a");
        link.download = `${customFilename || filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (e) {
        logger.error("Export failed:", e);
      } finally {
        setIsExporting(false);
      }
    },
    [filename, backgroundColor]
  );

  const exportToSVG = useCallback(
    (chartRef: HTMLElement | null, customFilename?: string) => {
      if (!chartRef) return;
      const svg = chartRef.querySelector("svg");
      if (!svg) return;
      setIsExporting(true);
      try {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.download = `${customFilename || filename}.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      } finally {
        setIsExporting(false);
      }
    },
    [filename]
  );

  const exportToCSV = useCallback(
    (data: Record<string, unknown>[], customFilename?: string) => {
      if (!data.length) return;
      setIsExporting(true);
      try {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(","),
          ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const link = document.createElement("a");
        link.download = `${customFilename || filename}.csv`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      } finally {
        setIsExporting(false);
      }
    },
    [filename]
  );

  return { isExporting, exportToPNG, exportToSVG, exportToCSV };
}

export default useChartExport;
