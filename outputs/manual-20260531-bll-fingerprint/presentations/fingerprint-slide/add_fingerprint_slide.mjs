import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  createSlideContext,
  ensureArtifactToolWorkspace,
  importArtifactTool,
  padSlideNumber,
  saveBlobToFile,
} from "/Users/cancelcloud/.codex/plugins/cache/openai-primary-runtime/presentations/26.521.10419/skills/presentations/scripts/artifact_tool_utils.mjs";

const workspaceDir = "/Users/cancelcloud/Developer/personal/fds-vertretungsplan/outputs/manual-20260531-bll-fingerprint/presentations/fingerprint-slide";
const sourcePptxPath = "/Users/cancelcloud/Downloads/BLL_Vertretungsplan_final_claude.pptx";
const finalPptxPath = "/Users/cancelcloud/Downloads/BLL_Vertretungsplan_final_claude_fingerprint.pptx";
const previewDir = path.join(workspaceDir, "preview", "final");
const layoutDir = path.join(workspaceDir, "layout", "final");
const contactSheetPath = path.join(workspaceDir, "fingerprint-contact-sheet.png");

function slidesFromPresentation(presentation) {
  if (Array.isArray(presentation.slides?.items)) return presentation.slides.items;
  return Array.from({ length: presentation.slides.count }, (_, index) => presentation.slides.getItem(index));
}

function textShapes(slide) {
  return slide.shapes.items.filter((shape) => {
    const text = shape.text?.toString?.();
    return text && text !== "[object Object]";
  });
}

function replaceFirst(slide, from, to) {
  const shape = textShapes(slide).find((candidate) => candidate.text.toString() === from);
  if (!shape) throw new Error(`Could not find text on slide ${slide.index + 1}: ${JSON.stringify(from)}`);
  shape.text.set(to);
  return shape;
}

function setPageNumber(slide, pageNumber) {
  for (const shape of textShapes(slide)) {
    const frame = shape.frame;
    if (frame?.top > 500 && /^\d+$/.test(shape.text.toString())) {
      shape.text.set(String(pageNumber));
      return;
    }
  }
}

async function renderDeck(presentation, slides) {
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });
  const previewPaths = [];
  for (let index = 0; index < slides.length; index += 1) {
    const padded = padSlideNumber(index + 1);
    const slide = slides[index];
    const previewPath = path.join(previewDir, `slide-${padded}.png`);
    const layoutPath = path.join(layoutDir, `slide-${padded}.layout.json`);
    await saveBlobToFile(await presentation.export({ slide, format: "png", scale: 1 }), previewPath);
    await saveBlobToFile(await presentation.export({ slide, format: "layout" }), layoutPath);
    previewPaths.push(previewPath);
  }

  const python = process.env.PYTHON || "python3";
  const contactScript = "/Users/cancelcloud/.codex/plugins/cache/openai-primary-runtime/presentations/26.521.10419/skills/presentations/scripts/make_contact_sheet.py";
  const result = spawnSync(python, [contactScript, "--output", contactSheetPath, ...previewPaths], { encoding: "utf8" });
  if (result.status !== 0) throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n"));

  await fs.writeFile(
    path.join(workspaceDir, "render-manifest.json"),
    JSON.stringify({ finalPptxPath, previewDir, layoutDir, contactSheetPath, slideCount: slides.length }, null, 2) + "\n",
    "utf8"
  );
}

await ensureArtifactToolWorkspace(workspaceDir);
const artifact = await importArtifactTool(workspaceDir);
const { FileBlob, PresentationFile } = artifact;
const ctx = createSlideContext(artifact, { workspaceDir });
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePptxPath));
const slides = slidesFromPresentation(presentation);

// Duplicate the existing "SQL im Projekt" layout because it already has a
// four-step explanation rail and a dark code panel that match the deck style.
const sourceLayoutSlide = slides[13]; // current slide 14
const fingerprintSlide = sourceLayoutSlide.duplicate();
fingerprintSlide.moveTo(16); // insert after current slide 16: "Push: nur bei tatsächlicher Änderung"

replaceFirst(fingerprintSlide, "KAPITEL 3  ·  SQL IM PROJEKT", "KAPITEL 3  ·  FINGERPRINT");
replaceFirst(fingerprintSlide, "Von der Datenbank zum persönlichen Stundenplan", "Wie aus Vertretungen ein stabiler Hash entsteht");
replaceFirst(fingerprintSlide, "Vier SQL-Ideen hinter der Anwendung", "Vier Schritte bis zur Push-Entscheidung");
replaceFirst(fingerprintSlide, "User finden", "Treffer normalisieren");
replaceFirst(fingerprintSlide, "Session liefert userId; alle Daten werden daran gebunden", "Gruppe, Stunde, Fach, Lehrer, Typ und Raum werden vereinheitlicht");
replaceFirst(fingerprintSlide, "Stundenplan laden", "Duplikate entfernen");
replaceFirst(fingerprintSlide, "WHERE userId = ... filtert nur eigene Einträge", "Set sammelt jeden Match-Schlüssel nur einmal");
replaceFirst(fingerprintSlide, "Relationen nutzen", "Sortieren");
replaceFirst(fingerprintSlide, "TeacherDirectory kann per teacherId verknüpft werden", "gleiche Treffer ergeben unabhängig von Reihenfolge denselben Input");
replaceFirst(fingerprintSlide, "Delta speichern", "SHA-256 Hash bilden");
replaceFirst(fingerprintSlide, "NotificationState verhindert doppelte Pushs", "Vergleich mit lastFingerprint entscheidet send / skip / clear");
replaceFirst(fingerprintSlide, "SQL-Idee", "Code-Kern");
const codeShape = replaceFirst(
  fingerprintSlide,
  "SELECT t.*\nFROM \"TimetableEntry\" t\nJOIN \"User\" u ON u.id = t.\"userId\"\nWHERE t.\"userId\" = :userId\n  AND t.\"weekday\" = :weekday\n  AND t.\"startPeriod\" <= :periodEnd;\n\n-- Prisma formuliert solche Abfragen typsicher\n-- auf Basis von schema.prisma.",
  "const keys = canonicalizeMatchKeys(matches);\n\nconst fingerprint = sha256(\n  `${userId}:${targetDate}:${keys.join('||')}`\n);\n\n// gleicher Zustand -> gleicher Hash\n// anderer Treffer -> anderer Hash"
);
codeShape.delete();
ctx.addText(fingerprintSlide, {
  left: 504,
  top: 216,
  width: 384,
  height: 170,
  text: "const keys = canonicalizeMatchKeys(matches);\n\nconst fingerprint = sha256(\n  `${userId}:${targetDate}:${keys.join('||')}`\n);",
  color: "#FFFFFF",
  fontSize: 16,
  face: "Consolas",
});
ctx.addText(fingerprintSlide, {
  left: 504,
  top: 396,
  width: 384,
  height: 54,
  text: "gleicher Zustand -> gleicher Hash\nanderer Treffer -> anderer Hash",
  color: "#FFB15C",
  fontSize: 16,
  bold: true,
});
replaceFirst(
  fingerprintSlide,
  "SQL liefert den persönlichen Zustand; die App-Logik kombiniert ihn anschließend mit den aktuellen WebUntis-Daten.",
  "Der Fingerprint speichert nicht die ganze Vertretung, sondern einen kompakten Vergleichswert fuer den relevanten Zustand."
);

const updatedSlides = slidesFromPresentation(presentation);
for (let index = 0; index < updatedSlides.length; index += 1) {
  setPageNumber(updatedSlides[index], index + 1);
}

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(finalPptxPath);
await renderDeck(presentation, updatedSlides);

console.log(JSON.stringify({ finalPptxPath, contactSheetPath, slideCount: updatedSlides.length }, null, 2));
