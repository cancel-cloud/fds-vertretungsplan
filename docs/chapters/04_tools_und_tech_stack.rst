04 Tools und Tech Stack
=======================

Ziel der Toolauswahl
--------------------

Der Stack wurde nicht nach "neuester Trend" ausgewählt, sondern nach
Projektanforderung: schnelle Iteration, stabile Auslieferung und gute
Wartbarkeit für ein Schulprojekt mit professionellem Anspruch.

Kernstack
---------

- Next.js (App Router) für Frontend und interne API im selben Projekt.
- React + TypeScript für klar typisierte Komponentenlogik.
- Tailwind + Komponentenlayer für konsistente UI.
- Vitest + Testing Library für schnelle Regressionstests.
- ESLint für frühe Qualitätskontrolle.

Projekt-Skripte und Laufwege
----------------------------

Dieser Ausschnitt belegt die zentralen Arbeitsabläufe: Entwicklung, Build,
Linting und Testausführung.

.. literalinclude:: ../../package.json
   :language: json
   :lines: 5-13

Warum dieser Ausschnitt wichtig ist:

- Er zeigt reproduzierbare Kommandos für Betrieb und Qualität.
- Er dient als technische Grundlage für Kapitel 08 (Ergebnisbewertung).
- Er stützt dieses Kapitel, weil die Toolkette konkret nachprüfbar wird.

Sicherheits- und Integrationskonfiguration
------------------------------------------

Die Next.js-Konfiguration (``next.config.ts``) zeigt, dass Security-Header und
externe Analytics-Routen bewusst zentral gepflegt werden. Diese Trennung von
Produktlogik und Infrastrukturkonfiguration ist für Wartbarkeit und Sicherheit
entscheidend.

Einordnung
----------

Die Toolkombination ist für die BLL sinnvoll: fachlich gut erklärbar,
technisch belastbar und für spätere Erweiterungen offen.
