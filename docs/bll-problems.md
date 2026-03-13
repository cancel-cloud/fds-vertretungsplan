# BLL-Dokumentation: Identifizierte Luecken

Dieses Dokument vergleicht die BLL-Anforderungen (Abitur-Outline), die aktuelle Projektdokumentation und den tatsaechlichen Code. Nur gut belegte Luecken sind aufgefuehrt.

---

## 1. Quellenarbeit ist duenn und nicht wissenschaftspropaedeut­isch

**What is missing**
Die Dokumentation (Kapitel 10 "Quellen") listet ausschliesslich projektinterne Artefakte (Repository, README, TODO) und Technologie-Dokumentationslinks (Next.js, React, Vitest etc.). Es fehlen jegliche Fachquellen zu Software-Engineering-Methodik, Web-Architektur, Push-Technologie, Caching-Strategien, Datenschutz oder vergleichbaren Schulprojekten. Es gibt keine Fussnoten oder Inline-Verweise im Text.

**Why it matters**
Die OAVO nennt "korrekte Literatur-/Quellenangaben" und "Rechercheumfang" als explizite Bewertungskriterien (§ 37 Abs. 5). Fuer die geforderte "wissenschaftspropaedeut­ische Qualitaet" der schriftlichen Ausarbeitung reichen reine API-Doc-Links nicht aus. Der Pruefungsausschuss erwartet den Nachweis, dass ueber die eigene Implementierung hinaus recherchiert wurde.

**Evidence from the outline**
Seite 5: "Für die schriftliche Ausarbeitung nennt die OAVO (beispielhaft, nicht abschließend) Kriterien wie [...] korrekte Literatur-/Quellenangaben, fachmethodische Angemessenheit, [...] Rechercheumfang und Nachweise von Arbeitskontakten/Kooperationen."

**Evidence from the codebase**
Das Projekt trifft zahlreiche Entscheidungen, die sich auf etablierte Konzepte stuetzen lassen: Stale-While-Revalidate (RFC 5861 / HTTP-Caching-Pattern), Content Security Policy (W3C-Spezifikation), VAPID / Web Push Protocol (RFC 8292), JWT-basierte Authentifizierung, Delta-basierte Benachrichtigungslogik, Rate Limiting (Token-Bucket-Variante). Fuer all diese Themen existiert Fachliteratur, die in der Dokumentation fehlt.

**How to find it in the codebase**
- Caching-Pattern: `src/app/api/substitutions/route.ts` (stale-if-error, LRU-Pruning)
- Push/VAPID: `src/lib/push-client.ts`, `public/sw.js`
- CSP: `src/middleware.ts`
- Rate Limiting: `src/lib/security/rate-limit.ts`

**How to improve the documentation**
- Kapitel 10 um mindestens 5-10 Fachquellen erweitern: z.B. RFC 8292 (VAPID), RFC 5861 (Stale-While-Revalidate), W3C Push API Specification, OWASP Security Headers, relevante Software-Engineering-Lehrbuecher (z.B. Sommerville "Software Engineering" oder vergleichbar).
- Inline-Verweise im Fliesstext ergaenzen, z.B. bei der Diskussion von Caching (Kapitel 03), Push-Architektur (Kapitel 03), Sicherheit (Kapitel 04/05).
- Wenn Schulinterne Leitfaeden fuer die BLL-Formalia existieren, diese ebenfalls referenzieren.

**Confidence**: High

---

## 2. Fachmethodische Einordnung des Vorgehens fehlt

**What is missing**
Kapitel 03a beschreibt den Arbeitsprozess ehrlich als "Try-and-Error mit klaren Meilensteinen." Es fehlt aber eine fachmethodische Einordnung: Welchem Software-Entwicklungsmodell aehnelt das Vorgehen? Warum wurde kein Wasserfallmodell, kein Scrum, kein Kanban gewaehlt? Inwiefern ist das beschriebene Vorgehen einer iterativ-inkrementellen Entwicklung zuzuordnen?

**Why it matters**
Die OAVO verlangt "fachmethodische Angemessenheit" als Bewertungskriterium. Der Pruefungsausschuss erwartet, dass das gewaehlte Vorgehen in den Kontext bekannter Methoden gestellt wird -- nicht als Lehrbuchnacherzaehlung, sondern als reflektierte Einordnung.

**Evidence from the outline**
Seite 5: "fachmethodische Angemessenheit" als Bewertungskriterium der schriftlichen Ausarbeitung.
Seite 6/8: "Dokumentation des Arbeitsprozesses so führen, dass die geforderte 'exakte und kritische' Prozessdarstellung [...] belegbar ist."

**Evidence from the codebase**
Das tatsaechliche Vorgehen laesst sich gut als iterativ-inkrementell beschreiben: Die Git-Historie zeigt inkrementelle Feature-Branches (mobile-ui, loading-speed-fix), die Meilensteine M1-M5 entsprechen typischen Inkrementen, und die Tatsache, dass Push erst nach stabilem API und Nutzerfluss angegangen wurde, zeigt eine bewusste Priorisierung.

**How to find it in the codebase**
- Git-Log: `git log --oneline` zeigt Feature-Branches und inkrementelle Entwicklung
- Meilensteine in `docs/chapters/03a_projektmanagement_und_zeitplanung.rst`
- Gantt-Diagramm in `docs/pm/gantt.mmd`

**How to improve the documentation**
In Kapitel 03a (Abschnitt 4.1 oder 4.2) 3-5 Saetze ergaenzen:
- Das Vorgehen als "iterativ-inkrementelle Entwicklung" einordnen.
- Kurz benennen, warum klassische Modelle (Wasserfall) nicht passen (Ein-Personen-Projekt, sich aendernde Anforderungen, schnelles Feedback noetig).
- Einen Satz wie: "Das Vorgehen entspricht damit einem leichtgewichtigen iterativen Ansatz, bei dem jeder Meilenstein ein funktionsfaehiges Inkrement des Gesamtsystems liefert."

**Confidence**: High

---

## 3. Datenschutz-/DSGVO-Betrachtung der eigenen Anwendung fehlt

**What is missing**
Die Dokumentation erwaehnt Datenschutz nur als Pflichtseite (Impressum/Datenschutz existieren, Kapitel 02 Abschnitt 2.4 Punkt 5; Kapitel 08 Abschnitt S4). Es fehlt eine inhaltliche Auseinandersetzung damit, welche personenbezogenen Daten die Anwendung selbst verarbeitet und welche Schutzmassnahmen getroffen wurden. Das ist keine generische Empfehlung -- die Anwendung verarbeitet tatsaechlich schutzwuerdige Daten.

**Why it matters**
Die OAVO fordert "Reflexion" und "selbststaendige Bearbeitung" des Themas. Da die Anwendung personenbezogene Schueler­daten im Schulkontext verarbeitet (E-Mail, Stundenplan, Push-Endpunkte, Nutzungsverhalten via PostHog), ist eine Datenschutzbetrachtung fachlich geboten und zeigt Problembewusstsein auf Abiturniveau.

**Evidence from the outline**
Seite 5: "die Aufgabenstellung selbstständig konzipiert, bearbeitet und reflektiert hat"
Seite 8: "Thema zu breit / fehlende Problemorientierung" als haeufiger Stolperstein -- umgekehrt heisst das, dass relevante Aspekte aktiv adressiert werden sollten, nicht ausgelassen.

**Evidence from the codebase**
Die Anwendung speichert folgende personenbezogene Daten:
- `User`: E-Mail, Passwort-Hash, Rolle, Onboarding-Zustand (`prisma/schema.prisma`)
- `TimetableEntry`: Persoenlicher Stundenplan mit Fach, Lehrer, Raum
- `PushSubscription`: Browser-Push-Endpunkte, User-Agent, Letzte Aktivitaet
- `NotificationFingerprint` / `NotificationState`: Welche Vertretungen wann gemeldet wurden
- PostHog-Analytics: Nutzungsverhalten, Geraetedaten (`src/lib/analytics/`)
- Passwort-Hashing mit bcrypt 12 Rounds (`src/lib/auth.ts`)
- Secure Cookies mit `__Secure-`-Prefix (`src/lib/auth.ts`)
- CSP-Header gegen XSS (`src/middleware.ts`)

**How to find it in the codebase**
- Datenmodell: `prisma/schema.prisma` (alle Modelle mit personenbezogenen Feldern)
- Auth/Hashing: `src/lib/auth.ts` (bcrypt, JWT)
- Analytics: `src/lib/analytics/`, `src/providers/posthog-provider.tsx`
- Security Headers: `src/middleware.ts`, `next.config.ts`

**How to improve the documentation**
In Kapitel 03 oder als eigener Unterabschnitt (z.B. 3.7 "Datenschutz und Datensicherheit") ergaenzen:
- Welche Kategorien personenbezogener Daten gespeichert werden (E-Mail, Stundenplan, Push-Tokens, Nutzungsstatistiken).
- Welche technischen Schutzmassnahmen bestehen (Passwort-Hashing mit bcrypt, HTTPS-Pflicht, Secure Cookies, CSP, Rate Limiting).
- Dass PostHog optional ist und deaktivierbar, bzw. welche Daten dorthin fliessen.
- Ein Satz zur Rechtsgrundlage oder zumindest zur Einschraenkung: "Eine vollstaendige DSGVO-Konformitaetspruefung war im Rahmen dieses Schulprojekts nicht leistbar, aber die genannten Massnahmen decken die wesentlichen technischen Anforderungen ab."

**Confidence**: High

---

## 4. Selbststaendigkeit und Werkzeugeinsatz nicht explizit dargestellt

**What is missing**
Die Dokumentation beschreibt nirgends explizit, welche Teile des Projekts selbststaendig erarbeitet wurden und welche Hilfsmittel eingesetzt wurden. Es wird nicht erwaehnt, ob und wie KI-Werkzeuge (z.B. Claude, ChatGPT, Copilot), Frameworks, Templates oder Bibliotheken als Ausgangspunkt dienten. Die Eigenleistung ist nicht abgegrenzt.

**Why it matters**
"Selbstständigkeit/Originalität" ist ein explizites Bewertungskriterium der OAVO. Gerade im Kontext aktueller KI-Werkzeuge ist eine ehrliche Einordnung der Eigenleistung erwartbar. Die OAVO verlangt zudem, dass "die Leistung oder wesentliche Teile nicht bereits anderweitig angerechnet wurden."

**Evidence from the outline**
Seite 5: "Selbstständigkeit/Originalität" als Bewertungskriterium.
Seite 2: "[...] die Leistung oder wesentliche Teile nicht bereits anderweitig angerechnet wurden."
Seite 5: "die Aufgabenstellung selbstständig konzipiert, bearbeitet und reflektiert hat"

**Evidence from the codebase**
Das Projekt nutzt sichtbar:
- shadcn/ui-Komponenten (vorgefertigte UI-Bausteine, erkennbar an `src/components/ui/`)
- Next.js-Boilerplate-Strukturen (App Router, Middleware-Konvention)
- Das Repository enthaelt ein `CLAUDE.md` und `.claude/`-Verzeichnisse, was auf den Einsatz von Claude Code hinweist
- Die Architekturentscheidungen (Delta-Logik, Caching-Strategie, Schedule-Matching) sind aber klar projektspezifisch und nicht aus Templates ableitbar

**How to find it in the codebase**
- UI-Bibliothek: `src/components/ui/` (shadcn/ui)
- KI-Hinweise: `CLAUDE.md`, `.claude/`-Verzeichnis im Root
- Eigenstaendige Logik: `src/lib/notification-state.ts`, `src/lib/schedule-matching.ts`, `src/lib/data-processing.ts`

**How to improve the documentation**
In Kapitel 01 (Einleitung) oder Kapitel 07 (Umsetzung) einen Abschnitt "Eigenleistung und Werkzeugeinsatz" ergaenzen (3-5 Saetze):
- Welche Frameworks und Bibliotheken genutzt wurden (Next.js, shadcn/ui, Prisma) und warum das die Eigenleistung nicht mindert (Architektur, Geschaeftslogik, Integration sind die Leistung).
- Ob und in welchem Umfang KI-Werkzeuge eingesetzt wurden (z.B. Code-Vorschlaege, Debugging-Hilfe).
- Was die zentrale Eigenleistung ist: Problemanalyse, Architekturentwurf, Datenfluss-Design, Push-Delta-Logik, Schedule-Matching-Algorithmus.

**Confidence**: High

---

## 5. Datenbankmodell und Persistenzschicht nicht erklaert

**What is missing**
Die Dokumentation erwaehnt Prisma nur als Teil des Kernstacks (Kapitel 04, Abschnitt 5.3 fehlt Prisma sogar) und zeigt es im Klassendiagramm als einzelne Box "Prisma" mit der Annotation "infrastructure." Das tatsaechliche Datenmodell mit 8 Tabellen, deren Beziehungen, Indizes und Designentscheidungen wird nirgends beschrieben.

**Why it matters**
Das Datenmodell ist eine zentrale Architekturentscheidung. Die OAVO verlangt "Nachvollziehbarkeit" und die Faehigkeit, "fachliches Wissen angemessen schriftlich darzustellen." Ein Informatik-BLL-Projekt, das seine Datenstrukturen nicht erklaert, laesst eine wesentliche Verstaendnisebene aus.

**Evidence from the outline**
Seite 5: "fachliches Wissen angemessen schriftlich [...] darstellen kann"
Seite 5: "Nachvollziehbarkeit" als Bewertungskriterium.
Seite 6: "Problem, Vorgehen/Methoden, Ergebnisse; wissenschaftspropädeutische Qualität; Dokumentation des Arbeitsprozesses" -- das Datenmodell gehoert zum "Vorgehen/Methoden"-Teil.

**Evidence from the codebase**
`prisma/schema.prisma` definiert 8 Modelle mit relevanten Designentscheidungen:
- `User` mit Role-Enum (USER/ADMIN) und Onboarding-Tracking
- `TimetableEntry` mit WeekMode (ALL/EVEN/ODD) und Duration statt End-Period -- eine bewusste Modellierungsentscheidung
- `NotificationFingerprint` + `NotificationState` als getrennte Tabellen (Audit-Trail vs. aktueller Zustand) -- das ist eine nicht-triviale Trennung
- `AppSettings` als Singleton-Pattern (id=1) fuer globale Konfiguration
- `TeacherDirectory` entkoppelt von Nutzerdaten (eigene Tabelle, isActive-Flag fuer Soft-Delete)
- Zusammengesetzte Indizes fuer Performance ([userId, weekday, startPeriod])

**How to find it in the codebase**
- Schema: `prisma/schema.prisma`
- Verwendung: `src/app/api/timetable/route.ts`, `src/app/api/internal/push/dispatch/route.ts`, `src/app/api/auth/register/route.ts`

**How to improve the documentation**
In Kapitel 05 (Code-Struktur) oder Kapitel 06 (UML) einen Abschnitt "Datenmodell" ergaenzen:
- Tabellenueberblick als Liste oder Tabelle (Modellname, Zweck, wichtigste Felder).
- 2-3 Designentscheidungen hervorheben: z.B. Trennung NotificationFingerprint/NotificationState, Duration statt End-Period bei TimetableEntry, Singleton-Pattern fuer AppSettings.
- Optional ein ER-Diagramm oder eine vereinfachte Darstellung der Beziehungen.

**Confidence**: High

---

## 6. Push-Notification-Delta-Logik nur oberflaechlich beschrieben

**What is missing**
Kapitel 03 (Abschnitt 3.4) und Kapitel 07 (Lesson Learned 3) erwaehnen die Delta-Logik kurz, aber erklaeren nicht den Algorithmus: wie der Fingerprint berechnet wird, was Kanonisierung bedeutet, wie die drei Zustaende (send/skip/clear) funktionieren, und wie das Lookahead-Fenster arbeitet. Das ist die technisch anspruchsvollste und originellste Eigenleistung des Projekts.

**Why it matters**
Die OAVO bewertet "Selbstständigkeit/Originalität" und "fachmethodische Angemessenheit." Die Delta-Logik ist der beste Beleg fuer beides: Sie loest ein reales Problem (Spam-Vermeidung bei Push-Notifications) mit einem durchdachten Algorithmus. Ohne Erklaerung kann der Pruefungsausschuss die Qualitaet dieser Leistung nicht bewerten.

**Evidence from the outline**
Seite 5: "Selbstständigkeit/Originalität" als Bewertungskriterium.
Seite 6: "Darstellung/Einordnung der Ergebnisse; Begründung der Methoden" als Kolloquiums-Kriterium -- die Delta-Logik muss also auch muendlich erklaerbar sein und sollte schriftlich vorbereitet werden.

**Evidence from the codebase**
`src/lib/notification-state.ts` implementiert:
- `computeNotificationFingerprint()`: SHA256-Hash aus userId + targetDate + kanonisierte Match-Schluessel
- `canonicalizeMatchKeys()`: Felder (group, hours, subject, teacher, type, room) werden normalisiert (uppercase, sortiert, dedupliziert), dann mit `||` verbunden
- `resolveNotificationAction()`: Drei-Zustaende -- `send` (neuer Fingerprint), `skip` (unveraendert), `clear` (keine Treffer mehr)
- `getSchoolDayTargetDates()`: Lookahead ueber 1-5 Schultage (Wochenenden ausgeschlossen)
- Tests in `src/lib/__tests__/notification-state.test.ts` belegen das Verhalten

**How to find it in the codebase**
- Kernlogik: `src/lib/notification-state.ts`
- Tests: `src/lib/__tests__/notification-state.test.ts`
- Integration: `src/app/api/internal/push/dispatch/route.ts`

**How to improve the documentation**
In Kapitel 03 (Abschnitt 3.4) oder Kapitel 07 (Lesson Learned 3) den Algorithmus in 4-6 Saetzen beschreiben:
- "Fuer jeden Nutzer und jeden Zieldatumstag wird ein SHA256-Fingerprint aus den relevanten Vertretungstreffern berechnet."
- "Die Treffer werden dafuer kanonisiert: Alle Felder in Grossbuchstaben, sortiert und dedupliziert, um Reihenfolge-Unterschiede zu eliminieren."
- "Beim naechsten Dispatch-Lauf wird der neue Fingerprint mit dem gespeicherten verglichen. Nur bei Aenderung wird eine Push-Nachricht gesendet (send); bei Gleichheit wird uebersprungen (skip); bei leeren Treffern wird der Zustand geloescht (clear)."
- "Das Lookahead-Fenster ist konfigurierbar (1-5 Schultage) und beruecksichtigt Wochenenden."

**Confidence**: High

---

## 7. Caching-Architektur nicht im Detail dokumentiert

**What is missing**
Die Dokumentation erwaehnt in Kapitel 02 (S3) und Kapitel 03 "Rate-Limit, Retry-Logik" und "Server-Cache", aber erklaert nicht die konkrete Caching-Strategie: In-Memory-Cache mit 30s TTL, Stale-While-Revalidate bei Upstream-Fehlern (30min), LRU-Pruning bei 200 Eintraegen, separate Cache-Keys fuer Demo-Modus.

**Why it matters**
Das Caching ist eine der zentralen technischen Entscheidungen, die die Robustheit des Systems gewaehrleisten. Es zeigt das Verstaendnis fuer verteilte Systeme und Fehlertoleranz -- genau das "fachliche Wissen", das die OAVO als Bewertungskriterium nennt.

**Evidence from the outline**
Seite 5: "fachliches Wissen angemessen schriftlich [...] darstellen kann"
Seite 6: "Problem, Vorgehen/Methoden, Ergebnisse" als Pruefungsgegenstand der schriftlichen Ausarbeitung.

**Evidence from the codebase**
`src/app/api/substitutions/route.ts` implementiert:
- `RESPONSE_CACHE_TTL_MS = 30_000` (30s primaerer Cache)
- `STALE_IF_ERROR_TTL_MS = 30 * 60 * 1000` (30min Stale-Daten bei Upstream-Fehler)
- `MAX_CACHE_ENTRIES = 200` mit zweistufiger Bereinigung (erst abgelaufen, dann LRU)
- HTTP-Header: `Cache-Control: public, max-age=30, s-maxage=30, stale-while-revalidate=60`
- `X-Data-Source`-Header (`fresh`, `cache`, `stale-cache`) fuer Transparenz
- Retry mit exponentiellem Backoff (3 Versuche, `2^(attempt-1) * 100ms`)

**How to find it in the codebase**
- Cache-Implementierung: `src/app/api/substitutions/route.ts` (oberer Dateibereich, Konstanten + `pruneCache()`)
- Retry-Logik: `src/lib/retry-utils.ts`

**How to improve the documentation**
In Kapitel 03 (z.B. als Unterabschnitt "3.x API-Caching und Fehlertoleranz") oder in Kapitel 05 bei der Beschreibung der Substitutions-Route 3-4 Saetze ergaenzen:
- "Die API cached Antworten in-memory mit einem TTL von 30 Sekunden. Bei Upstream-Fehlern werden zwischengespeicherte Daten bis zu 30 Minuten weiter ausgeliefert (Stale-While-Revalidate)."
- "Ein LRU-Mechanismus begrenzt den Cache auf maximal 200 Eintraege, um den Speicherverbrauch im Serverless-Betrieb zu kontrollieren."
- "Fehlgeschlagene Upstream-Anfragen werden bis zu dreimal mit exponentiellem Backoff wiederholt."

**Confidence**: High

---

## 8. Schedule-Matching-Algorithmus nicht erklaert

**What is missing**
Das Matching zwischen persoenlichem Stundenplan und Vertretungen -- die Kernfunktion des personalisierten Dashboards und der Push-Notifications -- wird in der Dokumentation nirgends beschrieben. Es ist weder in Kapitel 03 noch in Kapitel 05 oder 06 erklaert, wie die Anwendung entscheidet, welche Vertretungen fuer einen Nutzer relevant sind.

**Why it matters**
Dies ist die zentrale fachliche Logik des Projekts. Ohne Beschreibung des Matching-Algorithmus fehlt dem Pruefungsausschuss das Verstaendnis dafuer, wie die Anforderung "personalisierte Vertretungsanzeige" technisch umgesetzt wurde.

**Evidence from the outline**
Seite 5: "die Aufgabenstellung selbstständig konzipiert, bearbeitet und reflektiert hat"
Seite 6: "Begründung der Methoden" als Kolloquiums-Anforderung.

**Evidence from the codebase**
`src/lib/schedule-matching.ts` implementiert:
- Multi-Feld-Matching: Wochentag + Wochenmodus (ALL/EVEN/ODD) muessen uebereinstimmen
- Stunden-Ueberlappung: Vertretungsstunden werden aus WebUntis-Format ("5-7") geparst und gegen Stundenplan-Perioden verglichen
- Fach- ODER Lehrer-Match: Mindestens eines muss zutreffen (nicht Raum allein)
- Confidence-Scoring: `high` (Raum-Match oder Fach+Lehrer), `medium` (nur Fach oder nur Lehrer)
- Token-Normalisierung: Case-insensitive, Partial-Match (z.B. "KU" matched "KUNST")

**How to find it in the codebase**
- Kernlogik: `src/lib/schedule-matching.ts`
- Tests: `src/lib/__tests__/schedule-matching.test.ts`
- Verwendung Dashboard: `src/components/stundenplan/dashboard-client.tsx`
- Verwendung Push: `src/app/api/internal/push/dispatch/route.ts`

**How to improve the documentation**
In Kapitel 03 oder 05 einen Abschnitt "Matching-Logik" ergaenzen (3-5 Saetze):
- "Die Anwendung vergleicht Vertretungseintraege anhand von Wochentag, Stundenperiode, Fach und Lehrkraft mit dem persoenlichen Stundenplan."
- "Ein Treffer erfordert Wochentag- und Stunden-Uebereinstimmung plus mindestens einen Match bei Fach oder Lehrkraft."
- "Das Ergebnis wird mit einer Konfidenz (high/medium) bewertet, um unklare Treffer sichtbar zu machen."

**Confidence**: High

---

## 9. Arbeitskontakte und Kooperationen nicht dokumentiert

**What is missing**
Die Dokumentation erwaehnt keine Kontakte oder Kooperationen: keine Gespraeche mit Lehrkraeften ueber Anforderungen, kein Feedback von Mitschuelern als Tester, keinen Austausch mit der Schulverwaltung oder dem IT-Bereich der Schule. Auch die betreuende Lehrkraft (Alexander Rhode) wird nur auf dem Deckblatt genannt, nicht im Kontext von Beratungsterminen oder inhaltlichem Austausch.

**Why it matters**
Die OAVO nennt "Nachweise von Arbeitskontakten/Kooperationen" als explizites Bewertungskriterium. Selbst wenn das Projekt ueberwiegend allein umgesetzt wurde, zeigt die Dokumentation von Feedback-Runden oder Beratungsterminen Prozessreife.

**Evidence from the outline**
Seite 5: "Nachweise von Arbeitskontakten/Kooperationen" als Bewertungskriterium.
Seite 8: Unter der Checkliste fuer Betreuende: "Dokumentation des Arbeitsprozesses so führen, dass die geforderte 'exakte und kritische' Prozessdarstellung [...] belegbar ist."

**Evidence from the codebase**
Das Projekt adressiert ein reales Schulproblem (FDS Limburg), was nahelegt, dass Rueckmeldungen von Nutzern/Lehrkraeften existiert haben muessen. Die Git-Historie zeigt Features wie `mobile-ui` und `loading-speed-fix`, die typischerweise aus Nutzerfeedback entstehen.

**How to find it in the codebase**
- Schulbezug: `src/app/impressum/page.tsx`, `src/app/datenschutz/page.tsx`
- Nutzer-Feedback-getriebene Features: Git-Log (`git log --oneline`)

**How to improve the documentation**
In Kapitel 03a (Projektmanagement) oder Kapitel 07 (Umsetzung) 3-4 Saetze ergaenzen:
- Wann und wie oft Beratungstermine mit der betreuenden Lehrkraft stattfanden.
- Ob Mitschueler als Tester einbezogen wurden und welches Feedback daraus entstand.
- Ob es Kontakt zur Schulverwaltung oder IT gab (z.B. bezueglich WebUntis-Zugang oder Hosting).
- Falls kein nennenswerter externer Kontakt bestand, dies ehrlich benennen und begruenden.

**Confidence**: Medium (es ist unklar, ob Kontakte stattfanden aber nicht dokumentiert wurden, oder ob sie nicht stattfanden)

---

## 10. Authentifizierungs- und Sicherheitsarchitektur nur oberflaechlich

**What is missing**
Die Dokumentation erwaehnt CSP, Auth-Guards und Secure Cookies an mehreren Stellen (Kapitel 02 Abschnitt 2.6, Kapitel 04 Abschnitt 5.5, Kapitel 05 Datei-Tabelle), aber erklaert das Zusammenspiel nicht: JWT-Strategie statt Database-Sessions, doppeltes Rate-Limiting (pro IP + pro E-Mail-IP), Bootstrap-Admin-Pattern (erster Nutzer wird Admin), bcrypt-Konfiguration, Same-Origin-Pruefung bei Registrierung.

**Why it matters**
Sicherheit ist als SMART-Ziel S4 definiert und im Soll-Ist-Abgleich (Kapitel 08) als "erfuellt" markiert. Aber die Dokumentation belegt diese Aussage nur mit "CSP/Redirect-Guards in src/middleware.ts; Impressum/Datenschutz vorhanden." Fuer den Pruefungsausschuss fehlt die technische Tiefe, um die Qualitaet der Sicherheitsentscheidungen bewerten zu koennen.

**Evidence from the outline**
Seite 5: "Problem, Vorgehen/Methoden, Ergebnisse" als Pruefungsgegenstand.
Seite 5: "Nachvollziehbarkeit" als Bewertungskriterium.

**Evidence from the codebase**
Das Sicherheitskonzept ist in der Implementierung deutlich umfangreicher als dokumentiert:
- JWT statt DB-Sessions (`src/lib/auth.ts`, Zeile mit `strategy: 'jwt'`)
- Doppeltes Rate-Limiting bei Login: 20/IP und 8/email-IP pro 15min (`src/lib/auth.ts`)
- Doppeltes Rate-Limiting bei Registrierung: 10/IP und 5/email pro 15min (`src/app/api/auth/register/route.ts`)
- Bootstrap-Admin: Erster Nutzer mit `ADMIN_EMAILS[0]` wird Admin, danach regulaere Zuweisung (`src/app/api/auth/register/route.ts`)
- `enforceSameOrigin()` bei Formulareingaben (`src/lib/security/same-origin.ts`)
- QStash-Signaturverifikation fuer Push-Dispatch (`src/app/api/internal/push/dispatch/route.ts`)
- 11 CSP-Direktiven in Production, relaxiert in Development (`src/middleware.ts`)

**How to find it in the codebase**
- Auth-Konfiguration: `src/lib/auth.ts`
- Rate-Limiting: `src/lib/security/rate-limit.ts`
- Same-Origin: `src/lib/security/same-origin.ts`
- Auth Guards: `src/lib/auth/guards.ts`

**How to improve the documentation**
In Kapitel 03 oder 04 einen Abschnitt "Sicherheitsarchitektur" ergaenzen (4-6 Saetze):
- JWT-basierte Sessions (warum: Serverless-kompatibel, kein Session-Store noetig).
- Doppeltes Rate-Limiting gegen Brute-Force und Credential-Stuffing.
- CSP als Schutz gegen XSS mit umgebungsabhaengiger Strenge.
- Same-Origin-Pruefung bei allen schreibenden Endpunkten.
- Bootstrap-Admin-Pattern fuer die Ersteinrichtung ohne externe Konfiguration.

**Confidence**: High

---

## Zusammenfassung der Prioritaeten

| # | Thema | Impact | Aufwand |
|---|-------|--------|---------|
| 1 | Quellenarbeit erweitern | Sehr hoch | Mittel |
| 2 | Fachmethodische Einordnung | Hoch | Gering |
| 3 | Datenschutz-Betrachtung | Hoch | Gering-Mittel |
| 4 | Selbststaendigkeit/Werkzeugeinsatz | Hoch | Gering |
| 5 | Datenbankmodell erklaeren | Hoch | Mittel |
| 6 | Push-Delta-Logik dokumentieren | Hoch | Gering |
| 7 | Caching-Architektur dokumentieren | Mittel | Gering |
| 8 | Schedule-Matching erklaeren | Mittel | Gering |
| 9 | Arbeitskontakte dokumentieren | Mittel | Gering |
| 10 | Sicherheitsarchitektur vertiefen | Mittel | Gering-Mittel |

Die Punkte 1-4 betreffen direkte OAVO-Bewertungskriterien und haben den hoechsten Einfluss auf die Pruefungsbewertung. Die Punkte 5-8 betreffen technische Tiefe, die den fachlichen Anspruch der Arbeit belegt. Punkt 9-10 runden die Dokumentation ab.
