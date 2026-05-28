# BLL-Präsentation: FDS Vertretungsplan

## Folie 1: Titel + Leitfrage

**Titel:** FDS Vertretungsplan - eine personalisierte Vertretungsplan-App

**Bullets:**
- Praktische Informatik an der Friedrich-Dessauer-Schule Limburg
- Ausgangspunkt: WebUntis-Daten nutzbarer und persönlicher machen
- Leitfrage: Wie kann eine Web-App Vertretungsdaten so aufbereiten, dass nur relevante Änderungen sichtbar und per Push meldbar werden?
- Schwerpunkt: Datenverarbeitung, Matching, Persistenz und Benachrichtigungssystem

**Speaker Notes:**
Ich stelle mein BLL-Projekt "FDS Vertretungsplan" vor. Es geht nicht darum, WebUntis zu ersetzen, sondern vorhandene Vertretungsdaten besser nutzbar zu machen. Die Leitfrage ist, wie aus einer allgemeinen Vertretungsliste eine persönliche, technisch robuste Anwendung wird. Deshalb liegt der Fokus dieser Präsentation auf Informatik-Themen: Datenmodell, API-Design, Matching-Algorithmus, Push-Deduplizierung, Sicherheit und Tests.

**Suggested Visual:**
Titelbild mit einer kompakten Architektur-Miniatur: WebUntis links, App in der Mitte, persönliche Benachrichtigung rechts.

**Relevante File References:**
- `README.md`
- `docs/chapters/01_einleitung_und_motivation.rst`
- `docs/presentation/diagrams/architecture.mmd`

## Folie 2: Ausgangsproblem

**Titel:** Vom allgemeinen Plan zur persönlichen Relevanz

**Bullets:**
- WebUntis liefert eine digitale, aber allgemeine Vertretungsliste
- Für Lernende ist die relevante Information oft in langen Tabellen versteckt
- Mobile Nutzung, Suche und persönliche Filterung sind zentrale Alltagspunkte
- Die App reduziert Suchaufwand, ohne eine neue Datenquelle zu erfinden

**Speaker Notes:**
Das Ausgangsproblem ist praktisch: Der Vertretungsplan existiert bereits digital, aber die Nutzung ist nicht automatisch personalisiert. Wer wissen möchte, ob er selbst betroffen ist, muss die Liste durchsuchen oder warten, bis der relevante Eintrag erscheint. Mein Projekt setzt an dieser Stelle an: Die WebUntis-Daten bleiben die Quelle, aber die App verarbeitet sie so, dass Nutzer schneller zu den für sie relevanten Informationen kommen.

**Suggested Visual:**
Vorher/Nachher-Grafik: lange allgemeine Tabelle gegenüber personalisierter Ergebnisliste.

**Relevante File References:**
- `docs/chapters/01_einleitung_und_motivation.rst`
- `README.md`
- `src/components/stundenplan/dashboard-client.tsx`

## Folie 3: Zielsetzung und Anforderungen

**Titel:** Anforderungen an eine alltagstaugliche Schul-App

**Bullets:**
- Öffentliche Ansicht für alle Vertretungen
- Persönlicher Bereich mit Account und eigenem Stundenplan
- Relevanz-Matching nach Tag, Stunde, Woche, Fach und Lehrer
- Web Push für neue oder geänderte relevante Vertretungen
- Robuste Fehlerfälle, Datenschutz und wartbare Struktur

**Speaker Notes:**
Die Anforderungen teilen sich in öffentliche und persönliche Funktionen. Gäste können alle Vertretungen sehen. Angemeldete Nutzer können einen Stundenplan hinterlegen und bekommen nur passende Vertretungen angezeigt. Für Push-Benachrichtigungen ist wichtig, dass nicht jede Abfrage eine Meldung auslöst. Die App muss erkennen, ob sich der relevante Zustand wirklich geändert hat. Außerdem müssen Fehler von WebUntis, ungültige Eingaben und Sicherheitsfragen sauber behandelt werden.

**Suggested Visual:**
Use-Case-Diagramm mit Guest, User, Admin, WebUntis und QStash.

**Relevante File References:**
- `README.md`
- `docs/presentation/diagrams/use_case.mmd`
- `src/app/page.tsx`
- `src/app/stundenplan/dashboard/page.tsx`
- `src/app/api/timetable/route.ts`

## Folie 4: Fachlicher Informatikbezug

**Titel:** Informatik statt reiner Oberfläche

**Bullets:**
- Systementwurf mit Frontend, API-Routen, Datenbank und externen Diensten
- Algorithmische Zuordnung von Vertretungen zu Stundenplaneinträgen
- Persistente Datenmodellierung mit Relationen und Constraints
- Nebenläufige Verarbeitung im Dispatch über mehrere Nutzer und Zieldaten
- Sicherheits- und Qualitätsaspekte als Teil der Umsetzung

**Speaker Notes:**
Der Informatikbezug liegt vor allem unter der Oberfläche. Die App besteht aus mehreren Schichten: Browser, Next.js-Routen, Prisma, PostgreSQL, WebUntis, QStash und Web Push. Dazu kommt ein Matching-Algorithmus, der Daten aus zwei Quellen kombiniert: Vertretungen von WebUntis und den persönlichen Stundenplan aus der Datenbank. Auch die Push-Logik ist informatisch relevant, weil sie Zustände vergleicht und doppelte Benachrichtigungen verhindern muss.

**Suggested Visual:**
Vier technische Säulen: Architektur, Datenmodell, Matching, Push-Dedupe.

**Relevante File References:**
- `src/lib/schedule-matching.ts`
- `src/lib/notification-state.ts`
- `src/app/api/internal/push/dispatch/route.ts`
- `prisma/schema.prisma`

## Folie 5: Systemarchitektur

**Titel:** Architektur: Next.js als Integrationspunkt

**Bullets:**
- Browser nutzt Dashboard, Einstellungen, Stundenplan-Editor und Admin-Seiten
- Next.js App Router stellt UI und API-Routen bereit
- Prisma verbindet die API mit PostgreSQL
- WebUntis ist die externe Datenquelle für Vertretungen
- QStash triggert geplante Push-Dispatches; Service Worker empfängt Push

**Speaker Notes:**
Die Architektur ist bewusst webzentriert. Im Browser laufen die UI und der Service Worker. Die Next.js-App stellt Seiten und API-Routen bereit. Über Prisma werden Nutzer, Stundenpläne, Push-Subscriptions und Benachrichtigungszustände gespeichert. WebUntis liefert die Rohdaten. QStash ruft zyklisch die interne Dispatch-Route auf, damit Benachrichtigungen auch ohne offene App geprüft werden können. Die konkrete Deployment-Topologie außerhalb von Next.js, PostgreSQL, QStash und Web Push ist nicht vollständig aus der Codebase ersichtlich.

**Suggested Visual:**
`architecture.mmd` als zentrales Architekturdiagramm.

**Relevante File References:**
- `docs/presentation/diagrams/architecture.mmd`
- `src/app/api/substitutions/route.ts`
- `src/app/api/internal/push/dispatch/route.ts`
- `src/lib/prisma.ts`
- `public/sw.js`

## Folie 6: Datenmodell

**Titel:** Datenmodell: Nutzer, Stundenplan und Benachrichtigungszustand

**Bullets:**
- `User` ist Zentrum für Rolle, Onboarding, Einstellungen und Relationen
- `TimetableEntry` speichert persönliche Fächer, Lehrer, Räume, Stunden und Wochenmodus
- `TeacherDirectory` normalisiert Lehrerkürzel und Namen für Admin-Pflege
- `PushSubscription` speichert Endgeräte für Web Push
- `NotificationState` und `NotificationFingerprint` speichern Dedupe-Zustände

**Speaker Notes:**
Das Datenmodell trennt fachliche Daten und technische Zustände. Der persönliche Stundenplan hängt am Nutzer. Lehrer können zusätzlich über ein Verzeichnis verwaltet werden. Push-Subscriptions sind pro Nutzer gespeichert und enthalten die technischen Schlüssel des Browsers. Für die Anti-Spam-Logik gibt es zwei Tabellen: den letzten bekannten Zustand pro Nutzer und Datum sowie historische Fingerprints mit Unique Constraint. Dadurch kann die App erkennen, ob ein relevanter Zustand neu, gleich oder verschwunden ist.

**Suggested Visual:**
`er_model.mmd` mit Kardinalitäten.

**Relevante File References:**
- `prisma/schema.prisma`
- `docs/presentation/diagrams/er_model.mmd`
- `src/lib/push-service.ts`
- `src/app/api/timetable/route.ts`

## Folie 7: Datenfluss WebUntis -> App

**Titel:** WebUntis-Daten werden normalisiert und abgesichert

**Bullets:**
- API-Route baut WebUntis-Request aus Datum, Schule und Konfiguration
- WebUntis-Antwort wird gecacht, rate-limited und bei Fehlern teilweise stale ausgeliefert
- Rohzeilen werden zu `ProcessedSubstitution` normalisiert
- Typen wie Entfall, Raumänderung oder Vertretung werden aus Text und CSS-Klassen abgeleitet
- Demo-Modus nutzt gespeicherte Demo-Daten statt Upstream-Fetch

**Speaker Notes:**
Der Datenfluss startet in der Route `/api/substitutions`. Dort wird das Datum normalisiert, die Anfrage begrenzt und ein WebUntis-Request gebaut. Die eigentliche Upstream-Kommunikation liegt in `untis-client.ts`, inklusive Retry-Logik. Danach verarbeitet `data-processing.ts` die Rohdaten: HTML wird entfernt, Umlaute werden decodiert, Räume und Lehrer werden bereinigt und der Typ der Vertretung wird klassifiziert. Das ist wichtig, weil der Matching-Algorithmus mit normalisierten Feldern arbeitet.

**Suggested Visual:**
Pipeline: Request -> WebUntis -> Cache/Retry -> Normalisierung -> UI/Matching.

**Relevante File References:**
- `src/app/api/substitutions/route.ts`
- `src/lib/untis-client.ts`
- `src/lib/data-processing.ts`
- `src/app/api/substitutions/route-utils.ts`

## Folie 8: Matching-Algorithmus

**Titel:** Matching: Welche Vertretung betrifft meinen Stundenplan?

**Bullets:**
- Prüft zuerst Wochentag und gerade/ungerade Kalenderwoche
- Zerlegt WebUntis-Stundenangaben in Perioden und prüft Überlappung
- Fach oder Lehrer müssen mit dem Stundenplaneintrag übereinstimmen
- Raumtreffer erhöht die Confidence auf `high`
- Ergebnis ist deterministisch und testbar

**Speaker Notes:**
Der Matching-Algorithmus verbindet zwei Datenwelten. WebUntis liefert Vertretungen, der Nutzer speichert seinen Stundenplan. Eine Vertretung ist nur relevant, wenn der Wochentag passt, der Wochenmodus passt, die Stunden sich überschneiden und mindestens Fach oder Lehrer übereinstimmen. Ein Raumtreffer ist optional, erhöht aber die Sicherheit des Treffers. Damit vermeidet die App, dass ein Nutzer jede allgemeine Änderung sieht, und kann stattdessen persönliche Treffer anzeigen.

**Suggested Visual:**
Entscheidungsbaum oder Filterkette: Datum -> Woche -> Stunde -> Fach/Lehrer -> Confidence.

**Relevante File References:**
- `src/lib/schedule-matching.ts`
- `src/lib/timetable.ts`
- `src/lib/schedule-matching.test.ts`
- `docs/presentation/code_snippets.md`

## Folie 9: Push-Benachrichtigungen + Fingerprint-Dedupe

**Titel:** Push nur bei relevanten Änderungen

**Bullets:**
- QStash ruft die interne Dispatch-Route im Zeitfenster auf
- Pro Nutzer werden Stundenplan, Push-Subscriptions und Ziel-Schultage geladen
- Relevante Matches werden canonicalisiert und als SHA-256-Fingerprint gespeichert
- Delta-Aktion entscheidet: senden, überspringen oder Zustand löschen
- Service Worker zeigt Notification und navigiert beim Klick ins Dashboard

**Speaker Notes:**
Die Push-Logik soll informieren, aber nicht spammen. Deshalb wird pro Nutzer und Zieldatum aus den relevanten Matches ein stabiler Fingerprint gebaut. Ist der Fingerprint neu oder verändert, wird gesendet. Ist er gleich, wird übersprungen. Gibt es keine Matches mehr, wird der gespeicherte Zustand gelöscht. Das ist eine klassische Zustandsvergleichslogik. Die eigentliche Anzeige übernimmt der Service Worker im Browser.

**Suggested Visual:**
`sequence_push_dispatch.mmd` als Sequenzdiagramm.

**Relevante File References:**
- `src/app/api/internal/push/dispatch/route.ts`
- `src/lib/notification-state.ts`
- `src/lib/push.ts`
- `public/sw.js`
- `docs/presentation/diagrams/sequence_push_dispatch.mmd`

## Folie 10: Sicherheit und Datenschutz

**Titel:** Schutz durch Begrenzung, Authentifizierung und minimale Daten

**Bullets:**
- Secrets liegen laut README in `.env.local` oder Secret Manager, nicht im Repo
- Mutierende Cookie-Auth-APIs erzwingen in Produktion Same-Origin-Prüfung
- Push-Dispatch verlangt QStash-Signatur oder Bearer-Secret-Fallback
- `/api/substitutions` nutzt Rate-Limit und Cache gegen Lastspitzen
- Persönliche Daten sind Nutzerkonto, Stundenplan und Push-Endpoint; Lösch-/Exportkonzept ist nicht aus der Codebase ersichtlich

**Speaker Notes:**
Sicherheit betrifft hier mehrere Ebenen. Für schreibende API-Routen wird in Produktion die Herkunft über Origin oder Referer geprüft. Der geplante Push-Dispatch ist nicht öffentlich offen, sondern erwartet QStash-Signatur oder ein Secret. Außerdem begrenzt die Substitutions-API die Anfragefrequenz und cached Antworten. Datenschutzseitig verarbeitet die App persönliche Stundenplandaten und Push-Endpunkte. Ein formales Lösch- oder Datenexportkonzept ist aus den gelesenen Dateien nicht eindeutig ersichtlich und sollte in der Reflexion als Grenze genannt werden.

**Suggested Visual:**
Security-Layer-Diagramm: Env-Secrets, Auth, Same-Origin, Dispatch-Secret, Rate-Limit.

**Relevante File References:**
- `README.md`
- `src/lib/security/request-integrity.ts`
- `src/app/api/internal/push/dispatch/route.ts`
- `src/app/api/substitutions/route.ts`
- `src/app/api/push/subscribe/route.ts`

## Folie 11: Tests und Qualitätssicherung

**Titel:** Qualität: Unit-, API- und UI-nahe Tests

**Bullets:**
- Vitest mit jsdom und Testing Library ist eingerichtet
- Tests decken Matching, Timetable-Validierung und Notification-Deltas ab
- API-Tests prüfen WebUntis-Fehler, Cache, Rate-Limit und Dispatch-Verhalten
- Komponenten-Tests prüfen Dashboard-, Admin-, Push- und Onboarding-Flows
- Manuelle Screenshots ergänzen die technische Testabdeckung für das Kolloquium

**Speaker Notes:**
Die Qualitätssicherung ist nicht nur ein Build-Schritt, sondern an zentralen Stellen im Projekt sichtbar. Matching und Timetable-Validierung haben gezielte Tests, weil dort fachliche Logik steckt. Die API-Tests prüfen besonders Fehlerfälle: Upstream-Ausfälle, Retry, Demo-Modus, Rate-Limits und Push-Dispatch. UI-nahe Tests prüfen unter anderem Dashboard, Admin-Panel und Push-Aktivierung. Für die Präsentation brauche ich zusätzlich Screenshots, weil Tests alleine nicht zeigen, wie die App im Alltag aussieht.

**Suggested Visual:**
Testpyramide oder Matrix: Lib-Tests, API-Tests, Komponenten-Tests, manuelle Screenshots.

**Relevante File References:**
- `vitest.config.ts`
- `src/lib/schedule-matching.test.ts`
- `src/lib/notification-state.test.ts`
- `src/app/api/substitutions/route.test.ts`
- `src/app/api/internal/push/dispatch/route.test.ts`
- `src/components/stundenplan/dashboard-client.test.tsx`

## Folie 12: Reflexion, Grenzen und Ausblick

**Titel:** Reflexion: nützlich, aber abhängig von externen Daten

**Bullets:**
- Stärke: Persönliche Relevanz entsteht aus bestehender Datenquelle plus eigenem Stundenplan
- Grenze: Qualität hängt von WebUntis-Daten und stabiler Upstream-Erreichbarkeit ab
- Grenze: Matching arbeitet heuristisch mit Fach-/Lehrer-/Raumtexten
- Ausblick: bessere Admin-Auswertungen, Datenschutzprozesse, Monitoring und Importhilfen
- Nicht aus der Codebase ersichtlich: verbindliche Verfügbarkeit, offizieller WebUntis-Supportvertrag, produktive Betriebsmetriken

**Speaker Notes:**
In der Reflexion ist mir wichtig, ehrlich zu bleiben. Die App löst ein reales Nutzungsproblem, aber sie bleibt abhängig von WebUntis und der Qualität der gelieferten Daten. Das Matching ist deterministisch, aber nicht perfekt, weil Kürzel und Texte in externen Daten variieren können. Als Ausblick sehe ich vor allem bessere Betriebsbeobachtung, klarere Datenschutzprozesse und eventuell Importhilfen für Stundenpläne. Nicht aus der Codebase ersichtlich sind produktive Betriebsmetriken oder eine verbindliche Verfügbarkeitszusage.

**Suggested Visual:**
Tabelle mit drei Spalten: Erreicht, Grenzen, Nächste Schritte.

**Relevante File References:**
- `README.md`
- `src/lib/untis-client.ts`
- `src/lib/schedule-matching.ts`
- `src/app/api/substitutions/route.ts`
- `docs/presentation/screenshot_plan.md`
