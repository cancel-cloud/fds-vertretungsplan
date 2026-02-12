00 Deckblatt
============

Hinweis
-------

Das Deckblatt wird in der PDF-Ausgabe nicht in diesem Kapitel gesetzt, sondern über
``docs/_latex/deckblatt-content.tex.txt`` als separate Titelseite eingebunden.
Damit bleibt die Seitenlogik stabil und die Kapitelnummerierung beginnt erst nach
der Titelseite.

Pflichtangaben für diese Dokumentation
---------------------------------------

- Dokumenttyp: BLL-Dokumentation (5. Prüfungsfach)
- Projekttitel: Moderne Webentwicklung am Beispiel einer alternativen Vertretungsplan-Anwendung
- Autor: Lukas Dienst
- Fach: Informatik
- Schule: Friedrich-Dessauer-Schule Limburg
- 1. Prüfer: Alexander Rhode
- 2. Prüfer: Michael Knobl
- Schuljahr: 2025/2026

Formale Absicherung im Build
----------------------------

Die formalen Anforderungen werden zentral in ``docs/conf.py`` umgesetzt:

- 1.5 Zeilenabstand via ``setspace``
- Seitenzahl im Footer rechts unten via ``fancyhdr``
- Deckblatt als erste Seite via ``latex_elements['maketitle']``

Dadurch bleiben die Formalia auch dann korrekt, wenn später Inhalte in den
Kapiteln erweitert oder umsortiert werden.
