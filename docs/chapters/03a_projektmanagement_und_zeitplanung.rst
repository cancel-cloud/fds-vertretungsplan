Projektmanagement und Zeitplanung
=====================================

Das Projekt wurde iterativ entwickelt: ausprobieren, Probleme erkennen,
nächsten Meilenstein ableiten. [#s03a_1]_ Ein formales Vorgehensmodell war bei
einem Einzelprojekt nicht sinnvoll. Änderungen wurden in kleinen Schritten
umgesetzt, automatisiert getestet und bei Erfolg übernommen.

Entwicklungsphasen und Vorgängerversionen
-----------------------------------------

Das Thema wurde am 31. Januar 2025 formal eingereicht. Die eigentliche
Implementierung begann im August 2025 - also mehrere Monate nach der
Einreichung, nachdem der konzeptionelle Rahmen bereits feststand.

**Version 1 – Statische Seite (August/September 2025)**

Die erste Version war eine rein statische Website ohne Backend. Die
Datumsauswahl erfolgte über URL-Parameter; die Vertretungsdaten wurden
direkt im Browser von der WebUntis-Schnittstelle abgerufen. Diese Version
zeigte schnell ihre Grenzen: Eine Filterung nach eigenem Stundenplan war
technisch nicht möglich. Wer die Seite öffnete, sah alle Vertretungen auf
einmal - ungefiltert, ohne Personalisierung. Die Bedienbarkeit entsprach
damit kaum dem angestrebten Mehrwert gegenüber WebUntis selbst.

**Version 2 – Next.js, öffentlich, ohne Authentifizierung (September–Oktober 2025)**

Der nächste Ansatz setzte auf Next.js als Framework, verzichtete aber noch
auf jede Form von Nutzerkonten oder Backend-Logik. Die gesamte Verarbeitung
fand im Frontend statt. Mit wachsendem Funktionsumfang wurden die strukturellen
Schwächen dieses Ansatzes deutlich: Es gab keine klare Komponentenstruktur,
keine API-Schicht und keine Trennung von Daten und Darstellung. Neuen Code
einzufügen bedeutete zunehmend, bestehende Teile zu destabilisieren. Der
Aufwand für Pflege und Erweiterung überstieg den Nutzen einer inkrementellen
Weiterentwicklung.

**Version 3 – Vollständiger Neustart mit sauberer Architektur (ab Mitte November 2025)**

Die Entscheidung für einen vollständigen Neustart fiel bewusst: Erst das
Datenmodell definieren, dann die API-Schicht aufbauen, dann das Frontend.
Authentifizierung, Rollen, Caching und Push-Benachrichtigungen wurden von
Anfang an als Bestandteile des Systems eingeplant - nicht nachträglich
angehängt. Diese Version ist die aktuelle, produktiv eingesetzte Anwendung.

Die Versionswechsel waren keine Fehlschläge, sondern Teil eines iterativen
Erkenntnisprozesses: Jede Version klärte Anforderungen, die in der nächsten
sauber umgesetzt werden konnten.

Arbeitsweise: Try-and-Error mit klaren Meilensteinen
----------------------------------------------------

.. list-table:: Zentrale Meilensteine mit Problem, Entscheidung und Ergebnis
   :header-rows: 1
   :widths: 12 28 24 36

   * - Meilenstein
     - Fokus
     - Ausgangsproblem
     - Ergebnis
   * - M1
     - Grundidee und MVP
     - Erst war nur klar, dass Vertretungen mobil besser sichtbar werden sollen.
     - Öffentliche Startseite, erste Datumswahl und die Grundstruktur des Projekts standen.
   * - M2
     - API und Datenrobustheit
     - Der Datenabruf musste trotz Upstream-Schwankungen verlässlich funktionieren.
     - API-Proxy, Validierung, Retry-Logik, Rate-Limit und Fehlerpfade wurden aufgebaut.
   * - M3
     - Web-Bereitstellung und Nutzerfluss
     - Aus einer reinen Anzeige musste eine nutzbare Webanwendung mit Konto, Rollen und Dashboard werden.
     - Registrierung, Admin-Setup, Onboarding und Dashboard wurden zu einem geführten Ablauf verbunden.
   * - M4
     - Push-Notifications
     - Relevante Änderungen sollten mit Mehrwert gemeldet werden, ohne Nutzer zu spammen.
     - QStash-Dispatch, Delta-Logik und zielgerichtete Push-Tests wurden umgesetzt.
   * - M5
     - Dokumentation und Abgabe
     - Der Projektstand musste nachvollziehbar, prüfungstauglich und formal sauber beschrieben werden.
     - Kapitelstruktur, Diagramme, Gantt, Netzplan und Ergebnisbewertung wurden zusammengeführt.

.. raw:: latex

   \needspace{20\baselineskip}

Gantt-Plan mit Meilensteinen
----------------------------

Das Gantt-Diagramm zeigt denselben Verlauf in zeitlicher Form.

.. mermaid::

   gantt
       title BLL Projektzeitplan Vertretungsplan
       dateFormat  YYYY-MM-DD
       axisFormat  %b %y

       section Orientierung und frühe Prototypen
       Themenidee und erste Recherche          :a0, 2025-08-01, 20d
       Version 1 – Statische Seite             :a1, 2025-08-21, 25d
       Version 2 – Next.js ohne Auth           :a2, 2025-09-15, 45d

       section Neustart und Kernentwicklung (V3)
       M1 Grundidee, MVP, Neustart             :a3, 2025-11-15, 10d
       MVP sichtbar                            :milestone, m1, 2025-11-25, 0d
       M2 API und Datenrobustheit              :a4, 2025-11-25, 12d
       API stabil                              :milestone, m2, 2025-12-07, 0d
       M3 Web-Bereitstellung, Nutzerfluss      :a5, 2025-12-07, 14d
       Hosting und Nutzerfluss belastbar       :milestone, m3, 2025-12-21, 0d
       M4 Push-Notifications                   :a6, 2025-12-21, 10d
       Push funktioniert                       :milestone, m4, 2025-12-31, 0d

       section Dokumentation (Q4)
       Kapitelstruktur und Entwurf             :a7, 2026-01-01, 21d
       Überarbeitung und Feinschliff           :a8, 2026-01-22, 35d
       Endabgabe                               :milestone, m5, 2026-03-01, 0d

Neue Anforderungen standen nicht am Anfang vollständig fest. Erst im Verlauf
wurden aus der Grundidee ein webfähiger Nutzerfluss und später ein
sinnvoller Push-Prozess.

Netzplan und kritischer Pfad
----------------------------

Der Netzplan zeigt, welche Schritte aufeinander aufbauen und warum einzelne
Themen später als erwartet entstanden sind.

.. mermaid::

   flowchart LR
       V1["V1 Statische Seite\n(erster Prototyp)"] -->|"verworfen:\nkein Filtering"| V2["V2 Next.js öffentlich\n(zweiter Prototyp)"]
       V2 -->|"verworfen:\nfehlende Erweiterbarkeit"| A["A Produktidee und Anforderungen schärfen"]
       A --> B["B MVP für Anzeige und Datum"]
       B --> C["C Datenabruf im Hook und Client-Cache"]
       C --> D["D API-Proxy mit Retry und Rate-Limit"]
       D --> E["E Dashboard als persönlicher Einstieg"]
       E --> F["F Registrierung, Admin-Setup, Onboarding"]
       F --> G["G Hosting und öffentliche Web-URL"]
       G --> H["H QStash-Dispatch für Push"]
       H --> I["I Tests, Doku und PDF-Abgabe"]

       D --> J["J Filterlogik und Datenaufbereitung"]
       H --> K["K Push-Tests und Benutzerverwaltung"]
       J --> E
       K --> I

       classDef critical fill:#ffe8e8,stroke:#c62828,stroke-width:2px;
       classDef normal fill:#f5f5f5,stroke:#616161,stroke-width:1px;
       classDef proto fill:#fff8e1,stroke:#f9a825,stroke-width:1px;
       class A,B,C,D,E,F,G,H,I critical;
       class J,K normal;
       class V1,V2 proto;

Der kritische Pfad verläuft vom MVP über API-Stabilität und Nutzerfluss
bis zum Push-Dispatch. Push konnte erst sinnvoll werden, nachdem Hosting und
API-Stabilität bereits gelöst waren.

Austausch und Rückmeldungen
----------------------------

Die Projektarbeit wurde durch regelmäßigen Austausch begleitet. Über das
gesamte Projekt fanden laufende mündliche Rückmeldungen durch die
betreuenden Lehrkräfte Alexander Rhode und Michael Knobl statt. Förmliche
Gespräche mit schriftlichen Notizen konzentrierten sich auf die zweite
Projekthälfte und betrafen konkret: die Kapitelstruktur der Dokumentation,
fehlende inhaltliche Punkte sowie inhaltliche Verbesserungen einzelner
Abschnitte.

Darüber hinaus wurde die Anwendung von Mitschülerinnen und Mitschülern
des Informatik-Kurses im Schulalltag getestet. Da sie unterschiedliche
Smartphones verwendeten, traten Darstellungsprobleme auf mehreren
Bildschirmgrößen auf: Texte und Tabellen wurden abgeschnitten,
Layout-Elemente verschoben sich, und Schaltflächen lagen teilweise
außerhalb des sichtbaren Bereichs. Diese Probleme wurden im Verlauf
der Meilensteine M3 und M4 behoben. Zusätzlich entstanden aus den
Rückmeldungen konkrete Feature-Requests, die im ursprünglichen Entwurf
nicht vorgesehen waren: ein Dark Mode sowie eine verbesserte
Datumsnavigation. Kleinere Detailwünsche wurden laufend eingearbeitet.

Einige technische Kernentscheidungen entstanden nicht durch externe
Rückmeldungen, sondern aus eigener Initiative: die Delta-Logik für den
Push-Prozess, die Erschließung der WebUntis-Schnittstelle per
Browser-Netzwerkanalyse, das Rollenkonzept mit USER- und ADMIN-Berechtigungen
sowie die Wahl von QStash als externem Scheduler. Diese Entscheidungen
sind im Pflichtenheft (Kapitel 3) begründet.

Methodisches Vorgehen
----------------------

**Iteratives Vorgehen als bewusste Wahl**

Für ein Einzelprojekt ohne festes Anforderungsdokument wäre ein klassisches
Wasserfallmodell nicht geeignet gewesen. Stattdessen wurde iterativ
vorgegangen: Erst eine funktionierende Basis schaffen, dann schrittweise
Funktionen ergänzen, testen und bei Bedarf neu bewerten. Die drei
Entwicklungsversionen (V1–V3) sind Ausdruck dieses Prozesses, nicht Zeichen
von Planlosigkeit - jede Version klärte Anforderungen, die in der nächsten
sauber umgesetzt wurden.

**Anforderungsermittlung aus dem Schulalltag**

Die Anforderungen wurden nicht aus der Literatur abgeleitet, sondern aus
konkreter Alltagserfahrung: der täglich unbefriedigenden Nutzung von
WebUntis, Rückmeldungen von Mitschülerinnen und Mitschülern über fehlende
Filterbarkeit sowie einer systematischen Analyse der Schwachstellen der
bestehenden Anzeige. Dieser Ausgangspunkt machte die Anforderungen greifbar
und prüfbar.

**Entscheidungsvalidierung durch Tests und Rückmeldungen**

Technische Entscheidungen wurden nicht nur intuitiv getroffen, sondern durch
automatisierte Tests abgesichert (34 Testsuiten, 134 Testfälle). Rückmeldungen
aus dem Tester-Kreis flossen in konkrete Verbesserungen ein - etwa bei
Darstellungsproblemen auf verschiedenen Bildschirmgrößen oder beim
Wunsch nach einem Dark Mode. Förmliche Gespräche mit den betreuenden
Lehrkräften dienten zur inhaltlichen Orientierung in der Dokumentationsphase.

**Reverse-Engineering als Informatik-Methode**

Die WebUntis-Schnittstelle bietet keine öffentliche API-Dokumentation.
Der Zugang zu den Vertretungsdaten wurde durch systematisches Beobachten
des Netzwerkverkehrs im Browser erschlossen: Welche Endpunkte werden
aufgerufen? Mit welchen Parametern? Welche Antwortstrukturen kommen zurück?
Dieses Vorgehen - Hypothese aufstellen, Parameter variieren, Antwort
auswerten - entspricht einer klassischen informatischen Analysemethode und
verlief ohne größere Hindernisse.

**Eigenständige Entscheidungen vs. rückmeldungsgetriebene Änderungen**

Das Projekt unterscheidet zwischen zwei Kategorien von Entscheidungen:
Solche, die aus eigener fachlicher Überlegung entstanden (Delta-Logik,
Rollenkonzept, QStash-Integration, Datenbankmodell), und solche, die auf
externe Rückmeldungen zurückgehen (Dark Mode, responsive Layout,
Datumsnavigation). Erstere sind im Pflichtenheft begründet; letztere
dokumentieren, dass das System im laufenden Betrieb auf reale Nutzung
reagiert hat.

.. [#s03a_1] Vgl. Sommerville (2015), Kap. 2: Softwareprozesse - iterative
   Entwicklung als Alternative zum Wasserfallmodell.
