01 Einleitung und Motivation
============================

Ausgangssituation
-----------------

Vertretungspläne sind im Schulalltag eine zentrale Informationsquelle. In vielen
Schulen liegen diese Informationen zwar digital vor, sind für Lernende aber oft
nur umständlich nutzbar: lange Tabellen, wenig mobile Optimierung und fehlende
Filter für konkrete Klassen oder Fächer.

Motivation des Projekts
-----------------------

Das Projekt ``fds-vertretungsplan`` adressiert genau diese Lücke. Ziel ist keine
neue Datenquelle, sondern eine deutlich bessere Darstellung und Nutzbarkeit der
vorhandenen Vertretungsdaten. Damit rückt die Software vom reinen "Anzeigen von
Listen" zu einem alltagsnahen Informationswerkzeug.

Warum Web statt nativer App?
----------------------------

Die Entscheidung für eine Webanwendung ist fachlich sinnvoll:

- Keine Installation auf Endgeräten notwendig.
- Sofort nutzbar auf Smartphone, Tablet und Desktop.
- Zentrale Updates ohne App-Store-Prozess.
- Leichte Verlinkung mit rechtlichen Seiten und Schulkontext.

Projektziele im BLL-Kontext
---------------------------

1. Vertretungen schnell und verständlich anzeigen.
2. Fehlerfälle robust behandeln.
3. Datenschutz und Sicherheit systematisch berücksichtigen.
4. Eine wartbare Struktur für spätere Erweiterungen schaffen.

Einstiegspunkt und Produktidee im Code
--------------------------------------

Die Startseite (``src/app/page.tsx``) zeigt den Produktansatz sehr klar:
Feature-Flags steuern, welche UI genutzt wird, während die Datenlogik in einem
wiederverwendbaren Hook gekapselt bleibt. Das ist relevant, weil damit
gleichzeitig Weiterentwicklung (New UI) und Betriebssicherheit (Legacy UI)
möglich sind.

Relevanz für die Dokumentation
-------------------------------

Dieses Kapitel begründet das "Warum" des Projekts. Die technischen Details folgen
bewusst erst in Kapitel 03 (Pflichtenheft), damit Motivation und Umsetzung nicht
vermengt werden.
