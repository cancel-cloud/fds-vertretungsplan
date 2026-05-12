---
pdf_options:
  format: A4
  margin: 25mm
  displayHeaderFooter: true
  headerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;">BLL – Fehlende Verweise und Erweiterungen (basierend auf aktuellem PDF, Stand 17.03.2026)</div>'
  footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#999;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
stylesheet: []
body_class: bll-doc
---

<style>
  body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; }
  h1 { font-size: 20pt; color: #1a3c6e; border-bottom: 2px solid #1a3c6e; padding-bottom: 6px; margin-top: 40px; page-break-before: always; }
  h1:first-of-type { page-break-before: avoid; }
  h2 { font-size: 14pt; color: #1a3c6e; margin-top: 24px; }
  h3 { font-size: 12pt; color: #333; margin-top: 18px; }
  .verweis { background: #fff3cd; border-left: 4px solid #ffc107; padding: 4px 10px; margin: 6px 0; font-size: 10pt; display: block; }
  .erweiterung { background: #d4edda; border: 2px solid #28a745; border-radius: 6px; padding: 12px 16px; margin: 12px 0; }
  .erweiterung-label { font-weight: bold; color: #155724; font-size: 10pt; text-transform: uppercase; margin-bottom: 4px; }
  .quelle-neu { background: #cce5ff; border-left: 4px solid #007bff; padding: 4px 10px; margin: 6px 0; font-size: 10pt; }
  .besteht { color: #6c757d; font-size: 9pt; font-style: italic; }
  .legende-box { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px; margin: 20px 0; }
  .p0 { border-left-color: #dc3545; }
  .p1 { border-left-color: #fd7e14; }
  .p2 { border-left-color: #6f42c1; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10pt; }
  th { background: #1a3c6e; color: white; padding: 8px 10px; text-align: left; }
  td { border: 1px solid #dee2e6; padding: 6px 10px; }
  tr:nth-child(even) { background: #f8f9fa; }
</style>

<div class="legende-box">

## Legende

| Markierung | Bedeutung |
|---|---|
| <span style="background:#fff3cd;padding:2px 6px;">VERWEIS</span> | Hier fehlt eine Fußnote / ein Quellenhinweis im Text |
| <span style="background:#d4edda;padding:2px 6px;">ERWEITERUNG</span> | Hier fehlt Inhalt, der ergänzt werden sollte |
| <span style="background:#cce5ff;padding:2px 6px;">NEUE QUELLE</span> | Diese Quelle sollte ins Quellenverzeichnis aufgenommen werden |
| **P0** = kritisch | **P1** = wichtig | **P2** = wünschenswert | **P3** = optional |

**Vorgehen**: Dieses Dokument zeigt Stelle für Stelle, wo im aktuellen PDF (34 Seiten) noch Verweise oder Ergänzungen fehlen. Jede Markierung enthält die Seitenzahl und den umgebenden Textkontext, damit du die Stelle in Google Docs sofort findest.

</div>

---

# P0 – Kritische Punkte

## P0-1: Abgabedatum auf Deckblatt fehlt

**Seite 1** – Deckblatt, Zeile "Abgabedatum"

> Aktuell steht dort: **[eintragen]**

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P0-1</div>

Ersetze `[eintragen]` durch das tatsächliche Abgabedatum.

</div>

---

## P0-2: Zu wenige Inline-Fußnoten im Fließtext

Dein Quellenverzeichnis (Kap. 10, S. 33–34) listet Sommerville, Krug, Spillner/Linz, Nielsen, RFC 8292, RFC 5861, W3C Push API, W3C Service Workers, W3C CSP, OWASP Top 10 auf. Aber im Fließtext gibt es nur **eine einzige Fußnote** (S. 6: W3C Push API). Alle anderen Quellen werden nirgends im Text referenziert. Das muss sich ändern – jede Quelle muss mindestens einmal im Text per Fußnote verankert sein.

Nachfolgend alle Stellen, an denen ein Verweis eingefügt werden sollte:

---

### Verweis 1: Sommerville – Anforderungsanalyse

**Seite 8, Abschnitt 2.1** „Woher stammen die Anforderungen?"

> „Die Anforderungen wurden nicht aus einem fertigen Pflichtenheft übernommen, sondern aus mehreren praxisnahen Quellen zusammengeführt."

<div class="verweis">
VERWEIS einfügen: Nach diesem Satz eine Fußnote ergänzen:<br>
<em>Vgl. Sommerville (2015), Kap. 4: Anforderungserhebung aus heterogenen Quellen als etabliertes Vorgehen im Requirements Engineering.</em>
</div>

---

### Verweis 2: Sommerville – SMART-Ziele

**Seite 10, Abschnitt 2.6** „SMART-Ziele" (Tabelle)

> Direkt über oder unter der SMART-Tabelle.

<div class="verweis">
VERWEIS einfügen: Fußnote an der Überschrift oder am ersten Satz nach der Tabelle:<br>
<em>Vgl. Sommerville (2015), Kap. 4: SMART-Kriterien als Grundlage messbarer Zielformulierung.</em>
</div>

---

### Verweis 3: Sommerville – Schichtenarchitektur

**Seite 11, Abschnitt 3.2** „Architekturprinzip"

> „Die finale Architektur trennt vier Ebenen. Auf der ersten Ebene steht die Benutzeroberfläche …"

<div class="verweis">
VERWEIS einfügen: Fußnote nach dem ersten Absatz:<br>
<em>Vgl. Sommerville (2015), Kap. 6: Schichtenarchitektur als Mittel zur Trennung von Zuständigkeiten in Softwaresystemen.</em>
</div>

---

### Verweis 4: RFC 5861 – Caching-Strategie

**Seite 13, Abschnitt 3.6** „API-Proxy, Caching und Fehlerpfade"

> „Deshalb gibt es einen Server-Cache, ergänzt durch einen Client-Cache im Hook."

<div class="verweis">
VERWEIS einfügen: Fußnote nach dem Cache-Satz:<br>
<em>Vgl. RFC 5861 – HTTP Cache-Control Extensions for Stale Content: Grundlage für das stale-while-revalidate-Muster, das hier adaptiert wurde.</em>
</div>

---

### Verweis 5: RFC 8292 – VAPID / Push

**Seite 13, Abschnitt 3.7** „Push-Benachrichtigungen und Delta-Logik"

> „Push-Benachrichtigungen wurden nicht als einfache ‚Sende immer den aktuellen Stand'-Funktion umgesetzt."

<div class="verweis">
VERWEIS einfügen: Fußnote im Abschnitt 3.7, z.B. nach dem Satz über den Fingerprint-Vergleich:<br>
<em>Die technische Grundlage für Web Push bildet RFC 8292 – Voluntary Application Server Identification (VAPID), das die Authentifizierung des Push-Servers gegenüber dem Browser regelt.</em>
</div>

---

### Verweis 6: W3C Service Workers

**Seite 13, Abschnitt 3.7** (gleicher Abschnitt oder alternativ Seite 18, Tabelle 5.2 bei „Web Push / VAPID")

<div class="verweis">
VERWEIS einfügen: Fußnote beim Thema Push-Zustellung:<br>
<em>Vgl. W3C Service Workers Spezifikation: Der Service Worker empfängt Push-Events im Hintergrund und zeigt Benachrichtigungen auch bei geschlossenem Browser an.</em>
</div>

---

### Verweis 7: Krug – Bedienung / Usability

**Seite 9, Abschnitt 2.5** „Bedienung im Schulalltag"

> „Die Bedienung sollte möglichst wenig Erklärung brauchen."

<div class="verweis">
VERWEIS einfügen: Fußnote nach dem ersten Satz:<br>
<em>Vgl. Krug (2014), Kap. 1–2: „Don't Make Me Think" als Leitsatz für selbsterklärende Interfaces.</em>
</div>

---

### Verweis 8: Krug – Nutzerfluss / Lessons Learned

**Seite 27, Abschnitt 7.4** „Nutzerfluss und Bedienbarkeit"

> „Gute Bedienbarkeit entsteht nicht automatisch als Nebenprodukt funktionierenden Codes."

<div class="verweis">
VERWEIS einfügen: Fußnote nach diesem Satz:<br>
<em>Vgl. Krug (2014), Kap. 7: Gute Navigation und klare Einstiegspunkte als Grundvoraussetzung nutzbarer Webanwendungen.</em>
</div>

---

### Verweis 9: Nielsen – UI-Iterationen

**Seite 28, Abschnitt 7.7** „Lessons Learned", letzter Absatz

> „Gute UI entsteht nicht durch frühes Design, sondern durch inhaltliche Klarheit."

<div class="verweis">
VERWEIS einfügen: Fußnote bei der UI-Erkenntnis:<br>
<em>Vgl. Nielsen (1994), Heuristik 2 „Match between system and the real world" und Heuristik 8 „Aesthetic and minimalist design": Gestaltung folgt dem Verständnis der Nutzerbedürfnisse, nicht umgekehrt.</em>
</div>

---

### Verweis 10: Spillner/Linz – Teststrategie

**Seite 29, Abschnitt 8.1** „Teststrategie"

> „Die Qualitätssicherung stützt sich auf mehrere Ebenen. Automatisierte Tests prüfen die Kernlogik in Unit-, Integrations- und Komponententests."

<div class="verweis">
VERWEIS einfügen: Fußnote nach dem zweiten Satz:<br>
<em>Vgl. Spillner/Linz (2019), Kap. 2–3: Teststufen (Unit, Integration, Komponente) und ihre Abgrenzung im Testprozess.</em>
</div>

---

### Verweis 11: Spillner/Linz – Soll-Ist-Abgleich

**Seite 30, Abschnitt 8.3** „Soll-Ist-Abgleich der SMART-Ziele"

> Direkt über oder unter der Tabelle.

<div class="verweis">
VERWEIS einfügen: Fußnote bei der Ergebnisbewertung:<br>
<em>Vgl. Spillner/Linz (2019), Kap. 1: Systematische Prüfung gegen vorab definierte Akzeptanzkriterien als Grundlage der Qualitätsbewertung.</em>
</div>

---

### Verweis 12: OWASP Top 10 – Sicherheit

**Seite 27, Abschnitt 7.5** „Sicherheit, Datenschutz und Betrieb"

> „Geschützte Bereiche dürfen nur nach Authentifizierung erreichbar sein, sensible Prüfungen laufen serverseitig, mutierende Requests werden abgesichert und die Auslieferung im Browser wird über Sicherheitsheader gehärtet."

<div class="verweis">
VERWEIS einfügen: Fußnote nach dem Sicherheits-Satz:<br>
<em>Vgl. OWASP Top 10 (2021): Die gewählten Maßnahmen adressieren u.a. A01 Broken Access Control, A03 Injection und A05 Security Misconfiguration.</em>
</div>

---

### Verweis 13: W3C CSP – Content Security Policy

**Seite 27, Abschnitt 7.5** (gleicher Abschnitt)

> „die Auslieferung im Browser wird über Sicherheitsheader gehärtet"

<div class="verweis">
VERWEIS einfügen: Fußnote direkt bei „Sicherheitsheader":<br>
<em>Vgl. W3C Content Security Policy Level 3: CSP-Header schränken ein, welche Ressourcen der Browser laden darf, und reduzieren damit das Risiko von Cross-Site-Scripting.</em>
</div>

---

### Verweis 14: Sommerville – Iteratives Vorgehen

**Seite 14, Abschnitt 4.1** „Iteratives Vorgehen statt starrem Vorgehensmodell"

> „Deshalb wurde iterativ gearbeitet: ausprobieren, testen, Schwächen erkennen, Architektur verbessern und den nächsten Meilenstein ableiten."

<div class="verweis">
VERWEIS einfügen: Fußnote nach dem Absatz:<br>
<em>Vgl. Sommerville (2015), Kap. 2: Iterative und inkrementelle Entwicklung als Alternative zu plangetriebenen Modellen.</em>
</div>

---

### Verweis 15: Sommerville – Wartbarkeit

**Seite 19, Abschnitt 5.4** „Passung des Stacks zum Projekt"

> „Für eine BLL im Fach Informatik ist das wichtig, weil damit sichtbar wird, dass nicht nur ‚eine hübsche Website' entstanden ist, sondern eine technisch nachvollziehbare, modular aufgebaute Anwendung."

<div class="verweis">
VERWEIS einfügen: Fußnote bei Wartbarkeit/Modularität:<br>
<em>Vgl. Sommerville (2015), Kap. 25: Softwareentwicklung und Wartbarkeit als langfristiges Qualitätsmerkmal.</em>
</div>

---

# P1 – Wichtige Punkte

## P1-1: Datenmodell fehlt als eigenständige Erklärung

**Seite 12, nach Abschnitt 3.4 oder in einem neuen Unterabschnitt**

Das Datenmodell (User, TimetableEntry, PushSubscription, NotificationState, NotificationFingerprint, TeacherDirectory, AppSettings, TimetablePreset) wird nirgends zusammenhängend erklärt. In Kapitel 3 fehlt ein Abschnitt, der den Kausalfluss zwischen den Entitäten beschreibt.

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P1-1 – Neuer Abschnitt z.B. „3.4a Datenmodell und Entitäten" (nach 3.4, vor 3.5)</div>

**Vorgeschlagener Text (ca. 8–10 Sätze):**

Das relationale Datenmodell bildet die Grundlage für alle personalisierten Funktionen der Anwendung. Im Zentrum steht der Nutzer mit seiner Rolle und seinen Zugangsdaten. Jeder angemeldete Nutzer kann Stundenplaneinträge anlegen, die Wochentag, Stunde, Fach, Lehrkraft und Wochenmodus enthalten. Diese Einträge sind die Basis für den personalisierten Abgleich: Beim Push-Dispatch werden die aktuellen Vertretungsdaten mit dem hinterlegten Stundenplan verglichen.

Für die Benachrichtigungslogik existieren zwei getrennte Tabellen: Der Benachrichtigungszustand speichert pro Nutzer und Tag genau einen Fingerprint und wird bei jeder Prüfung aktualisiert oder gelöscht. Der Benachrichtigungsabdruck protokolliert dagegen jeden gesendeten Fingerprint als unveränderliches Audit-Log. Diese Trennung ermöglicht sowohl die Delta-Entscheidung (senden, überspringen oder auflösen) als auch die Nachvollziehbarkeit vergangener Benachrichtigungen.

Ergänzend verwaltet das Lehrerverzeichnis die Zuordnung von Kürzeln zu Klarnamen, und die Anwendungseinstellungen steuern betreiberspezifische Konfiguration wie erlaubte E-Mail-Domänen. Das Stundenplan-Preset dient als Autocomplete-Gedächtnis ohne Zeitbezug und ist damit orthogonal zum eigentlichen Stundenplaneintrag.

<em>Fußnote: Vgl. Sommerville (2015), Kap. 5: Datenmodellierung als Grundlage für die Systemarchitektur.</em>

</div>

---

## P1-2: Nutzungsbeschreibung „Wie bediene ich es?" noch dünn

**Seite 9, Abschnitt 2.5** und **Seite 11–12, Abschnitt 3.3** beschreiben den Nutzerfluss, aber es fehlt eine kompakte Schritt-für-Schritt-Darstellung mit konkretem Bezug zur Oberfläche. Der Prüfer erwartet eine kurze, anschauliche Beschreibung.

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P1-2 – Abschnitt 2.5 erweitern oder eigenen Abschnitt „2.5a Typischer Nutzungsablauf" hinzufügen</div>

**Ergänzungsvorschlag (ca. 6–8 Sätze):**

Ein typischer Nutzungsablauf beginnt mit dem Öffnen der Startseite im Browser. Ohne Anmeldung kann ein Gast sofort ein Datum wählen und die Vertretungsliste einsehen. Suche und Kategorienfilter stehen direkt zur Verfügung. Wer personalisierte Funktionen nutzen möchte, registriert sich mit E-Mail-Adresse und Passwort. Nach dem ersten Login folgt automatisch das Onboarding: Der eigene Stundenplan wird Schritt für Schritt eingetragen. Danach zeigt das Dashboard nur noch die für den eigenen Plan relevanten Vertretungen. Push-Benachrichtigungen lassen sich in den Einstellungen aktivieren; ab diesem Moment erhält der Nutzer automatisch eine Nachricht, sobald sich relevante Vertretungen ändern. Administratoren finden im Admin-Bereich zusätzlich die Lehrerkürzel-Pflege und die Nutzerverwaltung.

<em>Fußnote: Vgl. Krug (2014), Kap. 3–4: Konventionen und klare visuelle Hierarchie als Grundlage für intuitive Bedienung.</em>

</div>

---

## P1-3: Seitenumfang 34 Seiten – über Zielwert

Das PDF hat 34 Seiten (Zielwert laut Feedback: 15–17 Seiten, Maximum 20). Das ist kein inhaltlich lösbares Problem in diesem Dokument, aber du solltest prüfen, ob folgende Abschnitte gekürzt werden können:

- Deckblatt + Inhaltsverzeichnis (S. 1–4): 4 Seiten, davon 2 fast leer → ggf. Inhaltsverzeichnis kompakter
- Kapitel 6 Diagramme (S. 20–25): 6 Seiten, davon viel Weißraum → Diagramme kleiner skalieren
- Kapitel 7 (S. 26–28): teilweise Dopplungen mit Kap. 3 und Kap. 4

---

# P2 – Wünschenswerte Punkte

## P2-1: Service Worker nicht erwähnt

Der Service Worker wird im gesamten Dokument nicht direkt beschrieben. In Abschnitt 3.7 oder 7.5 sollte ein Satz ergänzt werden:

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P2-1 – In Abschnitt 3.7 (S. 13) ergänzen</div>

Ergänze nach dem Delta-Logik-Absatz: „Für die Zustellung im Browser ist ein Service Worker registriert. Er empfängt Push-Events auch bei geschlossenem Tab und zeigt die Benachrichtigung über die Notification API des Browsers an. Zusätzlich behandelt er Klick-Events auf die Benachrichtigung, um den Nutzer direkt zur relevanten Tagesansicht zu führen."

<em>Fußnote: Vgl. W3C Service Workers Spezifikation.</em>

</div>

---

## P2-2: AppSettings nicht erwähnt

Die Tabelle AppSettings (erlaubte E-Mail-Domänen, betreiberspezifische Konfiguration) wird nirgends erwähnt.

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P2-2 – In Abschnitt 3.4 (S. 12) oder im neuen Datenmodell-Abschnitt ergänzen</div>

Ergänze einen Satz bei Rollen/Berechtigungen: „Zusätzlich lassen sich über die Anwendungseinstellungen erlaubte E-Mail-Domänen konfigurieren. Damit kann der Administrator steuern, welche E-Mail-Adressen sich registrieren dürfen – etwa nur schulische Adressen."

</div>

---

## P2-3: TimetablePreset nicht erwähnt

Das TimetablePreset (Autocomplete-Gedächtnis) wird nicht erwähnt.

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P2-3 – Im neuen Datenmodell-Abschnitt oder in 3.3 (S. 12) ergänzen</div>

Ergänze: „Um die Stundenplan-Eingabe zu erleichtern, merkt sich das System häufig verwendete Fach-Lehrer-Kombinationen als Vorschläge. Diese Vorlagen haben bewusst keinen Zeitbezug und sind unabhängig vom eigentlichen Stundenplaneintrag."

</div>

---

## P2-4: PostHog-Analytik nur im Use-Case-Diagramm sichtbar

PostHog erscheint im Use-Case-Diagramm (S. 20) als optionaler Akteur und im Quellenverzeichnis (S. 33), wird aber im Fließtext nicht erwähnt.

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P2-4 – In Abschnitt 5.2 (S. 18) Tabelle ergänzen oder in 7.5 einen Satz einfügen</div>

Ergänze in der Tech-Stack-Tabelle eine Zeile: **Analytik** | PostHog | Optionale, datenschutzfreundliche Nutzungsanalyse zur Identifikation häufiger Fehler und Nutzungsmuster.

Oder alternativ in 7.5 (S. 27): „Für die Analyse des Nutzungsverhaltens kann optional PostHog eingebunden werden. Die Integration ist serverseitig und clientseitig vorbereitet, aber nicht zwingend für den Betrieb erforderlich."

</div>

---

## P2-5: Middleware nicht erwähnt

Die Middleware (Routenschutz, Sicherheitsheader) wird in 7.5 angedeutet, aber nicht beim Namen genannt.

<div class="erweiterung">
<div class="erweiterung-label">ERWEITERUNG P2-5 – In Abschnitt 7.5 (S. 27) präzisieren</div>

Ergänze nach „Geschützte Bereiche dürfen nur nach Authentifizierung erreichbar sein": „Diese Zugriffskontrolle wird durch eine zentrale Middleware umgesetzt, die bei jedem Request prüft, ob der Pfad eine Authentifizierung erfordert, und unauthentifizierte Nutzer zur Anmeldeseite weiterleitet. Gleichzeitig setzt sie sicherheitsrelevante HTTP-Header wie Content Security Policy."

</div>

---

# P3 – Kleinere Hinweise

## P3-1: Balzert fehlt im Quellenverzeichnis

In der alten RST-Version wurde Balzert (2009) mehrfach referenziert. Im aktuellen PDF fehlt Balzert komplett im Quellenverzeichnis (S. 33–34). Falls du Balzert-Verweise im Text behalten willst, muss die Quelle ergänzt werden.

<div class="quelle-neu">
NEUE QUELLE (falls gewünscht): Balzert, Helmut: Lehrbuch der Softwaretechnik – Basiskonzepte und Requirements Engineering. 3. Auflage, Spektrum, 2009. (Anforderungsanalyse, Pflichtenheft, SMART-Ziele)
</div>

---

## P3-2: Kleuker fehlt im Quellenverzeichnis

Kleuker (2018) wurde in der alten Version als Quelle für UML-Grundlagen verwendet, ist aber nicht im aktuellen Quellenverzeichnis.

<div class="quelle-neu">
NEUE QUELLE (falls gewünscht): Kleuker, Stephan: Grundkurs Software-Engineering mit UML. 4. Auflage, Springer Vieweg, 2018. (UML-Notation, Klassendiagramme, Use Cases)
</div>

---

# Zusammenfassung: Was fehlt wo?

| # | Priorität | Typ | Seite | Abschnitt | Was tun? |
|---|---|---|---|---|---|
| P0-1 | P0 | Fix | 1 | Deckblatt | Abgabedatum eintragen |
| V1 | P0 | Verweis | 8 | 2.1 | Sommerville → Anforderungserhebung |
| V2 | P0 | Verweis | 10 | 2.6 | Sommerville → SMART-Ziele |
| V3 | P0 | Verweis | 11 | 3.2 | Sommerville → Schichtenarchitektur |
| V4 | P0 | Verweis | 13 | 3.6 | RFC 5861 → Cache-Strategie |
| V5 | P0 | Verweis | 13 | 3.7 | RFC 8292 → VAPID / Push |
| V6 | P0 | Verweis | 13 | 3.7 | W3C Service Workers |
| V7 | P0 | Verweis | 9 | 2.5 | Krug → Bedienung |
| V8 | P0 | Verweis | 27 | 7.4 | Krug → Nutzerfluss |
| V9 | P0 | Verweis | 28 | 7.7 | Nielsen → UI-Heuristiken |
| V10 | P0 | Verweis | 29 | 8.1 | Spillner/Linz → Teststufen |
| V11 | P0 | Verweis | 30 | 8.3 | Spillner/Linz → Soll-Ist-Prüfung |
| V12 | P0 | Verweis | 27 | 7.5 | OWASP Top 10 → Sicherheit |
| V13 | P0 | Verweis | 27 | 7.5 | W3C CSP → Sicherheitsheader |
| V14 | P0 | Verweis | 14 | 4.1 | Sommerville → Iterative Entwicklung |
| V15 | P0 | Verweis | 19 | 5.4 | Sommerville → Wartbarkeit |
| P1-1 | P1 | Erweiterung | 12 | nach 3.4 | Datenmodell-Erklärung |
| P1-2 | P1 | Erweiterung | 9 | 2.5 | Nutzungsbeschreibung erweitern |
| P1-3 | P1 | Hinweis | – | – | Seitenumfang kürzen (34 → ≤20) |
| P2-1 | P2 | Erweiterung | 13 | 3.7 | Service Worker beschreiben |
| P2-2 | P2 | Erweiterung | 12 | 3.4 | AppSettings erwähnen |
| P2-3 | P2 | Erweiterung | 12 | 3.3 | TimetablePreset erwähnen |
| P2-4 | P2 | Erweiterung | 18 | 5.2 | PostHog im Fließtext erwähnen |
| P2-5 | P2 | Erweiterung | 27 | 7.5 | Middleware konkret benennen |
| P3-1 | P3 | Quelle | 33 | 10.4 | Balzert ergänzen (optional) |
| P3-2 | P3 | Quelle | 33 | 10.4 | Kleuker ergänzen (optional) |

---

<div class="besteht">

## Bereits vorhanden (keine Aktion nötig)

- **Fußnote 1** (S. 6): W3C Push API ✓
- **Quellenverzeichnis**: Sommerville, Krug, Spillner/Linz, Nielsen, RFC 8292, RFC 5861, W3C Push API, W3C Service Workers, W3C CSP, OWASP Top 10 ✓
- **SMART-Ziele** in Kap. 2.6 und Soll-Ist in Kap. 8.3 ✓
- **Meilensteine, Gantt, Netzplan** in Kap. 4 ✓
- **Use-Case, Klassen-, Objektdiagramm** in Kap. 6 ✓
- **Lessons Learned** als 7.7 ✓
- **Hosting** als 3.9 ✓
- **15-Minuten-Begründung** als 3.8 ✓
- **Entwicklungsversionen** (V1/V2/V3) in 4.2 ✓
- **Fazit und Ausblick** in Kap. 9 ✓

</div>
