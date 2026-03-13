03 Loesungsansatz und Pflichtenheft
===================================

Architekturprinzip
------------------

Die technische Grundidee ist klar getrennt: Oberflaeche, Datenabruf,
gesicherte API-Routen und Hintergrundprozesse haben jeweils eigene Aufgaben.
Die Hauptkette fuer Vertretungsdaten lautet ``UI -> Hook -> interne API ->
WebUntis``. Dadurch bleibt der Browser leichtgewichtig, waehrend sensible
Logik wie Validierung, Fehlerbehandlung und externe Requests serverseitig
gebuendelt werden.

Hosting und Web-Bereitstellung
------------------------------

Die Anwendung ist als normale Next.js-Webanwendung ausgelegt. Das Projekt kann
auf Vercel oder auf eigener Infrastruktur betrieben werden, solange eine
oeffentlich erreichbare HTTPS-URL vorhanden ist. Diese URL ist nicht nur fuer
normale Seiten wichtig, sondern auch fuer den Push-Dispatch ueber QStash, weil
der Scheduler keine lokalen ``localhost``-Adressen aufrufen kann.

Die Hosting-Entscheidung ist deshalb Teil des Pflichtenhefts: Ohne oeffentliche
URL, gesetzte Umgebungsvariablen und klaren Deploy-Prozess wuerden Dashboard,
Registrierung und Push zwar lokal funktionieren, aber nicht als Webprodukt im
echten Betrieb.

Nutzer anlegen, Onboarding und Admin-Setup
------------------------------------------

Der Nutzerfluss ist bewusst mehrstufig aufgebaut:

1. Neue Nutzer registrieren sich unter ``/stundenplan/register``.
2. Nach erfolgreichem Login fuehrt die Anwendung entweder ins
   ``admin-setup`` oder ins persoenliche ``onboarding``.
3. Erst nach hinterlegten Lehrkraeften und einem eigenen Stundenplan ist das
   Dashboard der eigentliche Zielzustand.
4. Im Admin-Bereich koennen Rollen, Lehrerkuerzel, Benachrichtigungen und
   Testdaten zentral verwaltet werden.

Technisch ist das kein Nebenschauplatz, sondern ein Kernteil der Loesung. Die
Dateien ``src/app/page.tsx``, ``src/app/stundenplan/register/page.tsx``,
``src/app/stundenplan/admin-setup/page.tsx`` und
``src/app/stundenplan/onboarding/page.tsx`` zeigen, wie der Nutzer je nach
Rolle und Profilstatus gezielt weitergeleitet wird. Das verbessert die
Bedienbarkeit und verhindert unvollstaendige Profile im Echtbetrieb.

Push-Notifications als Hintergrundprozess
-----------------------------------------

Push-Benachrichtigungen wurden nicht als einfache "Sende immer alles"-Funktion
umgesetzt. Stattdessen kombiniert die Anwendung mehrere Bausteine:

- persoenlicher Stundenplan als Filtergrundlage,
- periodischer QStash-Dispatch,
- serverseitiger Abgleich gegen relevante Vertretungen,
- Delta-Logik, damit nur neue oder geaenderte Treffer versendet werden.

Die Route ``src/app/api/internal/push/dispatch/route.ts`` verarbeitet diesen
Hintergrundlauf. Dort werden nur Nutzer mit aktivierten Benachrichtigungen,
Stundenplaneintraegen und vorhandenen Push-Subscriptions beruecksichtigt. Die
Zustellung erfolgt ueber das VAPID-Protokoll (vgl. RFC 8292), das eine
standardkonforme Authentifizierung gegenueber Push-Diensten ermoeglicht. Erst
dann werden relevante Vertretungen gesucht und passende Push-Nachrichten
erzeugt.

Warum nur alle 15 Minuten und nicht in Echtzeit?
------------------------------------------------

Die 15-Minuten-Frequenz ist eine fachliche und technische Abwaegung:

- WebUntis liefert hier keinen echten Event-Stream, sondern muss aktiv abgefragt werden.
- Ein sekundenweises Polling wuerde die Last auf das Fremdsystem und auf die
  eigene Anwendung unnoetig erhoehen.
- Im Schulalltag reicht ein kurzer, regelmaessiger Aktualisierungsrhythmus aus;
  Sekunden-Echtzeit bringt kaum zusaetzlichen Nutzen.
- Die Push-Logik arbeitet zusaetzlich nur in sinnvollen Zeitfenstern und mit
  Delta-Erkennung, damit Nutzer nicht mit Wiederholungen ueberschuettet werden.

.. literalinclude:: ../../scripts/qstash-upsert-dispatch-schedule.mjs
   :language: js
   :lines: 36-50

Warum dieser Ausschnitt wichtig ist:

- Er zeigt die konkrete Scheduler-Konfiguration mit dem Default
  ``*/15 * * * *``.
- Er belegt, dass Push als geplanter Web-Hintergrundprozess gedacht ist und
  nicht als Dauerabfrage im Sekundentakt.
- Er stuetzt dieses Kapitel, weil er die Architekturentscheidung direkt aus dem
  Repository nachweist.

Technische Kernentscheidungen
-----------------------------

Drei algorithmische Bausteine praegen die Architektur und gehen ueber
Standardfunktionalitaet hinaus.

**Schedule-Matching.** Der Abgleich zwischen persoenlichem Stundenplan und
Vertretungsliste vergleicht Wochentag, Stundenblock-Ueberlappung sowie Fach
oder Lehrkraft. Daraus ergibt sich ein Confidence-Score: hoch bei Fach- und
Lehrkraftmatch oder Raumumzug, mittel bei nur teilweiser Uebereinstimmung.
Die Logik liegt in ``src/lib/schedule-matching.ts``.

**Caching-Strategie.** Die API nutzt einen In-Memory-Cache mit 30 Sekunden
TTL und Stale-while-revalidate bis 30 Minuten bei Upstream-Fehlern
(vgl. RFC 5861). LRU-Pruning bei 200 Eintraegen begrenzt den
Speicherverbrauch in serverlosen Umgebungen. Fehlgeschlagene Abrufe werden
mit exponentiellem Backoff bis zu dreimal wiederholt. Implementierung in
``src/app/api/substitutions/route.ts``.

**Push-Delta-Logik.** Ob eine Benachrichtigung versendet wird, entscheidet
ein SHA-256-Fingerprint ueber die kanonisierten Match-Schluessel (Grossschreibung,
sortiert, dedupliziert). Drei Zustaende sind moeglich: senden (neuer oder
geaenderter Fingerprint), ueberspringen (unveraendert) und aufloesen (keine
Treffer mehr). Ein konfigurierbares Vorausschaufenster von ein bis fuenf
Schultagen schliesst Wochenenden aus. Die Zustandsverwaltung liegt in
``src/lib/notification-state.ts``.

Datenschutz und Sicherheitsarchitektur
--------------------------------------

**Gespeicherte personenbezogene Daten.** Die Anwendung speichert
E-Mail-Adresse, bcrypt-gehashtes Passwort, persoenlichen Stundenplan,
Push-Subscription-Endpunkte sowie optional anonymisierte Analytics-Daten.
Klarnamen oder Schuelerdaten werden nicht erfasst.

**Technische Schutzmassnahmen.** Passwoerter werden ausschliesslich als
bcrypt-Hashes gespeichert. Die Sitzungsverwaltung nutzt JWT-Tokens mit
HTTPS-only Secure-Cookies (``__Secure-``-Praefix). Elf CSP-Direktiven in
der Produktionskonfiguration beschraenken Skript- und Verbindungsquellen
(vgl. OWASP Top 10, Abschnitt A05 Security Misconfiguration). Zusaetzlich
schuetzt ein duales Rate-Limiting auf IP- und E-Mail-Ebene die
Authentifizierungsendpunkte. Die zentrale Konfiguration liegt in
``src/middleware.ts``, die Authentifizierungslogik in ``src/lib/auth.ts``.

**Analytics.** PostHog ist als optionaler Analysedienst integriert und kann
vollstaendig deaktiviert werden, ohne die Kernfunktionalitaet zu
beeintraechtigen.

**Einordnung.** Eine vollstaendige DSGVO-Konformitaetspruefung uebersteigt
den Rahmen eines Schulprojekts. Die beschriebenen technischen Grundlagen
decken jedoch die wesentlichen Schutzziele ab.

Pflichtenheft-Abgleich
----------------------

Die gewaehlte Loesung erfuellt die zentralen Sollvorgaben des Pflichtenhefts:
klare Nutzerfuehrung, robuste API-Kontrolle, webtaugliches Hosting und eine
Push-Architektur, die im Schulkontext sinnvoller ist als ein teures und
fehleranfaelliges Echtzeitmodell.
