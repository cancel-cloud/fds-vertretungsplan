05 Code-Struktur: Welche Datei macht was
========================================

Prinzip der Struktur
--------------------

Das Repository ist nach Verantwortlichkeiten aufgeteilt. Diese Trennung ist
entscheidend fuer Lesbarkeit und Erweiterbarkeit: UI, Datenabruf,
Verarbeitung, Sicherheit und Analytics liegen in eigenen Bereichen.

Datei- und Ordnerlandkarte
--------------------------

.. list-table:: Relevante Module und Aufgaben
   :header-rows: 1
   :widths: 36 64

   * - Datei oder Ordner
     - Zweck im Gesamtsystem
   * - ``src/app/page.tsx``
     - Auth-aware Hauptseite (oeffentlich fuer Gaeste, Dashboard fuer eingeloggte Nutzer).
   * - ``src/app/api/substitutions/route.ts``
     - API-Proxy mit Rate-Limit, Server-Cache und Fehlernormalisierung.
   * - ``src/app/api/substitutions/route-utils.ts``
     - URL-/Datumsvalidierung und sichere Endpunktbildung.
   * - ``src/app/layout.tsx``
     - Globale Provider, Error-Boundary, Basislayout.
   * - ``src/components/layout/*``
     - Shell, Header und mobile Navigation.
   * - ``src/components/substitution-card.tsx``
     - Einzelkarte fuer Vertretungseintraege in der Ergebnisansicht.
   * - ``src/components/stundenplan/dashboard-client.tsx``
     - Dashboard-Integration von Datum, Filter, Datenabruf und Anzeigezustaenden.
   * - ``src/hooks/use-substitutions.ts``
     - Client-Datenabruf, Cache, Abort und Fehlerzustand.
   * - ``src/lib/data-processing.ts``
     - Transformation, Sortierung und Filterung der Rohdaten.
   * - ``src/lib/analytics/*``
     - Ereigniserfassung client- und serverseitig.
   * - ``src/providers/posthog-provider.tsx``
     - Analytics-Kontext und Feature-Flag-Zugriff in der UI.
   * - ``src/middleware.ts``
     - CSP-Header und Zugriffsschutz fuer sichere Browserauslieferung.
   * - ``src/types/index.ts``
     - Gemeinsame Daten- und API-Typen als Vertragsgrundlage.

Globales Layout als Integrationspunkt
-------------------------------------

Das Root-Layout belegt, dass kritische Querschnittsthemen (Fehlergrenze,
Themes, Analytics) nicht in Einzelkomponenten verstreut sind.

.. literalinclude:: ../../src/app/layout.tsx
   :language: tsx
   :lines: 20-31

Warum dieser Ausschnitt wichtig ist:

- Er zeigt zentrale Initialisierung statt verteilter Einzel-Setups.
- Er belegt die Trennung von Produktfunktionen und Querschnittslogik.
- Er stuetzt Kapitel 05, weil er Strukturentscheidungen direkt zeigt.

Sichere API-Hilfsfunktionen als Wartbarkeitsbaustein
-----------------------------------------------------

Die Hilfsfunktionen fuer URL- und Datumslogik liegen separat in
``src/app/api/substitutions/route-utils.ts``. Dadurch bleibt die groessere
Route-Datei fokussiert und besser testbar. Gleichzeitig wird der
Sicherheitsfokus (nur HTTPS, nur ``*.webuntis.com``) zentral abgesichert.

Fazit zur Code-Struktur
-----------------------

Die Struktur ist fuer Umfang und Zielgruppe passend: neue Funktionen koennen
gezielt in einem Bereich erweitert werden, ohne den gesamten Code anfassen zu
muessen.
