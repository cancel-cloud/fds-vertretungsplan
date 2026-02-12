03 Lösungsansatz und Pflichtenheft
===================================

Architekturprinzip
------------------

Die Umsetzung folgt einer klaren Kette: UI -> Hook -> interne API -> WebUntis.
Dadurch bleibt der Browser schlank, während sicherheits- und robustheitsrelevante
Logik serverseitig gebündelt wird.

Umsetzungspflicht 1: kontrollierte API-Schicht
----------------------------------------------

Die API-Route kapselt kritische Funktionen: Rate-Limit, Cache und konsistente
Fehlerantworten. Das reduziert Lastspitzen und verhindert, dass die UI direkt an
unkontrollierte Upstream-Antworten gekoppelt wird.

.. literalinclude:: ../../src/app/api/substitutions/route.ts
   :language: ts
   :lines: 267-283

Warum dieser Ausschnitt wichtig ist:

- Er belegt die Schutzfunktion (Rate-Limit) auf Serverebene.
- Er zeigt, wie bei Ueberlastung ein definierter Fehlerpfad entsteht.
- Er stützt dieses Kapitel, weil er eine zentrale Pflichtenheft-Anforderung
  technisch nachweist.

Umsetzungspflicht 2: stabiler Datenabruf im Client
---------------------------------------------------

Der Hook ``useSubstitutions`` steuert Caching, Request-Abbruch und Fehlerzustand.
Damit bleibt die UI konsistent, auch wenn Nutzer schnell zwischen Tagen wechseln.
Die konkrete Umsetzung liegt in ``src/hooks/use-substitutions.ts`` und trennt
bewusst Ladezustand, Fehlerzustand und Meta-Antwort.

Datenfluss Ende-zu-Ende
-----------------------

1. Nutzer wählt Datum in der Oberfläche.
2. Der Hook prüft Client-Cache und startet ggf. API-Request.
3. Die API prüft Limits, validiert Parameter und kontaktiert WebUntis.
4. Die Antwort wird normalisiert und als ``substitution`` oder ``meta`` geliefert.
5. Die UI rendert den passenden Zustand (Liste, leer, meta, fehlerhaft).

Pflichtenheft-Abgleich
----------------------

Die gewählte Architektur erfüllt die zentrale Sollvorgabe des Pflichtenhefts:
robuster Echtbetrieb mit klaren Schnittstellen und nachvollziehbaren Fehlerpfaden.
