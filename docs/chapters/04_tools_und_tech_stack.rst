04 Tools und Tech Stack
=======================

Ziel der Toolauswahl
--------------------

Der Stack wurde nicht nach "neuester Trend" gewählt, sondern nach
Projektanforderung: schnelle Iteration, stabile Auslieferung und gute
Wartbarkeit für ein Schulprojekt mit professionellem Anspruch. Dabei spielte
auch Vorerfahrung eine Rolle - Next.js und React waren aus früheren Arbeiten
bereits vertraut, ebenso wie Upstash als Anbieter für serverlose
Hintergrunddienste.

Warum Framework statt reinem HTML/CSS (kurz)
--------------------------------------------

Ein Framework wie Next.js ist sinnvoller als reines HTML, weil Routing,
Datenabruf, Authentifizierung und Sicherheit einheitlich gelöst werden
müssen. Ohne Framework müssten diese Querschnittsthemen einzeln und
fehleranfällig zusammengesetzt werden.

Kernstack
---------

- Next.js (App Router) für Frontend und interne API im selben Projekt.
- React + TypeScript für klar typisierte Komponentenlogik.
- Tailwind + Komponentenlayer für konsistente UI.
- Vitest + Testing Library für schnelle Regressionstests.
- ESLint für frühe Qualitätskontrolle.
