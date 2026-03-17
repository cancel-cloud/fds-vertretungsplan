Code-Struktur: Welche Datei macht was
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

Datenbank und Prisma-Schema
----------------------------

Das Datenbankschema ist in ``prisma/schema.prisma`` definiert und wird ueber
Prisma verwaltet. Die folgende Tabelle zeigt die zentralen Modelle:

.. list-table:: Prisma-Modelle und ihre Aufgaben
   :header-rows: 1
   :widths: 24 44 32

   * - Modell
     - Zweck
     - Besonderheit
   * - ``User``
     - Nutzerkonto mit Rolle (USER/ADMIN)
     - Erster registrierter Nutzer wird automatisch Admin
   * - ``TimetableEntry``
     - Persoenlicher Stundenplan (Wochentag, Stunde, Fach, Lehrkraft, Wochenmodus)
     - Speichert Dauer statt Endstunde fuer flexible Blocklaengen
   * - ``TeacherDirectory``
     - Zuordnung Lehrerkuerzel zu vollem Namen
     - Zentral vom Admin gepflegt
   * - ``PushSubscription``
     - Web-Push-Endpunkte je Nutzer und Geraet
     - Mehrere Geraete pro Nutzer moeglich
   * - ``NotificationFingerprint`` / ``NotificationState``
     - Delta-Erkennung fuer Push (Fingerprint = Pruefwert, State = aktueller Zustand)
     - Trennung ermoeglicht Audit-Trail und zustandslosen Vergleich
   * - ``AppSettings``
     - Globale Einstellungen (z.B. erlaubte E-Mail-Domains)
     - Singleton-Muster: genau ein Datensatz

Drei Designentscheidungen praegen das Schema: Die Speicherung von Dauer statt
Endstunde erlaubt variable Blocklaengen ohne Umrechnung. Die Trennung von
Fingerprint und State ermoeglicht nachvollziehbare Aenderungshistorie bei
gleichzeitig einfachem Zustandsvergleich. AppSettings als Singleton
vereinfacht den Zugriff auf globale Konfiguration.

Fazit zur Code-Struktur
-----------------------

Die Struktur ist fuer Umfang und Zielgruppe passend: neue Funktionen koennen
gezielt in einem Bereich erweitert werden, ohne den gesamten Code anfassen zu
muessen.
