03a Projektmanagement und Zeitplanung
=====================================

Das Projekt wurde iterativ entwickelt: ausprobieren, Probleme erkennen,
naechsten Meilenstein ableiten. Ein formales Vorgehensmodell war bei einem
Einzelprojekt nicht sinnvoll. Aenderungen wurden in kleinen Schritten
umgesetzt, automatisiert getestet und bei Erfolg uebernommen.

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
     - Oeffentliche Startseite, erste Datumswahl und die Grundstruktur des Projekts standen.
   * - M2
     - API und Datenrobustheit
     - Der Datenabruf musste trotz Upstream-Schwankungen verlaesslich funktionieren.
     - API-Proxy, Validierung, Retry-Logik, Rate-Limit und Fehlerpfade wurden aufgebaut.
   * - M3
     - Web-Bereitstellung und Nutzerfluss
     - Aus einer reinen Anzeige musste eine nutzbare Webanwendung mit Konto, Rollen und Dashboard werden.
     - Registrierung, Admin-Setup, Onboarding und Dashboard wurden zu einem gefuehrten Ablauf verbunden.
   * - M4
     - Push-Notifications
     - Relevante Aenderungen sollten mit Mehrwert gemeldet werden, ohne Nutzer zu spammen.
     - QStash-Dispatch, Delta-Logik und zielgerichtete Push-Tests wurden umgesetzt.
   * - M5
     - Dokumentation und Abgabe
     - Der Projektstand musste nachvollziehbar, pruefungstauglich und formal sauber beschrieben werden.
     - Kapitelstruktur, Diagramme, Gantt, Netzplan und Ergebnisbewertung wurden zusammengefuehrt.

Gantt-Plan mit Meilensteinen
----------------------------

Das Gantt-Diagramm zeigt denselben Verlauf in zeitlicher Form.

.. mermaid::

   gantt
       title BLL Projektzeitplan Vertretungsplan
       dateFormat  YYYY-MM-DD
       axisFormat  %d.%m.

       section Produktbasis
       Problemverstaendnis und MVP             :a1, 2025-11-03, 10d
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

Neue Anforderungen standen nicht am Anfang vollstaendig fest. Erst im Verlauf
wurden aus der Grundidee ein webfaehiger Nutzerfluss und spaeter ein
sinnvoller Push-Prozess.

Netzplan und kritischer Pfad
----------------------------

Der Netzplan zeigt, welche Schritte aufeinander aufbauen und warum einzelne
Themen spaeter als erwartet entstanden sind.

.. mermaid::

   flowchart LR
       A["A Produktidee und Anforderungen schaerfen"] --> B["B MVP fuer Anzeige und Datum"]
       B --> C["C Datenabruf im Hook und Client-Cache"]
       C --> D["D API-Proxy mit Retry und Rate-Limit"]
       D --> E["E Dashboard als persoenlicher Einstieg"]
       E --> F["F Registrierung, Admin-Setup, Onboarding"]
       F --> G["G Hosting und oeffentliche Web-URL"]
       G --> H["H QStash-Dispatch fuer Push"]
       H --> I["I Tests, Doku und PDF-Abgabe"]

       D --> J["J Filterlogik und Datenaufbereitung"]
       H --> K["K Push-Tests und Benutzerverwaltung"]
       J --> E
       K --> I

       classDef critical fill:#ffe8e8,stroke:#c62828,stroke-width:2px;
       class A,B,C,D,E,F,G,H,I critical;

Der kritische Pfad verlaeuft vom MVP ueber API-Stabilitaet und Nutzerfluss
bis zum Push-Dispatch. Push konnte erst sinnvoll werden, nachdem Hosting und
API-Stabilitaet bereits geloest waren.

Austausch und Rueckmeldungen
----------------------------

Die Projektarbeit wurde durch regelmaessigen Austausch begleitet. Mehrere
Gespraeche mit den betreuenden Lehrkraeften Alexander Rhode und Michael
Knobl dienten der fachlichen Orientierung und Meilensteinbesprechung.

Darueber hinaus wurde die Anwendung intensiv von Mitschuelerinnen und
Mitschuelern im Alltag getestet. Deren Rueckmeldungen fuehrten zu
konkreten Verbesserungen, etwa bei der mobilen Bedienbarkeit und der
Ladegeschwindigkeit der Vertretungsanzeige.
