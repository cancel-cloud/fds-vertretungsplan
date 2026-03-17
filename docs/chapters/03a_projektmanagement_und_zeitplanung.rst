Projektmanagement und Zeitplanung
=====================================

Das Projekt wurde iterativ entwickelt: ausprobieren, Probleme erkennen,
nächsten Meilenstein ableiten. Ein formales Vorgehensmodell war bei einem
Einzelprojekt nicht sinnvoll. Änderungen wurden in kleinen Schritten
umgesetzt, automatisiert getestet und bei Erfolg übernommen.

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
       axisFormat  %d.%m.

       section Produktbasis
       Problemverständnis und MVP             :a1, 2025-11-03, 10d
       MVP sichtbar                            :milestone, m1, 2025-11-14, 0d

       section Technische Stabilisierung
       API Proxy und Datenverarbeitung         :a2, 2025-11-17, 12d
       API stabil                              :milestone, m2, 2025-11-29, 0d

       section Webprodukt
       Registrierung Onboarding Dashboard      :a3, 2025-12-01, 14d
       Hosting und Nutzerfluss belastbar       :milestone, m3, 2025-12-15, 0d

       section Benachrichtigungen
       Push Dispatch und Tests                 :a4, 2025-12-16, 12d
       Push funktioniert                       :milestone, m4, 2025-12-28, 0d

       section Abschluss
       Doku Diagramme Review                   :a5, 2025-12-29, 13d
       Doku fertig                             :milestone, m5, 2026-01-11, 0d

Neue Anforderungen standen nicht am Anfang vollständig fest. Erst im Verlauf
wurden aus der Grundidee ein webfähiger Nutzerfluss und später ein
sinnvoller Push-Prozess.

Netzplan und kritischer Pfad
----------------------------

Der Netzplan zeigt, welche Schritte aufeinander aufbauen und warum einzelne
Themen später als erwartet entstanden sind.

.. mermaid::

   flowchart LR
       A["A Produktidee und Anforderungen schärfen"] --> B["B MVP für Anzeige und Datum"]
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
       class A,B,C,D,E,F,G,H,I critical;
       class J,K normal;

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
