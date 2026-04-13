from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT_PATH = (
    Path(__file__).resolve().parents[1]
    / "output"
    / "pdf"
    / "BLL_FDS_Vertretungsplan_Nachzutragende_Aenderungen.pdf"
)


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="DocTitle",
            parent=styles["Title"],
            fontName="Times-Bold",
            fontSize=20,
            leading=24,
            alignment=TA_CENTER,
            spaceAfter=8,
            textColor=colors.HexColor("#1a1a1a"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSubtitle",
            parent=styles["Normal"],
            fontName="Times-Roman",
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSection",
            parent=styles["Heading1"],
            fontName="Times-Bold",
            fontSize=15,
            leading=19,
            spaceBefore=18,
            spaceAfter=8,
            textColor=colors.HexColor("#1a1a1a"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSubsection",
            parent=styles["Heading2"],
            fontName="Times-Bold",
            fontSize=12.5,
            leading=16,
            spaceBefore=10,
            spaceAfter=4,
            textColor=colors.HexColor("#1a1a1a"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocBody",
            parent=styles["Normal"],
            fontName="Times-Roman",
            fontSize=11,
            leading=17,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocHint",
            parent=styles["Normal"],
            fontName="Times-Bold",
            fontSize=10,
            leading=14,
            alignment=TA_JUSTIFY,
            textColor=colors.HexColor("#1a1a1a"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocLabel",
            parent=styles["Normal"],
            fontName="Times-Bold",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#155724"),
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSmall",
            parent=styles["Normal"],
            fontName="Times-Italic",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#555555"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCell",
            parent=styles["Normal"],
            fontName="Times-Roman",
            fontSize=8.8,
            leading=11,
            alignment=TA_JUSTIFY,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableHeaderCell",
            parent=styles["Normal"],
            fontName="Times-Bold",
            fontSize=9,
            leading=11,
            textColor=colors.white,
        )
    )
    return styles


SECTIONS = [
    {
        "title": "1. Kapitel 2 - Informationsquellen und Anforderungen",
        "items": [
            {
                "heading": "2.7 Zentrale Anwendungsfälle",
                "mode": "insert",
                "where": (
                    "Kapitel 2, Abschnitt 2.7, als neuer Punkt 6 nach Punkt 5."
                ),
                "text": (
                    "6. Ein Gast öffnet einen geteilten Dashboard-Link mit "
                    "Datumsparameter, etwa aus einer Benachrichtigung oder von einer "
                    "anderen Person. Auch ohne Anmeldung soll die Anwendung dann direkt "
                    "die öffentliche Tagesansicht laden. Enthält der Link "
                    "personalisierte Parameter, werden diese für Gäste kontrolliert auf "
                    "die öffentliche Lite-Nutzung zurückgeführt, sodass das Datum "
                    "erhalten bleibt, aber kein personalisierter Zustand vorgetäuscht "
                    "wird."
                ),
            }
        ],
    },
    {
        "title": "2. Kapitel 3 - Lösungsansatz und Pflichtenheft",
        "items": [
            {
                "heading": "3.3 Öffentliche Nutzung, Registrierung und Dashboard",
                "mode": "insert",
                "where": (
                    "Kapitel 3, Abschnitt 3.3, nach dem letzten Absatz."
                ),
                "text": (
                    "Die öffentliche Nutzung wurde im späteren Projektverlauf weiter "
                    "präzisiert. Neben dem direkten Aufruf der Startseite können auch "
                    "geteilte Dashboard-Links mit Datumsparameter ohne Anmeldung genutzt "
                    "werden. Enthält ein solcher Link personalisierte Parameter, fällt "
                    "die Anwendung für Gäste kontrolliert auf die öffentliche Lite-Ansicht "
                    "desselben Tages zurück, anstatt einen irreführenden personalisierten "
                    "Zustand anzuzeigen. Gleichzeitig wurde der Bootstrap-Fall des Systems "
                    "klarer geführt: Solange noch kein Administrator eingerichtet ist, "
                    "leitet der erste Zugriff nicht in das reguläre Dashboard, sondern in "
                    "Registrierung und Admin-Setup. Erst nach dieser Grundkonfiguration "
                    "verhält sich die Anwendung als öffentlicher Einstiegspunkt mit "
                    "optionalen personalisierten Erweiterungen."
                ),
            },
            {
                "heading": "3.7 API-Proxy, Caching und Fehlerpfade",
                "mode": "insert",
                "where": (
                    "Kapitel 3, Abschnitt 3.7, nach dem letzten Absatz."
                ),
                "text": (
                    "Auch die Fehlerpfade wurden in der finalen Ausarbeitung weiter "
                    "geschärft. Ungültige Datumsparameter werden nicht mehr "
                    "stillschweigend auf einen anderen Kalendertag umgedeutet, sondern "
                    "wie fehlende Eingaben behandelt. Ebenso werden erfolgreiche, aber "
                    "fachlich ungültige Antworten interner Verwaltungsrouten - etwa beim "
                    "Lehrerverzeichnis - nicht mehr als leere Daten interpretiert, "
                    "sondern gezielt als Fehler behandelt. Dadurch reagiert die "
                    "Oberfläche robuster und vermeidet Zustände, in denen technische "
                    "Probleme fälschlich wie normale Leerdaten wirken."
                ),
            },
        ],
    },
    {
        "title": "3. Kapitel 7 - Technische Umsetzung und Schwierigkeiten",
        "items": [
            {
                "heading": "7.2 Zentrale Module und ihre Aufgaben",
                "mode": "insert_table",
                "where": (
                    "Kapitel 7, Abschnitt 7.2, am Ende der bestehenden Tabelle "
                    "zusätzliche Zeilen aufnehmen und direkt danach den Absatz ergänzen."
                ),
                "table_headers": ["Datei / Ordner", "Aufgabe im Gesamtsystem"],
                "table_rows": [
                    [
                        "src/lib/stundenplan-page-guards.ts",
                        "Bündelt serverseitige Zugriffsentscheidungen für Startseite, "
                        "Dashboard und Einrichtungsseiten.",
                    ],
                    [
                        "src/lib/login-target.ts",
                        "Erzeugt konsistente Login-Zieladressen, damit Gastaufrufe nach "
                        "der Anmeldung an die richtige Ansicht zurückkehren.",
                    ],
                    [
                        "src/lib/teacher-directory-client.ts",
                        "Kapselt Abruf, Antwortprüfung und Fehlermeldungen für das "
                        "Lehrerverzeichnis.",
                    ],
                    [
                        "src/lib/untis-client.ts",
                        "Zentralisiert den Zugriff auf WebUntis und entlastet die "
                        "API-Route von Upstream-Details.",
                    ],
                    [
                        "src/lib/push-service.ts",
                        "Bündelt wiederverwendbare Push-Operationen wie Speichern, "
                        "Löschen und Zustandsabfragen.",
                    ],
                ],
                "text": (
                    "Im Zuge der Weiterentwicklung wurden außerdem mehrere gemeinsame "
                    "Hilfsmodule eingeführt, um zuvor doppelt vorhandene Logik zu "
                    "vereinheitlichen. Dazu gehören insbesondere Hilfen für "
                    "Login-Zielpfade, Datumsvalidierung, Seitenzugriffsregeln und "
                    "Verwaltungsantworten. Gleichzeitig wurden ältere, redundante "
                    "Dashboard-Pfade entfernt, sodass öffentliche und personalisierte "
                    "Nutzung nun auf einer gemeinsamen Grundstruktur aufbauen. Diese "
                    "Vereinheitlichung verbessert die Wartbarkeit, weil Änderungen an "
                    "zentralen Abläufen nicht mehr an mehreren getrennten Stellen "
                    "parallel nachgezogen werden müssen."
                ),
            },
            {
                "heading": "7.4 Nutzerfluss und Bedienbarkeit",
                "mode": "insert",
                "where": (
                    "Kapitel 7, Abschnitt 7.4, nach dem letzten Absatz."
                ),
                "text": (
                    "Im Bereich der Bedienbarkeit wurde der Nutzerfluss zwischen "
                    "öffentlicher und personalisierter Nutzung weiter vereinfacht. Gäste "
                    "sehen im Dashboard nur noch die tatsächlich öffentlich verfügbaren "
                    "Informationen und werden nicht mehr mit persönlichen Zuständen wie "
                    "Stundenplanhinweisen oder personalisierten Umschaltern konfrontiert. "
                    "Zusätzlich wurden geteilte Links so angepasst, dass auch nicht "
                    "angemeldete Nutzer direkt zur passenden Tagesansicht gelangen. "
                    "Dadurch bleibt die Anwendung im Alltag verständlicher und "
                    "konsistenter bedienbar."
                ),
            },
            {
                "heading": "7.5 Sicherheit, Datenschutz und Betrieb",
                "mode": "replace",
                "where": (
                    "Kapitel 7, Abschnitt 7.5, den Absatz beginnend mit "
                    "'Diese Zugriffskontrolle wird ...' bis einschließlich "
                    "'... sichere Übertragung.' ersetzen."
                ),
                "text": (
                    "Diese Zugriffskontrolle wird durch eine zentrale Middleware und "
                    "ergänzende serverseitige Guards umgesetzt. Dabei wird nicht jeder "
                    "unauthentifizierte Aufruf pauschal zur Anmeldeseite umgeleitet. "
                    "Bewusst öffentliche Einstiege wie die Dashboard-Ansicht für einen "
                    "konkreten Tag bleiben auch ohne Login erreichbar, während "
                    "Einstellungen, Stundenplanbearbeitung und andere interne Bereiche "
                    "geschützt bleiben. Gleichzeitig setzt die Anwendung "
                    "sicherheitsrelevante HTTP-Header wie Content Security Policy. "
                    "Sensible Prüfungen laufen serverseitig, mutierende Requests werden "
                    "abgesichert und die Auslieferung im Browser wird über "
                    "Sicherheitsheader gehärtet. Zusätzlich war HTTPS für den "
                    "produktiven Betrieb unverzichtbar, nicht nur wegen QStash, sondern "
                    "auch wegen der generell sicheren Übertragung."
                ),
            },
            {
                "heading": "7.6 Typische Schwierigkeiten und dessen Lösungen",
                "mode": "insert_list",
                "where": (
                    "Kapitel 7, Abschnitt 7.6, als neue Punkte 5 und 6 nach Punkt 4."
                ),
                "list_items": [
                    (
                        "5. Durch die Zusammenführung mehrerer Dashboard-Varianten "
                        "entstanden zwischenzeitlich Grenzfälle, in denen Gäste über "
                        "URL-Parameter in personalisierte Zustände geraten konnten. Die "
                        "Lösung bestand in einer klareren Trennung zwischen öffentlichem "
                        "und personalisiertem Scope, zusätzlichen Guards in Middleware, "
                        "Route und Client sowie in einer kontrollierten Rückführung "
                        "geteilter Links auf die öffentliche Tagesansicht."
                    ),
                    (
                        "6. Im Lehrerverzeichnis zeigte sich ein unauffälliger, aber "
                        "problematischer Fehlerfall: Erfolgreiche Antworten ohne gültige "
                        "JSON-Struktur wirkten zunächst wie normale Leerdaten. Gelöst "
                        "wurde dies durch eine strengere Validierung der "
                        "Serverantworten. Seitdem werden solche Fälle sichtbar als Fehler "
                        "behandelt, was die Administrationsoberfläche verlässlicher macht."
                    ),
                ],
            },
        ],
    },
    {
        "title": "4. Kapitel 8 - Test und Ergebnisbewertung",
        "items": [
            {
                "heading": "8.1 Teststrategie",
                "mode": "replace",
                "where": (
                    "Kapitel 8, Abschnitt 8.1, den Absatz beginnend mit "
                    "'Zum Zeitpunkt dieser Dokumentation ...' ersetzen."
                ),
                "text": (
                    "Zum Zeitpunkt dieses Nachtrags umfasst das Projekt 42 Testdateien "
                    "mit insgesamt 195 Testfällen. Ergänzt wurden insbesondere "
                    "Regressionstests für Gastaufrufe des Dashboards, Weiterleitungen "
                    "bei geteilten Links, die Validierung von Query-Parametern, die "
                    "Fehlerbehandlung im Lehrerverzeichnis sowie die Abgrenzung "
                    "zwischen öffentlicher und personalisierter Oberfläche. Damit "
                    "orientiert sich die Qualitätssicherung noch stärker an realen "
                    "Fehlpfaden aus dem laufenden Betrieb."
                ),
            },
            {
                "heading": "8.2 Ausgewählte Testfälle",
                "mode": "insert_table",
                "where": (
                    "Kapitel 8, Abschnitt 8.2, am Ende der bestehenden Tabelle "
                    "zusätzliche Zeilen aufnehmen."
                ),
                "table_headers": ["Testziel", "Typ", "Vorgehen", "Ergebnis"],
                "table_rows": [
                    [
                        "Gastzugriff auf geteilten Dashboard-Link",
                        "Integration",
                        "Aufruf von /stundenplan/dashboard mit date- und "
                        "scope-Parameter ohne Sitzung simulieren.",
                        "Weiterleitung auf die öffentliche Lite-Ansicht desselben "
                        "Tages statt auf die Login-Seite.",
                    ],
                    [
                        "Abgrenzung personalisierter Gastzustände",
                        "Komponente",
                        "Dashboard-Client ohne Authentifizierung mit "
                        "scope=personal rendern.",
                        "Keine persönlichen Umschalter, Stundenplanhinweise oder "
                        "anderen personalisierten Elemente sichtbar.",
                    ],
                    [
                        "Fehlervertrag des Lehrerverzeichnisses",
                        "Unit",
                        "Antwort mit Status 200, aber ohne gültige JSON-Struktur "
                        "an den Teacher-Directory-Client übergeben.",
                        "Antwort wird als Fehler behandelt und nicht als normale "
                        "Leerdaten interpretiert.",
                    ],
                    [
                        "Ungültige Datumsparameter",
                        "Unit",
                        "Überlaufdatum wie 20260231 an die Datumsvalidierung "
                        "und den Dashboard-Pfad übergeben.",
                        "Wert wird verworfen und wie ein fehlender Parameter "
                        "behandelt.",
                    ],
                ],
            },
        ],
    },
]


def footer(canvas, doc):
    page_number = canvas.getPageNumber()
    canvas.saveState()
    canvas.setFont("Times-Italic", 8.5)
    if page_number > 1:
        canvas.setFillColor(colors.HexColor("#777777"))
        canvas.drawCentredString(
            A4[0] / 2,
            A4[1] - 14 * mm,
            "BLL-Nachträge zum Einfügen in die bestehende Ausarbeitung",
        )
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawRightString(A4[0] - 25 * mm, 12 * mm, f"Seite {page_number}")
    canvas.restoreState()


def paragraph_box(text, styles):
    return Table(
        [[Paragraph("<b>FORMULIERUNGSVORSCHLAG</b>", styles["DocLabel"])], [Paragraph(text, styles["DocBody"])]],
        colWidths=[160 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eef7ef")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#5a8f61")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        ),
    )


def table_box(headers, rows, styles):
    data = [
        [Paragraph(header, styles["TableHeaderCell"]) for header in headers],
        *[[Paragraph(cell, styles["TableCell"]) for cell in row] for row in rows],
    ]
    if len(headers) == 2:
        col_widths = [46 * mm, 114 * mm]
    else:
        col_widths = [34 * mm, 18 * mm, 52 * mm, 56 * mm]
    return Table(
        data,
        colWidths=col_widths,
        repeatRows=1,
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3d63")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Times-Roman"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("LEADING", (0, 0), (-1, -1), 12),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bfc8d6")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f7f9")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        ),
    )


def build_story():
    styles = build_styles()
    story = [
        Spacer(1, 28 * mm),
        Paragraph("BLL-Nachträge", styles["DocTitle"]),
        Paragraph(
            "Nachzutragende Änderungen zur schriftlichen Ausarbeitung",
            styles["DocSubtitle"],
        ),
        Paragraph("Projekt: FDS Vertretungsplan", styles["DocSubtitle"]),
        Paragraph("Stand: 19. März 2026", styles["DocSubtitle"]),
        Spacer(1, 12 * mm),
        Paragraph("Inhalt dieses Dokuments", styles["DocSubsection"]),
        Paragraph(
            "1. Nachtrag zum neuen Gast-Anwendungsfall in Kapitel 2<br/>"
            "2. Präzisierungen zu öffentlicher Nutzung, Bootstrap-Setup und Fehlerpfaden in Kapitel 3<br/>"
            "3. Ergänzungen und Korrekturen in Kapitel 7 zu Modulen, Nutzerfluss und Sicherheitslogik<br/>"
            "4. Aktualisierungen von Teststrategie und Testfällen in Kapitel 8",
            styles["DocBody"],
        ),
        Spacer(1, 4 * mm),
        Paragraph(
            "Dieses Dokument enthält ausschließlich Änderungen, die im bestehenden "
            "BLL-PDF noch nachgetragen oder korrigiert werden sollten. Jeder Block "
            "nennt den genauen Abschnitt, den Einfüge- oder Ersetzungsort und einen "
            "direkt verwendbaren Formulierungsvorschlag im Stil der vorhandenen "
            "Ausarbeitung.",
            styles["DocBody"],
        ),
        PageBreak(),
    ]

    for section in SECTIONS:
        story.append(Paragraph(section["title"], styles["DocSection"]))
        story.append(Spacer(1, 2 * mm))
        for item in section["items"]:
            blocks = [Paragraph(item["heading"], styles["DocSubsection"])]
            mode_label = "EINFÜGEN IN" if item["mode"].startswith("insert") else "ERSETZEN IN"
            blocks.append(
                Table(
                    [
                        [
                            Paragraph(f"{mode_label}:", styles["DocHint"]),
                            Paragraph(item["where"], styles["DocBody"]),
                        ]
                    ],
                    colWidths=[28 * mm, 132 * mm],
                    style=TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff3cd")),
                            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#e0b54d")),
                            ("LEFTPADDING", (0, 0), (-1, -1), 8),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                            ("TOPPADDING", (0, 0), (-1, -1), 7),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ]
                    ),
                )
            )
            blocks.append(Spacer(1, 3 * mm))

            if item["mode"] == "insert_table":
                blocks.append(Paragraph("TABELLENZEILEN", styles["DocLabel"]))
                blocks.append(table_box(item["table_headers"], item["table_rows"], styles))
                if item.get("text"):
                    blocks.append(Spacer(1, 3 * mm))
                    blocks.append(paragraph_box(item["text"], styles))
            elif item["mode"] == "insert_list":
                list_text = "<br/><br/>".join(item["list_items"])
                blocks.append(paragraph_box(list_text, styles))
            else:
                blocks.append(paragraph_box(item["text"], styles))

            blocks.append(Spacer(1, 6 * mm))
            story.extend(blocks)
        story.append(Spacer(1, 1 * mm))
    return story


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=25 * mm,
        rightMargin=25 * mm,
        topMargin=22 * mm,
        bottomMargin=18 * mm,
        title="BLL Nachzutragende Änderungen",
        author="Codex",
    )
    doc.build(build_story(), onFirstPage=footer, onLaterPages=footer)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
