import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  ensureArtifactToolWorkspace,
  importArtifactTool,
  saveBlobToFile,
} from "/Users/cancelcloud/.codex/plugins/cache/openai-primary-runtime/presentations/26.521.10419/skills/presentations/scripts/artifact_tool_utils.mjs";

const workspaceDir =
  "/Users/cancelcloud/Developer/personal/fds-vertretungsplan/outputs/manual-20260531-fingerprint-slide/presentations/fingerprint-slide";
const sourcePptxPath = "/Users/cancelcloud/Downloads/BLL_Vertretungsplan_v2.pptx";
const finalPptxPath = "/Users/cancelcloud/Downloads/BLL_Fingerprint_Folie.pptx";
const previewPath = path.join(workspaceDir, "fingerprint-slide-preview.png");
const layoutPath = path.join(workspaceDir, "fingerprint-slide-layout.json");

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
  if (!shape) {
    throw new Error(`Could not find text: ${JSON.stringify(from)}`);
  }
  shape.text.set(to);
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

await ensureArtifactToolWorkspace(workspaceDir);
const { FileBlob, PresentationFile } = await importArtifactTool(workspaceDir);
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePptxPath));
const sourceSlides = slidesFromPresentation(presentation);

const sourcePushSlide = sourceSlides[9];
const slide = sourcePushSlide.duplicate();
for (const original of sourceSlides) {
  original.delete();
}
slide.moveTo(0);

replaceFirst(slide, "KAPITEL 3  ·  HINTERGRUNDPROZESS", "KAPITEL 3  ·  FINGERPRINT");
replaceFirst(slide, "Push: nur bei tatsächlicher Änderung", "Wie der Fingerprint berechnet wird");

replaceFirst(slide, "Aktuelle\nVertretungen holen", "Relevante\nMatches finden");
replaceFirst(slide, "Matching mit\nStundenplan", "Schlüssel\nnormalisieren");
replaceFirst(slide, "Fingerprint\nberechnen", "SHA-256\nHash bilden");
replaceFirst(slide, "Vergleich mit\nletztem Stand", "Delta-Aktion\nentscheiden");

replaceFirst(slide, "Drei mögliche Aktionen pro Nutzer", "Vom Match zur stabilen Vergleichszahl");

replaceFirst(slide, "SEND", "1  CANONICAL KEYS");
replaceFirst(slide, "Fingerprint geändert / neu", "Eine Vertretung wird als Textschlüssel abgelegt");
replaceFirst(
  slide,
  "Push senden +\nneuen Stand speichern",
  "GRP|STD|FACH|LEHRER|TYP|RAUM\ntrim + UPPERCASE\nDuplikate entfernen, sortieren"
);

replaceFirst(slide, "SKIP", "2  HASH-INPUT");
replaceFirst(slide, "Fingerprint identisch", "Nutzer, Datum und Schlüssel werden verbunden");
replaceFirst(
  slide,
  "Nichts tun –\nNutzer nicht erneut nerven",
  "userId:targetDate:key1||key2\nReihenfolge der WebUntis-Liste wird dadurch egal"
);

replaceFirst(slide, "RESOLVE", "3  DELTA-LOGIK");
replaceFirst(slide, "Keine Treffer mehr", "Vergleich mit gespeichertem Fingerprint");
replaceFirst(
  slide,
  "Alten Zustand löschen –\nVertretung wurde aufgelöst",
  "gleich = SKIP, anders = SEND,\nkeine Treffer mehr = CLEAR"
);

replaceFirst(
  slide,
  "Externer Scheduler (Upstash QStash) ruft den Dispatch alle 15 Minuten auf – Mo–Fr während der Schulzeit.",
  "Der Hash ist kein Zufall: Gleiche relevante Daten ergeben denselben Fingerprint; jede relevante Änderung erzeugt einen anderen Wert."
);
setPageNumber(slide, 1);

await fs.mkdir(path.dirname(finalPptxPath), { recursive: true });
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(finalPptxPath);

await fs.mkdir(workspaceDir, { recursive: true });
await saveBlobToFile(await presentation.export({ slide, format: "png", scale: 1 }), previewPath);
await saveBlobToFile(await presentation.export({ slide, format: "layout" }), layoutPath);

const python = process.env.PYTHON || "python3";
const contactScript =
  "/Users/cancelcloud/.codex/plugins/cache/openai-primary-runtime/presentations/26.521.10419/skills/presentations/scripts/make_contact_sheet.py";
spawnSync(python, [contactScript, "--output", path.join(workspaceDir, "contact-sheet.png"), previewPath], {
  encoding: "utf8",
});

console.log(JSON.stringify({ finalPptxPath, previewPath, layoutPath }, null, 2));
