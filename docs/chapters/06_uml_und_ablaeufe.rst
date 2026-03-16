06 UML-Diagramme und Abläufe
=============================

Die Diagramme zeigen das Projekt aus drei Perspektiven: Nutzung, Struktur und
Laufzeit.

Use-Case-Diagramm
-----------------

Das Use-Case-Diagramm zeigt die Nutzerperspektive mit den externen Akteuren
WebUntis und PostHog.

.. uml:: ../uml/usecase.puml
   :caption: Use Cases für Nutzung, Datenabruf und Rechtsseiten

Klassendiagramm
---------------

Das Klassendiagramm zeigt die wichtigsten Module und vor allem ihre
Kommunikation. Im Mittelpunkt stehen drei Wege:

1. Die Seite bzw. das Dashboard initiiert Nutzeraktionen.
2. Der Hook kapselt Client-Zustand, Cache und Datenabruf.
3. API-Routen und Services sprechen mit WebUntis, Prisma oder dem Push-System.

.. uml:: ../uml/classdiagram.puml
   :caption: Modulorientiertes Klassendiagramm

Die Schichten sind klar getrennt: UI-Komponenten sprechen nie direkt mit
externen Systemen, sondern über Hooks, API-Routen und abgegrenzte Services.

Objektdiagramm
--------------

Das Objektdiagramm zeigt eine konkrete Laufzeitsicht mit realen Instanzen.
Anders als das Klassendiagramm beschreibt es keine allgemeinen Modultypen,
sondern einen beispielhaften Betriebszustand.

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

Neben dem sichtbaren Dashboard existiert im Hintergrund ein zweiter Laufpfad
über QStash und die Push-API.
