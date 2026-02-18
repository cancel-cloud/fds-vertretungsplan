05 Code-Struktur: Welche Datei macht was
========================================

Prinzip der Struktur
--------------------

Das Repository ist nach Verantwortlichkeiten aufgeteilt. Diese Trennung ist
entscheidend für Lesbarkeit und Erweiterbarkeit: UI, Datenabruf, Verarbeitung,
Sicherheit und Analytics liegen in eigenen Bereichen.

Datei- und Ordnerlandkarte
--------------------------

.. list-table:: Relevante Module und Aufgaben
   :header-rows: 1
   :widths: 36 64

   * - Datei oder Ordner
     - Zweck im Gesamtsystem
   * - ``src/app/page.tsx``
     - Auth-aware Hauptseite (öffentlich für Gäste, Dashboard für eingeloggte Nutzer).
   * - ``src/app/api/substitutions/route.ts``
     - API-Proxy mit Rate-Limit, Server-Cache und Fehlernormalisierung.
   * - ``src/app/api/substitutions/route-utils.ts``
     - URL-/Datumsvalidierung und sichere Endpunktbildung.
   * - ``src/app/layout.tsx``
     - Globale Provider, Error-Boundary, Basislayout.
   * - ``src/components/layout/*``
     - Shell, Header und mobile Navigation.
   * - ``src/components/substitution-list.tsx``
     - Darstellung aller Ergebniszustände.
   * - ``src/hooks/use-substitutions.ts``
     - Client-Datenabruf, Cache, Abort und Fehlerzustand.
   * - ``src/lib/data-processing.ts``
     - Transformation, Sortierung und Filterung der Rohdaten.
   * - ``src/lib/analytics/*``
     - Ereigniserfassung client- und serverseitig.
   * - ``src/providers/posthog-provider.tsx``
     - Analytics-Kontext und Feature-Flag-Zugriff in der UI.
   * - ``src/middleware.ts``
     - CSP-Header für Browser-Sicherheit.
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
- Er stützt Kapitel 05, weil er Strukturentscheidungen direkt zeigt.

Sichere API-Hilfsfunktionen als Wartbarkeitsbaustein
-----------------------------------------------------

Die Hilfsfunktionen für URL- und Datumslogik liegen separat in
``src/app/api/substitutions/route-utils.ts``. Dadurch bleibt die größere
Route-Datei fokussiert und besser testbar. Gleichzeitig wird der Sicherheitsfokus
(nur HTTPS, nur ``*.webuntis.com``) an einer zentralen Stelle abgesichert.

Fazit zur Code-Struktur
-----------------------

Die Struktur ist für Umfang und Zielgruppe sehr passend: neue Funktionen können
gezielt in einem Bereich erweitert werden, ohne den gesamten Code anfassen zu müssen.
