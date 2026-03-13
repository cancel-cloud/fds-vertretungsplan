06 UML-Diagramme und Ablaeufe
=============================

Einordnung
----------

Die Diagramme verdichten Kapitel 02 bis 05 in mehrere Perspektiven. Dadurch
wird sichtbar, wie fachliche Anforderungen in konkrete technische Interaktionen
ueberfuehrt wurden. Fuer die Abgabe stehen drei Diagrammtypen im Mittelpunkt:
Use-Case, Klasse und Objekt. Sie reichen aus, um Nutzung, Struktur und
Zusammenspiel der wichtigsten Bausteine nachvollziehbar zu machen.

Use-Case-Diagramm
-----------------

Das Use-Case-Diagramm zeigt die Nutzerperspektive mit den externen Akteuren
WebUntis und PostHog.

.. uml:: ../uml/usecase.puml
   :caption: Use Cases fuer Nutzung, Datenabruf und Rechtsseiten

Interpretation: Das System ist aus Nutzersicht auf schnellen Informationszugriff
und nachvollziehbare Zusatzfunktionen reduziert.

Klassendiagramm
---------------

Das Klassendiagramm zeigt die wichtigsten Module und vor allem ihre
Kommunikation. Im Mittelpunkt stehen drei Wege:

1. Die Seite bzw. das Dashboard initiiert Nutzeraktionen.
2. Der Hook kapselt Client-Zustand, Cache und Datenabruf.
3. API-Routen und Services sprechen mit WebUntis, Prisma oder dem Push-System.

.. uml:: ../uml/classdiagram.puml
   :caption: Modulorientiertes Klassendiagramm

Interpretation: Die Schichten sind klar getrennt. Besonders wichtig ist, dass
UI-Komponenten nie direkt mit externen Systemen sprechen. Stattdessen laufen
die Kommunikationswege ueber Hooks, API-Routen und klar abgegrenzte Services.

Objektdiagramm
--------------

Das Objektdiagramm zeigt eine konkrete Laufzeitsicht mit realen Instanzen aus
diesem Repository. Anders als das Klassendiagramm beschreibt es keine
allgemeinen Modultypen, sondern einen beispielhaften Betriebszustand.

.. mermaid::

   flowchart LR
       session["session: UserSession\nrole=USER"]
       dashboard["dashboard: DashboardClient\nscope=personal"]
       hook["hook: useSubstitutions\ncacheKey=20260313"]
       subsApi["subsApi: /api/substitutions"]
       untis["untis: WebUntis"]
       settings["settings: UserSettingsPanel\npush=true"]
       schedule["dispatchJob: QStash\ncron=15min"]
       pushApi["pushApi: /api/internal/push/dispatch"]

       session --> dashboard
       dashboard --> hook
       hook --> subsApi
       subsApi --> untis
       session --> settings
       schedule --> pushApi
       pushApi --> untis

Interpretation: Die Objekte verdeutlichen, dass Sicherheits- und Datenpfad im
Betrieb zusammenspielen. Neben dem sichtbaren Dashboard existiert im Hintergrund
ein zweiter Laufpfad ueber QStash und die Push-API.

Dateiablage Diagramme
---------------------

- ``docs/uml/usecase.puml``
- ``docs/uml/classdiagram.puml``
- ``docs/uml/objectdiagram.mmd``

Optional im Repository vorhanden, aber fuer die Hauptargumentation nicht
zwingend: ``docs/uml/activity.puml`` und ``docs/uml/sequence.puml``.

Bewertung der UML-Ergebnisse
----------------------------

Die Diagramme bestaetigen den Architekturansatz: klare Verantwortlichkeiten,
eine bewusste Trennung zwischen UI und Infrastruktur sowie nachvollziehbare
Kommunikationswege zwischen Seite, Hook, API und Hintergrundprozess.
