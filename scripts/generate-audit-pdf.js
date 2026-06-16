import { jsPDF } from "jspdf";
import "jspdf-autotable";
import fs from "fs";

async function generateAuditPDF() {
  const content = fs.readFileSync("audit_report.md", "utf8");
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text("SENTINELA - AUDITORIA ENTERPRISE", 105, 20, { align: "center" });

  doc.setFontSize(12);
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 15, 40);

  doc.save("audit_report.pdf");
  console.log("PDF de auditoria gerado com sucesso!");
}

generateAuditPDF();
