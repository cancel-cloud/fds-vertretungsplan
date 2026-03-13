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
Stundenplaneintraegen und vorhandenen Push-Subscriptions beruecksichtigt. Erst
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

Pflichtenheft-Abgleich
----------------------

Die gewaehlte Loesung erfuellt die zentralen Sollvorgaben des Pflichtenhefts:
klare Nutzerfuehrung, robuste API-Kontrolle, webtaugliches Hosting und eine
Push-Architektur, die im Schulkontext sinnvoller ist als ein teures und
fehleranfaelliges Echtzeitmodell.
