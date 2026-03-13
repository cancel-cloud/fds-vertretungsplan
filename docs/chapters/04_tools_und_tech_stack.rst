04 Tools und Tech Stack
=======================

Ziel der Toolauswahl
--------------------

Der Stack wurde nicht nach "neuester Trend" gewaehlt, sondern nach
Projektanforderung: schnelle Iteration, stabile Auslieferung und gute
Wartbarkeit fuer ein Schulprojekt mit professionellem Anspruch.

Warum Framework statt reinem HTML/CSS (kurz)
--------------------------------------------

Fuer dieses Projekt ist ein Framework sinnvoller als eine reine HTML/CSS-
Loesung, weil Routing, Datenabruf und geschuetzte Bereiche zusammen gedacht
werden muessen. Next.js stellt dafuer einheitliche Strukturen bereit, die in
``src/app`` und ``src/app/api`` direkt sichtbar sind.

- Routing: Seiten und API-Routen sind konsistent im App-Router organisiert.
- Wartbarkeit: Komponenten, Hooks und Lib-Module sind klar getrennt.
- State: Client-Zustaende (Loading, Error, Cache) sind zentral im Hook abgebildet.
- Testing: Vitest-Tests greifen direkt auf klar abgegrenzte Module zu.
- Sicherheit: Middleware, Header und Auth-Guards sind zentral steuerbar.

Kernstack
---------

- Next.js (App Router) fuer Frontend und interne API im selben Projekt.
- React + TypeScript fuer klar typisierte Komponentenlogik.
- Tailwind + Komponentenlayer fuer konsistente UI.
- Vitest + Testing Library fuer schnelle Regressionstests.
- ESLint fuer fruehe Qualitaetskontrolle.

Projekt-Skripte und Laufwege
----------------------------

Dieser Ausschnitt belegt die zentralen Arbeitsablaeufe: Entwicklung, Build,
Linting und Testausfuehrung.

.. literalinclude:: ../../package.json
   :language: json
   :lines: 5-13

Warum dieser Ausschnitt wichtig ist:

- Er zeigt reproduzierbare Kommandos fuer Betrieb und Qualitaet.
- Er dient als technische Grundlage fuer Kapitel 08 (Ergebnisbewertung).
- Er stuetzt dieses Kapitel, weil die Toolkette konkret nachpruefbar wird.

Sicherheits- und Integrationskonfiguration
------------------------------------------

Die Next.js-Konfiguration (``next.config.ts``) zeigt, dass Security-Header und
externe Analytics-Routen bewusst zentral gepflegt werden. Die
Content-Security-Policy (vgl. W3C CSP Level 3) wird in der Middleware
erzeugt und umfasst in der Produktionskonfiguration elf Direktiven. Diese
Trennung von Produktlogik und Infrastrukturkonfiguration ist fuer Wartbarkeit
und Sicherheit entscheidend.

Einordnung
----------

Die Toolkombination ist fuer die BLL sinnvoll: fachlich gut erklaerbar,
technisch belastbar und fuer spaetere Erweiterungen offen.
