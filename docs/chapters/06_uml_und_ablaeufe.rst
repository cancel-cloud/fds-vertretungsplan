06 UML-Diagramme und Abläufe
=============================

Einordnung
----------

Die Diagramme verdichten Kapitel 02 bis 05 in vier Perspektiven. Dadurch wird
sichtbar, wie fachliche Anforderungen in konkrete technische Interaktionen
überführt wurden.

Use-Case-Diagramm
-----------------

Das Use-Case-Diagramm zeigt die Nutzerperspektive mit den externen Akteuren
WebUntis und PostHog.

.. uml:: ../uml/usecase.puml
   :caption: Use Cases für Nutzung, Datenabruf und Rechtsseiten

Klassendiagramm
---------------

Das Klassendiagramm zeigt die wichtigsten Module und deren Abhängigkeiten,
insbesondere die Kette UI -> Hook -> API -> Datenverarbeitung.

.. uml:: ../uml/classdiagram.puml
   :caption: Modulorientiertes Klassendiagramm

Aktivitätsdiagramm
-------------------

Das Aktivitätsdiagramm stellt den Ablauf vom Nutzerereignis bis zur
Ergebnisdarstellung dar, inklusive Cache-Treffern und Fehlerzweigen.

.. uml:: ../uml/activity.puml
   :caption: Aktivitätsfluss des Datenabrufs

Sequenzdiagramm
---------------

Das Sequenzdiagramm beschreibt die Reihenfolge der Nachrichten zwischen User,
UI, Hook, API und Upstream.

.. uml:: ../uml/sequence.puml
   :caption: Sequenz vom UI-Event bis zur Antwort im Frontend

Bewertung der UML-Ergebnisse
----------------------------

- Die API-Route ist der zentrale Kontrollpunkt für Sicherheit und Robustheit.
- Der Hook ist die Integrationsschicht zwischen UI-Zustand und Netzwerk.
- Die UI bleibt schlank, weil sie keine Upstream-Sonderfälle direkt behandeln muss.
