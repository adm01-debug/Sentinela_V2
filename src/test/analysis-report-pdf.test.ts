import { describe, it, expect, vi } from "vitest";
import { analysisReportPdf } from "@/utils/analysisReportPdf";

vi.mock("jspdf", () => {
  const save = vi.fn();
  const chain = () => ({
    setFillColor: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    rect: vi.fn(),
    roundedRect: vi.fn(),
    line: vi.fn(),
    circle: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    splitTextToSize: vi.fn((t: string) => [t]),
    addPage: vi.fn(),
    setPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    save,
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  });
  class FakeDoc {
    constructor() {
      return chain();
    }
  }
  return { default: FakeDoc };
});

vi.mock("jspdf-autotable", () => ({
  default: vi.fn((doc: { lastAutoTable?: { finalY: number } }) => {
    doc.lastAutoTable = { finalY: 120 };
  }),
}));

describe("analysisReportPdf", () => {
  it("gera o PDF com os dados do relatorio sem lancar", () => {
    const doc = analysisReportPdf({
      id: "abc-123",
      report_type: "produtividade",
      summary: "<p>Resumo <b>teste</b></p>",
      employee_name: "Joao",
      risk_score: 42,
      analysis_period_start: "2026-01-01T00:00:00Z",
      analysis_period_end: "2026-01-31T00:00:00Z",
      created_at: "2026-02-01T10:00:00Z",
      insights: ["insight um", "insight dois"],
      recommendations: [{ text: "recomendacao um" }],
    });
    expect(doc).toBeTruthy();
  });

  it("lida com relatorio sem summary, insights nem recommendations", () => {
    const doc = analysisReportPdf({
      id: "x",
      summary: null,
      insights: null,
      recommendations: null,
      risk_score: null,
    });
    expect(doc).toBeTruthy();
  });

  it("nao quebra quando as datas sao invalidas", () => {
    const doc = analysisReportPdf({
      id: "y",
      analysis_period_start: "nao-e-data",
      analysis_period_end: undefined,
    });
    expect(doc).toBeTruthy();
  });
});
