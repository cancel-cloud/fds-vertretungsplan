import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  ensureArtifactToolWorkspace,
  importArtifactTool,
  padSlideNumber,
  saveBlobToFile,
} from "/Users/cancelcloud/.codex/plugins/cache/openai-primary-runtime/presentations/26.521.10419/skills/presentations/scripts/artifact_tool_utils.mjs";

const workspaceDir = "/Users/cancelcloud/Developer/personal/fds-vertretungsplan/outputs/manual-20260531-bll/presentations/bll-fds-vertretungsplan";
const starterPptxPath = path.join(workspaceDir, "template-starter.pptx");
const outputDir = "/Users/cancelcloud/Downloads";
const finalPptxPath = path.join(outputDir, "BLL_Vertretungsplan_final.pptx");
const previewDir = path.join(workspaceDir, "preview", "final");
const layoutDir = path.join(workspaceDir, "layout", "final");
const contactSheetPath = path.join(workspaceDir, "final-contact-sheet.png");

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
    throw new Error(`Could not find text on slide ${slide.index + 1}: ${JSON.stringify(from)}`);
  }
  shape.text.set(to);
}

function replaceAll(slide, from, to) {
  let count = 0;
  for (const shape of textShapes(slide)) {
    if (shape.text.toString() === from) {
      shape.text.set(to);
      count += 1;
    }
  }
  return count;
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

function setFooter(slide) {
  replaceAll(slide, "BLL Vertretungsplan  ·  Lukas Dienst  ·  Abitur 2026", "BLL Vertretungsplan  ·  Lukas Dienst  ·  Abitur 2026");
}

async function renderFinal(presentation, slides) {
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });
  const previewPaths = [];
  const layoutPaths = [];

  for (let index = 0; index < slides.length; index += 1) {
    const padded = padSlideNumber(index + 1);
    const previewPath = path.join(previewDir, `final-slide-${padded}.png`);
    const layoutPath = path.join(layoutDir, `final-slide-${padded}.layout.json`);

    const png = await presentation.export({ slide: slides[index], format: "png", scale: 1 });
    await saveBlobToFile(png, previewPath);
    previewPaths.push(previewPath);

    const layout = await presentation.export({ slide: slides[index], format: "layout" });
    await saveBlobToFile(layout, layoutPath);
    layoutPaths.push(layoutPath);
  }

  const python = process.env.PYTHON || "python3";
  const contactScript = "/Users/cancelcloud/.codex/plugins/cache/openai-primary-runtime/presentations/26.521.10419/skills/presentations/scripts/make_contact_sheet.py";
  const result = spawnSync(python, [contactScript, "--output", contactSheetPath, ...previewPaths], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n"));
  }

  await fs.writeFile(
    path.join(workspaceDir, "final-render-manifest.json"),
    JSON.stringify({ finalPptxPath, previewPaths, layoutPaths, contactSheetPath }, null, 2) + "\n",
    "utf8"
  );
}

await ensureArtifactToolWorkspace(workspaceDir);
const { FileBlob, PresentationFile } = await importArtifactTool(workspaceDir);
const presentation = await PresentationFile.importPptx(await FileBlob.load(starterPptxPath));
const slides = slidesFromPresentation(presentation);

// Slide 1: title
replaceFirst(slides[0], "Moderne Webentwicklung am Beispiel\neiner alternativen Vertretungsplan-\nAnwendung", "FDS Vertretungsplan:\nvom allgemeinen Plan zur\npersönlichen Web-App");
replaceFirst(slides[0], "Lukas Dienst\nPeter-Paul-Cahensly  ·  Abitur 2026", "Lukas Dienst\nFriedrich-Dessauer-Schule Limburg  ·  Abitur 2026");

// Slide 2: BLL frame
replaceFirst(slides[1], "KAPITEL 2  ·  ZIELSETZUNG", "KAPITEL 0  ·  BLL-RAHMEN");
replaceFirst(slides[1], "SMART-Ziele und Status zum Abgabezeitpunkt", "Was die besondere Lernleistung zeigen muss");
replaceFirst(slides[1], "S1", "1");
replaceFirst(slides[1], "Schneller Zugriff", "Selbst konzipiert");
replaceFirst(slides[1], "Vertretungen in max. 3 Klicks", "Problem aus dem Schulalltag eigenständig entwickelt");
replaceFirst(slides[1], "erfüllt", "Projektidee");
replaceFirst(slides[1], "S2", "2");
replaceFirst(slides[1], "Filter & Suche", "Fachlich umgesetzt");
replaceFirst(slides[1], "Kategorien + Volltextsuche stabil", "Web-App mit API, Auth, Datenbank und Push-Logik");
replaceFirst(slides[1], "erfüllt", "Produkt");
replaceFirst(slides[1], "S3", "3");
replaceFirst(slides[1], "API-Robustheit", "Reflektiert");
replaceFirst(slides[1], "Rate-Limit, Retry, Fehlerpfade", "V1/V2 ausgewertet, Neustart als V3 begründet");
replaceFirst(slides[1], "erfüllt", "Prozess");
replaceFirst(slides[1], "S4", "4");
replaceFirst(slides[1], "Sicherheit", "Dokumentiert");
replaceFirst(slides[1], "CSP, Auth, geschützte Bereiche", "PDF, Diagramme, Quellen und Testnachweise");
replaceFirst(slides[1], "erfüllt", "Nachweis");
replaceFirst(slides[1], "S5", "5");
replaceFirst(slides[1], "Wartbarkeit", "Kolloquium");
replaceFirst(slides[1], "Tests + dokumentierte Struktur", "Ergebnisse erläutern und Entscheidungen verteidigen");
replaceFirst(slides[1], "weitgehend", "heute");
replaceFirst(slides[1], "S1–S4 vollständig erreicht. S5 ist weitgehend erfüllt, einzelne UI-Randfälle bleiben als Ausbaupotenzial.", "BLL-Fokus: nicht nur das fertige Produkt zeigen, sondern Entscheidungen, Hürden und Lerngewinn nachvollziehbar machen.");

// Slide 7: tool choice, based on the three-card iteration layout.
replaceFirst(slides[6], "KAPITEL 2  ·  VORGEHEN", "KAPITEL 2  ·  TOOLWAHL");
replaceFirst(slides[6], "Drei Versionen: Iteration statt Wasserfall", "Warum dieser Stack zum Projekt passt");
replaceFirst(slides[6], "V1", "01");
replaceFirst(slides[6], "Statische Seite", "Next.js");
replaceFirst(slides[6], "Browser ruft WebUntis direkt auf.\nKeine Filter, keine Personalisierung.", "UI und API-Routen in einem Projekt.\nApp Router trennt Server- und Client-Logik.");
replaceFirst(slides[6], "Erkenntnis: ohne Backend nicht erweiterbar.", "Passt, weil Datenbeschaffung nicht direkt im Browser liegen sollte.");
replaceFirst(slides[6], "V2", "02");
replaceFirst(slides[6], "Next.js-Frontend", "React + TypeScript");
replaceFirst(slides[6], "Routing, aber ohne saubere API-Schicht\nund ohne Login.", "Komponenten, Hooks und Typen machen Zustände nachvollziehbar.");
replaceFirst(slides[6], "Erkenntnis: Trennung der Aufgaben fehlt.", "Passt, weil Matching, Filter und UI viele Datenformen verbinden.");
replaceFirst(slides[6], "V3", "03");
replaceFirst(slides[6], "Vollständiger Neustart", "Prisma + PostgreSQL");
replaceFirst(slides[6], "Vier-Schichten-Architektur, Auth, DB,\nAPI-Proxy, Push-Logik.", "Relationale Daten, Constraints und klare Migrationen für Nutzerzustände.");
replaceFirst(slides[6], "Aktuelle, in dieser BLL dokumentierte Version.", "QStash + Web Push ergänzen den Hintergrundprozess.");
replaceFirst(slides[6], "Frühe Versionen waren nicht überflüssig – sie haben Anforderungen sichtbar gemacht.", "Werkzeuge wurden nach Projektanforderung gewählt: Web-Zugriff, Typsicherheit, relationale Daten und geplanter Dispatch.");

// Slide 11: SQL relation explanation, based on the data-model layout.
replaceFirst(slides[10], "KAPITEL 3  ·  DATENMODELL", "KAPITEL 3  ·  SQL-GRUNDLAGEN");
replaceFirst(slides[10], "Was wird gespeichert – und was bewusst nicht", "SQL: Tabellen, Zeilen und Beziehungen");
replaceFirst(slides[10], "Nutzer", "Tabelle User");
replaceFirst(slides[10], "E-Mail, Rolle,\nEinstellungen", "eine Zeile pro Account\nid als Primärschlüssel");
replaceFirst(slides[10], "Stundenplan-Eintrag", "Tabelle TimetableEntry");
replaceFirst(slides[10], "Wochentag, Stunde, Fach, Lehrer, Raum, Wochenmodus", "userId verbindet Eintrag mit User\nFach, Lehrer, Raum, Woche");
replaceFirst(slides[10], "Push-Gerät", "Fremdschlüssel");
replaceFirst(slides[10], "Endpoint, Auth-Keys, User-Agent", "Relation statt Textkopie\nCascade beim Löschen");
replaceFirst(slides[10], "Benachrichtigungs-Zustand", "Constraint");
replaceFirst(slides[10], "letzter Fingerprint pro Tag (1 Zeile)", "unique(userId, targetDate)\nverhindert doppelte Zustände");
replaceFirst(slides[10], "Benachrichtigungs-Abdruck", "Index");
replaceFirst(slides[10], "Audit-Log aller gesendeten Pushs", "schneller Zugriff auf Verlauf\nund letzte Meldungen");
replaceFirst(slides[10], "Lehrer-Verzeichnis", "TeacherDirectory");
replaceFirst(slides[10], "Kürzel → voller Name", "Kürzel als eindeutiger Schlüssel");
replaceFirst(slides[10], "App-Einstellungen", "AppSettings");
replaceFirst(slides[10], "erlaubte E-Mail-Domains", "globale Konfiguration\nund Demo-Daten");
replaceFirst(slides[10], "Vertretungen werden NICHT persistiert", "SQL speichert Zustände – nicht Rohdaten");
replaceFirst(slides[10], "+\nweniger Datenhaltung\n \n−\nweniger Historie für Debugging", "SELECT\nliest Daten\n \nINSERT/UPDATE\nändert Zustand");
replaceFirst(slides[10], "Persistente Tabellen: Nutzer, Stundenplan, Push-Geräte, Benachrichtigungs-Zustand. Vertretungen kommen jedes Mal frisch aus WebUntis (mit Cache).", "Prisma erzeugt SQL aus dem Schema; verstehen muss man trotzdem Primärschlüssel, Fremdschlüssel, Unique Constraints und Indizes.");

// Slide 12: SQL query explanation, based on the matching/pseudocode layout.
replaceFirst(slides[11], "KAPITEL 3  ·  KERNLOGIK", "KAPITEL 3  ·  SQL IM PROJEKT");
replaceFirst(slides[11], "Matching: Ist diese Vertretung für mich relevant?", "Von der Datenbank zum persönlichen Stundenplan");
replaceFirst(slides[11], "Vier Prüfschritte pro Vertretung", "Vier SQL-Ideen hinter der Anwendung");
replaceFirst(slides[11], "Wochentag", "User finden");
replaceFirst(slides[11], "Datum der Vertretung → Wochentag des Stundenplan-Eintrags", "Session liefert userId; alle Daten werden daran gebunden");
replaceFirst(slides[11], "Wochenmodus", "Stundenplan laden");
replaceFirst(slides[11], "Jede Woche / gerade / ungerade – passt zur Kalenderwoche?", "WHERE userId = ... filtert nur eigene Einträge");
replaceFirst(slides[11], "Stunden überlappen sich", "Relationen nutzen");
replaceFirst(slides[11], "Stundenblock der Vertretung schneidet den eigenen Stundenblock?", "TeacherDirectory kann per teacherId verknüpft werden");
replaceFirst(slides[11], "Fach, Lehrer oder Raum", "Delta speichern");
replaceFirst(slides[11], "Mindestens eines stimmt ausreichend überein", "NotificationState verhindert doppelte Pushs");
replaceFirst(slides[11], "Pseudocode", "SQL-Idee");
replaceFirst(slides[11], "function istRelevant(v, e):\n  // v = Vertretung,  e = Stundenplan-Eintrag\n \n  if v.wochentag != e.wochentag:\n      return false\n  if not wochenmodusPasst(v, e):\n      return false\n  if not stundenUeberlappen(v, e):\n      return false\n \n  return fachLehrerRaumPasst(v, e)", "SELECT t.*\nFROM \"TimetableEntry\" t\nJOIN \"User\" u ON u.id = t.\"userId\"\nWHERE t.\"userId\" = :userId\n  AND t.\"weekday\" = :weekday\n  AND t.\"startPeriod\" <= :periodEnd;\n\n-- Prisma formuliert solche Abfragen typsicher\n-- auf Basis von schema.prisma.");
replaceFirst(slides[11], "Diese Funktion läuft auch im Hintergrund-Dispatch – sie entscheidet, ob jemand überhaupt eine Push-Benachrichtigung bekommt.", "SQL liefert den persönlichen Zustand; die App-Logik kombiniert ihn anschließend mit den aktuellen WebUntis-Daten.");

for (let index = 0; index < slides.length; index += 1) {
  setFooter(slides[index]);
  setPageNumber(slides[index], index + 1);
}

await fs.mkdir(outputDir, { recursive: true });
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(finalPptxPath);
await renderFinal(presentation, slides);

console.log(JSON.stringify({ finalPptxPath, previewDir, layoutDir, contactSheetPath }, null, 2));
