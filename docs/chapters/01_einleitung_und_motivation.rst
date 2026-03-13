01 Einleitung und Motivation
============================

Ausgangssituation
-----------------

Vertretungsplaene sind im Schulalltag eine zentrale Informationsquelle. In vielen
Schulen liegen diese Informationen zwar digital vor, sind fuer Lernende aber oft
nur umstaendlich nutzbar: lange Tabellen, wenig mobile Optimierung und fehlende
Filter fuer konkrete Klassen oder Faecher.

Motivation des Projekts
-----------------------

Das Projekt ``fds-vertretungsplan`` adressiert genau diese Luecke. Ziel ist
keine neue Datenquelle, sondern eine deutlich bessere Darstellung und
Nutzbarkeit der vorhandenen Vertretungsdaten. Damit rueckt die Software vom
reinen Anzeigen langer Listen zu einem alltagsnahen Werkzeug fuer den
Schulalltag.

Warum Web statt nativer App?
----------------------------

Die Entscheidung fuer eine Webanwendung ist fachlich sinnvoll:

- Keine Installation auf Endgeraeten notwendig.
- Sofort nutzbar auf Smartphone, Tablet und Desktop.
- Zentrale Updates ohne App-Store-Prozess.
- Leichte Verlinkung mit rechtlichen Seiten und Schulkontext.

Projektziele im BLL-Kontext
---------------------------

1. Vertretungen schnell und verständlich anzeigen.
2. Fehlerfälle robust behandeln.
3. Datenschutz und Sicherheit systematisch berücksichtigen.
4. Eine wartbare Struktur für spätere Erweiterungen schaffen.

Wie bedient man die Anwendung?
------------------------------

Der typische Nutzungsablauf ist bewusst kurz gehalten:

1. Oeffentliche Nutzer rufen die Startseite auf und koennen den Vertretungsplan
   direkt ansehen.
2. Wer persoenliche Funktionen nutzen will, registriert sich unter
   ``/stundenplan/register`` und meldet sich an.
3. Danach fuehrt die Anwendung ueber ``/stundenplan/onboarding`` zur Eingabe des
   persoenlichen Stundenplans.
4. Im Dashboard unter ``/stundenplan/dashboard`` werden passende Vertretungen,
   Filter und spaeter auch Benachrichtigungen gebuendelt angezeigt.

Damit ist die Bedienung im Alltag auf wenige Schritte reduziert: aufrufen,
Datum waehlen, Ergebnisse lesen und bei Bedarf den eigenen Stundenplan pflegen.

Einstiegspunkt im Code
----------------------

Die Startseite ``src/app/page.tsx`` zeigt diesen Produktansatz direkt. Gaeste
sehen eine oeffentliche Ansicht, angemeldete Nutzer werden je nach Status zu
``admin-setup``, ``onboarding`` oder direkt ins Dashboard weitergeleitet. Schon
an dieser Stelle ist erkennbar, dass Bedienung und Nutzerfuehrung als
Kernbestandteil des Produkts gedacht wurden.

Relevanz für die Dokumentation
-------------------------------

Dieses Kapitel beantwortet das Warum des Projekts und skizziert den
Nutzungsablauf aus Sicht der Anwender. Die technischen Entscheidungen folgen
bewusst erst in Kapitel 03, damit Motivation, Anforderungen und Umsetzung nicht
vermischt werden.
