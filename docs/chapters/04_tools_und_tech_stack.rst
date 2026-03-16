04 Tools und Tech Stack
=======================

Ziel der Toolauswahl
--------------------

Der Stack wurde nicht nach "neuester Trend" gewaehlt, sondern nach
Projektanforderung: schnelle Iteration, stabile Auslieferung und gute
Wartbarkeit fuer ein Schulprojekt mit professionellem Anspruch.

Warum Framework statt reinem HTML/CSS (kurz)
--------------------------------------------

Ein Framework wie Next.js ist sinnvoller als reines HTML, weil Routing,
Datenabruf, Authentifizierung und Sicherheit einheitlich geloest werden
muessen. Ohne Framework muessten diese Querschnittsthemen einzeln und
fehleranfaellig zusammengesetzt werden.

Kernstack
---------

- Next.js (App Router) fuer Frontend und interne API im selben Projekt.
- React + TypeScript fuer klar typisierte Komponentenlogik.
- Tailwind + Komponentenlayer fuer konsistente UI.
- Vitest + Testing Library fuer schnelle Regressionstests.
- ESLint fuer fruehe Qualitaetskontrolle.
