Ergebnisbewertung (Ziele erfüllt?)
======================================

Die Bewertung orientiert sich an den SMART-Zielen aus Kapitel 02. [#s08_1]_

Soll-Ist-Abgleich zu den SMART-Zielen
-------------------------------------

.. list-table:: Soll-Ist-Abgleich (identische Ziel-IDs wie in Kapitel 02)
   :header-rows: 1
   :widths: 8 16 24 52

   * - ID
     - Status
     - Soll
     - Ist-Nachweis
   * - S1
     - Erfüllt
     - Vertretungsinfos in max. drei Interaktionen.
     - Datumswahl und Anzeige in der Hauptansicht - maximal zwei Klicks.
   * - S2
     - Erfüllt
     - Kombinierte Suche und Kategorienfilter stabil nutzbar.
     - Filter- und Suchlogik in der Datenverarbeitungsschicht umgesetzt.
   * - S3
     - Erfüllt
     - API robust bei Last und Upstream-Fehlern.
     - Rate-Limiting, Retry-Logik, Cache und Fehlernormalisierung; Tests belegen das.
   * - S4
     - Erfüllt
     - Sicherheits- und Datenschutzbasis aktiv.
     - CSP und Zugriffsschutz aktiv; Impressum und Datenschutz erreichbar.
   * - S5
     - Weitgehend erfüllt
     - Wartbarkeit/Testbarkeit und dokumentierter Prozess.
     - Tests für API-, Hook- und Komponentenpfade vorhanden; weitere UI-Randfälle als Ausbaupotenzial.

Die Kernziele S1 bis S4 sind erreicht, S5 ist in weiten Teilen umgesetzt.

Testnachweis
------------

Die Qualitätssicherung stützt sich auf automatisierte Tests mit Vitest und
React Testing Library. Insgesamt umfasst das Projekt 34 Testdateien mit
134 Testfällen in drei Kategorien.

.. list-table:: Ausgewählte Testfälle mit Ergebnis
   :header-rows: 1
   :widths: 28 20 26 26

   * - Testziel
     - Typ
     - Vorgehen
     - Ergebnis
   * - Vertretungstyp-Erkennung (Entfall, Vertretung, Verlegung)
     - Unit
     - CSS-Klassen und Textmuster an processSubstitutionRow übergeben
     - Korrekte Klassifizierung für alle Typen
   * - Rate-Limiting der API (60 Req/Min)
     - Integration
     - 61 Anfragen an /api/substitutions senden
     - 429-Antwort mit Retry-After-Header ab Anfrage 61
   * - Retry bei Upstream-Fehler
     - Integration
     - WebUntis-Antwort mit HTTP 503 simulieren
     - Bis zu 3 Wiederholungsversuche mit exponentiellem Backoff
   * - Delta-Logik (Fingerprint-Vergleich)
     - Unit
     - resolveNotificationDeltaAction mit identischem und geändertem Fingerprint aufrufen
     - Aktion "skip" bei unverändertem, "send" bei geändertem Fingerprint
   * - Registrierung: Bootstrap-Admin
     - Integration
     - Ersten Nutzer mit und ohne ADMIN_EMAILS registrieren
     - Nur konfigurierte E-Mail erhält Admin-Rolle; ohne Konfiguration wird Registrierung blockiert
   * - Stundenplan-Überlappung
     - Integration
     - Einträge mit überlappenden Stunden an PUT /api/timetable senden
     - Ablehnung im Strict-Modus (400), Akzeptanz mit allowOverlaps-Flag
   * - Same-Origin-Schutz
     - Unit
     - Mutierenden Request ohne Origin-Header an enforceSameOrigin übergeben
     - 403-Antwort im Produktionsmodus
   * - Push-Dispatch: Forced Summary
     - Integration
     - Dispatch mit force=1 und sendUnchanged=1 auslösen
     - Push wird gesendet, NotificationState bleibt unverändert
   * - Admin-Rollenwechsel: Letzter Admin
     - Integration
     - Einzigen Admin zum User herabstufen
     - Ablehnung mit 400 (Schutz vor adminloser Instanz)
   * - Dashboard: Kalender-Dialog
     - Komponente
     - Datum-Trigger klicken, neues Datum im Dialog auswählen
     - Anzeige aktualisiert sich auf das gewählte Datum

Alle automatisierten Tests laufen über ``npm run test:run`` und sind in die
Entwicklungsroutine integriert. Zusätzlich wurde die Anwendung manuell im
Echtbetrieb mit mehr als sieben Nutzern getestet: Login-Ablauf, Push auf
verschiedenen Geräten (Chrome, Safari, Arc) und Admin-Verwaltung wurden dabei
fortlaufend überprüft.

.. [#s08_1] Vgl. Balzert (2009), Kap. 4: SMART-Kriterien als Grundlage
   messbarer Zielformulierung und systematischer Ergebnisbewertung.
