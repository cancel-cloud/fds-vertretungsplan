03 Loesungsansatz und Pflichtenheft
===================================

Architekturprinzip
------------------

Die Architektur trennt vier Schichten: Die Benutzeroberflaeche zeigt Daten an,
eine Zwischenschicht verwaltet den lokalen Zustand, eine serverseitige
API-Schicht buendelt Validierung und Fehlerbehandlung, und die externe
Datenquelle (WebUntis) wird nur serverseitig kontaktiert. Dadurch bleibt der
Browser leichtgewichtig, waehrend sensible Logik serverseitig gebuendelt wird.

Hosting und Web-Bereitstellung
------------------------------

Die Anwendung ist als normale Next.js-Webanwendung ausgelegt. Das Projekt kann
auf Vercel oder auf eigener Infrastruktur betrieben werden, solange eine
oeffentlich erreichbare HTTPS-URL vorhanden ist, da der Scheduler keine lokalen
Adressen aufrufen kann.

Die Hosting-Entscheidung ist deshalb Teil des Pflichtenhefts: Ohne oeffentliche
URL, gesetzte Umgebungsvariablen und klaren Deploy-Prozess wuerden Dashboard,
Registrierung und Push zwar lokal funktionieren, aber nicht als Webprodukt im
echten Betrieb.

Nutzer anlegen, Onboarding und Admin-Setup
------------------------------------------

Der Nutzerfluss ist bewusst mehrstufig aufgebaut:

1. Neue Nutzer registrieren sich ueber die Registrierungsseite.
2. Nach erfolgreichem Login fuehrt die Anwendung entweder ins
   Admin-Setup oder ins persoenliche Onboarding.
3. Erst nach hinterlegten Lehrkraeften und einem eigenen Stundenplan ist das
   Dashboard der eigentliche Zielzustand.
4. Im Admin-Bereich koennen Rollen, Lehrerkuerzel, Benachrichtigungen und
   Testdaten zentral verwaltet werden.

Dieser mehrstufige Ablauf stellt sicher, dass Nutzer erst nach vollstaendiger
Einrichtung ihres Profils das Dashboard erreichen. Das verhindert
unvollstaendige Konten im Echtbetrieb.

Push-Notifications als Hintergrundprozess
-----------------------------------------

Push-Benachrichtigungen wurden nicht als einfache "Sende immer alles"-Funktion
umgesetzt. Stattdessen kombiniert die Anwendung mehrere Bausteine:

- persoenlicher Stundenplan als Filtergrundlage,
- periodischer Dispatch ueber einen Scheduler,
- serverseitiger Abgleich gegen relevante Vertretungen,
- Delta-Logik, damit nur neue oder geaenderte Treffer versendet werden.

Der Hintergrundprozess prueft fuer jeden Nutzer mit aktivierten
Benachrichtigungen, ob relevante Vertretungen vorliegen. Nur bei neuen oder
geaenderten Treffern wird ueber das VAPID-Protokoll (RFC 8292) eine
Push-Nachricht versendet.

Warum nur alle 15 Minuten und nicht in Echtzeit?
------------------------------------------------

Die 15-Minuten-Frequenz ist eine fachliche und technische Abwaegung:

- WebUntis liefert hier keinen echten Event-Stream, sondern muss aktiv abgefragt werden.
- Ein sekundenweises Polling wuerde die Last auf das Fremdsystem und auf die
  eigene Anwendung unnoetig erhoehen.
- Im Schulalltag reicht ein kurzer, regelmaessiger Aktualisierungsrhythmus aus;
  Sekunden-Echtzeit bringt kaum zusaetzlichen Nutzen.

Technische Kernentscheidungen
-----------------------------

**Schedule-Matching.** Der Abgleich zwischen persoenlichem Stundenplan und
Vertretungsliste vergleicht Wochentag, Stunde und Fach. Daraus ergibt sich ein
Relevanzwert, der hoeher ist, wenn mehrere Kriterien uebereinstimmen.

**Caching-Strategie.** Die API nutzt einen serverseitigen Cache mit kurzer
Gueltigkeitsdauer. Bei Upstream-Fehlern werden zwischengespeicherte Daten
weiterverwendet, damit Nutzer auch bei voruebergehenden Stoerungen stabile
Ergebnisse erhalten.

Datenschutz und Sicherheitsarchitektur
--------------------------------------

Passwoerter werden gehasht gespeichert, Sitzungen laufen ueber verschluesselte
Tokens mit sicheren Cookies. Der Browser wird durch Sicherheitsrichtlinien
(Content Security Policy) geschuetzt, Login-Versuche sind ratenbegrenzt.
Klarnamen oder Schuelerdaten werden nicht erfasst.

Die Datenbank speichert Nutzerkonten, persoenliche Stundenplaene,
Lehrerzuordnungen und Push-Subscriptions.

Die gewaehlte Loesung erfuellt die zentralen Sollvorgaben des Pflichtenhefts:
klare Nutzerfuehrung, robuste API-Kontrolle, webtaugliches Hosting und eine
Push-Architektur, die im Schulkontext sinnvoller ist als ein Echtzeitmodell.
