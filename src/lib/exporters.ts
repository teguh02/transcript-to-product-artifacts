import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { GenerationResult } from "@/types/artifacts";
import { buildExportDocument, type ExportDocumentData, type ExportRow, type ExportTable } from "./export-document";

export type ExportFormat = "json" | "docx" | "pdf";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function sectionDivider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: {
      bottom: {
        color: "D5E2EA",
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 120 },
  });
}

function subHeading(title: string) {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 160, after: 120 },
  });
}

function bodyParagraph(text: string) {
  return new Paragraph({
    children: [new TextRun(text)],
    spacing: { after: 120 },
  });
}

function bulletParagraph(text: string) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function buildDocxTable(table: ExportTable) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: table.headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: header, bold: true })],
                }),
              ],
              shading: { fill: "EAF8FC" },
            }),
        ),
      }),
      ...table.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ text: cell || "-" })],
                }),
            ),
          }),
      ),
    ],
  });
}

function buildKeyValueTable(title: string, rows: ExportRow[]) {
  return [
    subHeading(title),
    buildDocxTable({
      title,
      headers: ["Item", "Value"],
      rows: rows.map((row) => [row.label, row.value]),
    }),
  ];
}

export async function exportAsJson(result: GenerationResult) {
  const documentData = buildExportDocument(result);
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${documentData.fileBaseName}.json`);
}

export async function exportAsDocx(result: GenerationResult) {
  const documentData = buildExportDocument(result);

  const children = [
    new Paragraph({
      text: documentData.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: documentData.subtitle,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: `Generated on ${documentData.generatedOn}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    sectionDivider(),
    sectionHeading("Executive Summary"),
    bodyParagraph(documentData.executiveSummary),
    ...buildKeyValueTable("Document Metadata", documentData.metadataRows),
    sectionDivider(),
    sectionHeading("Product Requirements Document"),
    ...buildKeyValueTable("Core Overview", documentData.overviewRows),
    subHeading("Goals"),
    ...documentData.goals.map(bulletParagraph),
    subHeading(documentData.personas.title),
    buildDocxTable(documentData.personas),
    subHeading(documentData.userJourney.title),
    buildDocxTable(documentData.userJourney),
    subHeading(documentData.features.title),
    buildDocxTable(documentData.features),
    sectionDivider(),
    sectionHeading("User Stories"),
    buildDocxTable(documentData.userStories),
    sectionDivider(),
    sectionHeading("Functional Requirements"),
    buildDocxTable(documentData.functionalRequirements),
    sectionDivider(),
    sectionHeading("UI/UX Design Summary"),
    subHeading(documentData.sitemap.title),
    buildDocxTable(documentData.sitemap),
    subHeading(documentData.screenList.title),
    buildDocxTable(documentData.screenList),
    subHeading(documentData.userFlow.title),
    buildDocxTable(documentData.userFlow),
    subHeading("Wireframe Summary"),
    ...documentData.wireframeSummaries.flatMap((wireframe) => [
      new Paragraph({
        text: wireframe.title,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 100 },
      }),
      buildDocxTable({
        title: wireframe.title,
        headers: ["Item", "Value"],
        rows: wireframe.rows.map((row) => [row.label, row.value]),
      }),
      new Paragraph({ text: "Key Sections", spacing: { before: 120, after: 60 } }),
      ...wireframe.sections.map(bulletParagraph),
      new Paragraph({ text: "Interaction Notes", spacing: { before: 80, after: 60 } }),
      ...(wireframe.notes.length > 0 ? wireframe.notes.map(bulletParagraph) : [bulletParagraph("No additional notes provided.")]),
    ]),
    sectionDivider(),
    sectionHeading("Validation Notes"),
    ...buildKeyValueTable("Validation Summary", documentData.validationRows),
    subHeading("Issues"),
    ...(documentData.validationIssues.length > 0
      ? documentData.validationIssues.map(bulletParagraph)
      : [bulletParagraph("No major issues were detected.")]),
    subHeading("Fix Suggestions"),
    ...(documentData.fixSuggestions.length > 0
      ? documentData.fixSuggestions.map(bulletParagraph)
      : [bulletParagraph("No additional fix suggestions were required.")]),
    sectionDivider(),
    sectionHeading("Assumptions"),
    ...(documentData.assumptions.length > 0
      ? documentData.assumptions.map(bulletParagraph)
      : [bulletParagraph("No explicit assumptions were required.")]),
  ];

  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  downloadBlob(blob, `${documentData.fileBaseName}.docx`);
}

function addPdfSectionTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 40, y);
  doc.setDrawColor(210, 225, 235);
  doc.line(40, y + 8, 555, y + 8);
}

function addPdfParagraph(doc: jsPDF, text: string, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const lines = doc.splitTextToSize(text, 515);
  doc.text(lines, 40, y);
  return y + lines.length * 14;
}

function addPdfBulletList(doc: jsPDF, items: string[], y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  let cursor = y;

  for (const item of items) {
    const lines = doc.splitTextToSize(item, 495);
    doc.text(`• ${lines[0]}`, 48, cursor);

    for (let index = 1; index < lines.length; index += 1) {
      cursor += 14;
      doc.text(lines[index], 58, cursor);
    }

    cursor += 16;
  }

  return cursor;
}

function addPdfTable(doc: jsPDF, table: ExportTable, startY: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(table.title, 40, startY);

  autoTable(doc, {
    startY: startY + 10,
    head: [table.headers],
    body: table.rows.length > 0 ? table.rows : [["-", "-", "-", "-", "-"]].map((row) => row.slice(0, table.headers.length)),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      lineColor: [217, 226, 232],
      lineWidth: 0.5,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [234, 248, 252],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    margin: { left: 40, right: 40 },
  });

  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? startY + 40;
}

export async function exportAsPdf(result: GenerationResult) {
  const documentData = buildExportDocument(result);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(documentData.title, 40, y);
  y += 26;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(documentData.subtitle, 40, y);
  y += 18;
  doc.setFontSize(10);
  doc.text(`Generated on ${documentData.generatedOn}`, 40, y);
  y += 24;
  doc.setDrawColor(210, 225, 235);
  doc.line(40, y, 555, y);
  y += 24;

  addPdfSectionTitle(doc, "Executive Summary", y);
  y = addPdfParagraph(doc, documentData.executiveSummary, y + 24) + 10;
  y = addPdfTable(
    doc,
    {
      title: "Document Metadata",
      headers: ["Item", "Value"],
      rows: documentData.metadataRows.map((row) => [row.label, row.value]),
    },
    y,
  ) + 22;

  addPdfSectionTitle(doc, "Product Requirements Document", y);
  y = addPdfTable(
    doc,
    {
      title: "Core Overview",
      headers: ["Item", "Value"],
      rows: documentData.overviewRows.map((row) => [row.label, row.value]),
    },
    y + 18,
  ) + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Goals", 40, y);
  y = addPdfBulletList(doc, documentData.goals, y + 18) + 6;
  y = addPdfTable(doc, documentData.personas, y) + 18;
  y = addPdfTable(doc, documentData.userJourney, y) + 18;
  y = addPdfTable(doc, documentData.features, y) + 22;
  y = addPdfTable(doc, documentData.userStories, y) + 22;
  y = addPdfTable(doc, documentData.functionalRequirements, y) + 22;

  addPdfSectionTitle(doc, "UI/UX Design Summary", y);
  y = addPdfTable(doc, documentData.sitemap, y + 18) + 18;
  y = addPdfTable(doc, documentData.screenList, y) + 18;
  y = addPdfTable(doc, documentData.userFlow, y) + 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Wireframe Summary", 40, y);
  y += 20;

  for (const wireframe of documentData.wireframeSummaries) {
    y = addPdfTable(
      doc,
      {
        title: wireframe.title,
        headers: ["Item", "Value"],
        rows: wireframe.rows.map((row) => [row.label, row.value]),
      },
      y,
    ) + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Key Sections", 40, y);
    y = addPdfBulletList(doc, wireframe.sections, y + 16) + 4;

    doc.text("Interaction Notes", 40, y);
    y = addPdfBulletList(doc, wireframe.notes.length > 0 ? wireframe.notes : ["No additional notes provided."], y + 16) + 8;
  }

  addPdfSectionTitle(doc, "Validation Notes", y);
  y = addPdfTable(
    doc,
    {
      title: "Validation Summary",
      headers: ["Item", "Value"],
      rows: documentData.validationRows.map((row) => [row.label, row.value]),
    },
    y + 18,
  ) + 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Issues", 40, y);
  y = addPdfBulletList(doc, documentData.validationIssues.length > 0 ? documentData.validationIssues : ["No major issues were detected."], y + 16) + 6;
  doc.text("Fix Suggestions", 40, y);
  y = addPdfBulletList(doc, documentData.fixSuggestions.length > 0 ? documentData.fixSuggestions : ["No additional fix suggestions were required."], y + 16) + 6;

  addPdfSectionTitle(doc, "Assumptions", y);
  addPdfBulletList(doc, documentData.assumptions.length > 0 ? documentData.assumptions : ["No explicit assumptions were required."], y + 18);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${page} of ${pageCount}`, 555, 810, { align: "right" });
  }

  doc.save(`${documentData.fileBaseName}.pdf`);
}
