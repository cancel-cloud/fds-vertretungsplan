07 Umsetzung und Schwierigkeiten
================================

Praxisfokus der Umsetzung
-------------------------

Die größten Herausforderungen lagen nicht in der reinen Darstellung, sondern in
der robusten Verarbeitung realer Upstream-Situationen: schwankende Antworten,
kurzfristige Lastspitzen und sichere Browserauslieferung.

Schwierigkeit 1: Sicherheitskonfiguration ohne Funktionsverlust
---------------------------------------------------------------

Eine strenge CSP kann schnell legitime Drittverbindungen blockieren. Deshalb wurde
sie zentral aufgebaut und mit den benötigten Analytics-Endpunkten abgestimmt.

.. literalinclude:: ../../src/middleware.ts
   :language: ts
   :lines: 11-18,37-43

Warum dieser Ausschnitt wichtig ist:

- Er zeigt die konkrete Sicherheitsrichtlinie statt einer pauschalen Behauptung.
- Er belegt die Balance zwischen Schutz und Funktionsfähigkeit.
- Er stützt Kapitel 07, weil hier reale Integrationskonflikte gelöst wurden.

Schwierigkeit 2: Nachweisbare Robustheit bei Last und Fehlern
--------------------------------------------------------------

Die API wurde nicht nur implementiert, sondern gegen typische Störfälle getestet.
Besonders wichtig war der Nachweis, dass Rate-Limits und Retry-Informationen korrekt
behandelt werden (siehe ``src/app/api/substitutions/route.test.ts``).

Weitere Lernpunkte aus der Umsetzung
------------------------------------

- Klare Trennung von Zustandslogik und Anzeige reduziert Fehler in der UI.
- Kleine Hilfsfunktionen (z. B. URL-Validierung) verbessern Testbarkeit stark.
- Monitoring ist nur dann sinnvoll, wenn Events datensparsam und zielgerichtet sind.

Zwischenfazit
-------------

Die Umsetzung hat gezeigt, dass ein schulisches Projekt professionell wirken kann,
wenn Sicherheits- und Betriebsfragen früh mitgedacht werden und nicht erst am Ende.
