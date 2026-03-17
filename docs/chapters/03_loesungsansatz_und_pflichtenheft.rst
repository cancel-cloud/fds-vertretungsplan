03 Lösungsansatz und Pflichtenheft
===================================

Architekturprinzip
------------------

Die Architektur trennt vier Schichten: Die Benutzeroberfläche zeigt Daten an,
eine Zwischenschicht verwaltet den lokalen Zustand, eine serverseitige
API-Schicht bündelt Validierung und Fehlerbehandlung, und die externe
Datenquelle (WebUntis) wird nur serverseitig kontaktiert. Dadurch bleibt der
Browser leichtgewichtig, während sensible Logik serverseitig gebündelt wird.

Hosting und Web-Bereitstellung
------------------------------

Die Anwendung ist als normale Next.js-Webanwendung ausgelegt. Das Projekt kann
auf Vercel oder auf eigener Infrastruktur betrieben werden, solange eine
öffentlich erreichbare HTTPS-URL vorhanden ist, da der Scheduler - ein
externer Dienst der Firma Upstash - keine lokalen Adressen aufrufen kann.

Die Hosting-Entscheidung ist deshalb Teil des Pflichtenhefts: Ohne öffentliche
URL, gesetzte Umgebungsvariablen und klaren Deploy-Prozess würden Dashboard,
Registrierung und Push zwar lokal funktionieren, aber nicht als Webprodukt im
echten Betrieb.

Nutzer anlegen, Onboarding und Admin-Setup
------------------------------------------

Der Nutzerfluss ist bewusst mehrstufig aufgebaut:

1. Neue Nutzer registrieren sich über die Registrierungsseite.
2. Ob ein Nutzer Admin-Rechte erhält, wird über die Umgebungskonfiguration
   festgelegt. So ist sichergestellt, dass niemand zufällig Admin-Rechte bekommt.
3. Der erste registrierte Nutzer sollte idealerweise ein Admin sein, da nur
   Admins die Lehrerkürzel auf der Admin-Seite pflegen können.
4. Nach erfolgreichem Login führt die Anwendung ins persönliche Onboarding
   oder - für Admins - ins Admin-Setup.
5. Erst nach hinterlegten Lehrkräften und einem eigenen Stundenplan ist das
   Dashboard der eigentliche Zielzustand.

Dieser mehrstufige Ablauf stellt sicher, dass Nutzer erst nach vollständiger
Einrichtung ihres Profils das Dashboard erreichen. Das verhindert
unvollständige Konten im Echtbetrieb.

Rollen und Berechtigungen
--------------------------

Die Anwendung kennt zwei Rollen: USER und ADMIN. Ein normaler Nutzer kann
seinen Stundenplan pflegen, das Dashboard nutzen und Push-Benachrichtigungen
aktivieren. Ein Administrator hat zusätzlich Zugriff auf die
Lehrerkürzel-Verwaltung und die Nutzerverwaltung — er kann Rollen vergeben
und Konten entfernen.

Die erste Admin-Zuweisung erfolgt über eine Umgebungsvariable: Nur
E-Mail-Adressen, die dort hinterlegt sind, erhalten beim Registrieren
Admin-Rechte. Dieser erste Administrator kann weitere Nutzer per
Weboberfläche hochstufen. Das Hochstufen erfordert einen einfachen Klick;
das Herabstufen eines Admins erfordert dagegen die Eingabe der E-Mail-Adresse
des betroffenen Kontos in einem Bestätigungsdialog. Das System stellt
außerdem sicher, dass immer mindestens ein Administrator vorhanden ist — der
letzte Admin kann nicht herabgestuft werden.

Push-Notifications als Hintergrundprozess
-----------------------------------------

Push-Benachrichtigungen wurden nicht als einfache "Sende immer alles"-Funktion
umgesetzt. Stattdessen kombiniert die Anwendung mehrere Bausteine:

- persönlicher Stundenplan als Filtergrundlage,
- periodischer Dispatch über QStash, einen Funktions-Scheduler der Firma
  Upstash, dessen kostenloser Tarif für den Dauerbetrieb dieses Projekts ausreicht,
- serverseitiger Abgleich gegen relevante Vertretungen,
- Delta-Logik, damit nur neue oder geänderte Treffer versendet werden.

Der Hintergrundprozess prüft für jeden Nutzer mit aktivierten
Benachrichtigungen, ob relevante Vertretungen vorliegen. Nur bei neuen oder
geänderten Treffern wird über das VAPID-Protokoll (RFC 8292) eine
Push-Nachricht versendet.

**Wie funktioniert die Delta-Logik?**
Für jeden Nutzer wird bei jedem
Dispatch-Zyklus ein Prüfwert (Fingerprint) über die aktuell relevanten
Vertretungen berechnet und in der Datenbank gespeichert. Beim nächsten Zyklus
wird der Fingerprint erneut berechnet und mit dem gespeicherten verglichen.
Drei Ergebnisse sind möglich: *Senden* (neuer oder geänderter Fingerprint -
es hat sich etwas geändert), *Überspringen* (Fingerprint unverändert - keine
Neuigkeit) oder *Auflösen* (keine Treffer mehr - gespeicherter Zustand wird
bereinigt). So werden Nutzer nur dann benachrichtigt, wenn sich für sie
tatsächlich etwas geändert hat.

Warum nur alle 15 Minuten und nicht in Echtzeit?
------------------------------------------------

Die 15-Minuten-Frequenz ist eine fachliche und technische Abwägung:

- WebUntis liefert hier keinen echten Event-Stream, sondern muss aktiv abgefragt werden.
- Ein sekundenweises Polling würde die Last auf das Fremdsystem und auf die
  eigene Anwendung unnötig erhöhen.
- Im Schulalltag reicht ein kurzer, regelmäßiger Aktualisierungsrhythmus aus;
  Sekunden-Echtzeit bringt kaum zusätzlichen Nutzen.

Technische Kernentscheidungen
-----------------------------

**Schedule-Matching.** Der Abgleich zwischen persönlichem Stundenplan und
Vertretungsliste vergleicht Wochentag, Stunde und Fach. Daraus ergibt sich ein
Relevanzwert, der höher ist, wenn mehrere Kriterien übereinstimmen.

**Caching-Strategie.** Die API nutzt einen serverseitigen Cache mit kurzer
Gültigkeitsdauer. Bei Upstream-Fehlern werden zwischengespeicherte Daten
weiterverwendet, damit Nutzer auch bei vorübergehenden Störungen stabile
Ergebnisse erhalten.

Datenschutz und Sicherheitsarchitektur
--------------------------------------

Passwörter werden gehasht gespeichert, Sitzungen laufen über verschlüsselte
Tokens mit sicheren Cookies. Der Browser wird durch Sicherheitsrichtlinien
(Content Security Policy) geschützt, Login-Versuche sind ratenbegrenzt.
Klarnamen oder Schülerdaten werden nicht erfasst.

Die Datenbank speichert Nutzerkonten, persönliche Stundenpläne,
Lehrerzuordnungen und Push-Subscriptions.

Die gewählte Lösung erfüllt die zentralen Sollvorgaben des Pflichtenhefts:
klare Nutzerführung, robuste API-Kontrolle, webtaugliches Hosting und eine
Push-Architektur, die im Schulkontext sinnvoller ist als ein Echtzeitmodell.

Datenmodell
-----------

Die Datenbank (PostgreSQL, verwaltet über Prisma) speichert acht Entitäten:

.. list-table:: Übersicht der Datenbankentitäten
   :header-rows: 1
   :widths: 18 82

   * - Entität
     - Zweck und wichtigste Felder
   * - User
     - Nutzerkonto mit E-Mail, Passwort-Hash, Rolle (USER/ADMIN),
       Onboarding-Status und Benachrichtigungseinstellungen.
   * - TimetableEntry
     - Persönlicher Stundenplan: Wochentag, Stunde, Fach, Lehrkraft, Raum
       und Wochenmodus (jede/gerade/ungerade Woche). Grundlage für den
       Vertretungsabgleich.
   * - TeacherDirectory
     - Zuordnung von Lehrerkürzel zu vollem Namen. Wird von Admins gepflegt
       und im Stundenplan referenziert.
   * - PushSubscription
     - Web-Push-Endpunkt pro Gerät mit ECDH-Schlüsseln für die
       verschlüsselte Zustellung (VAPID).
   * - NotificationState
     - Aktueller Fingerprint pro Nutzer und Zieldatum. Entscheidet, ob eine
       Benachrichtigung gesendet, übersprungen oder aufgelöst wird.
   * - NotificationFingerprint
     - Unveränderliches Protokoll aller gesendeten Fingerprints (Audit-Log).
   * - TimetablePreset
     - Häufig verwendete Fach-Lehrkraft-Raum-Kombinationen für
       Autovervollständigung im Stundenplan-Editor.
   * - AppSettings
     - Globale Konfiguration (Singleton): erlaubte E-Mail-Domains und
       optionale Demo-Daten.

Alle Nutzer-bezogenen Entitäten sind über Fremdschlüssel mit kaskadierendem
Löschen verbunden: Wird ein Nutzerkonto entfernt, werden Stundenplan,
Push-Abonnements und Benachrichtigungszustände automatisch bereinigt.

**Zusammenhang der Entitäten im Push-Prozess.** TimetableEntry ist die
Grundlage für die Push-Logik: Der Dispatcher liest für jeden Nutzer seinen
Stundenplan und gleicht ihn mit den Vertretungen des Tages ab. Nur Treffer
aus diesem Abgleich fließen in die Benachrichtigungsentscheidung ein. Das
Ergebnis — ein Prüfwert (Fingerprint) über die relevanten Treffer — wird in
NotificationState gespeichert.

**Warum NotificationState und NotificationFingerprint getrennt sind.**
NotificationState speichert genau eine Zeile pro Nutzer und Zieldatum: den
zuletzt gesendeten Fingerprint. Er wird bei jedem Dispatch-Zyklus
überschrieben und gelöscht, sobald keine Treffer mehr vorliegen.
NotificationFingerprint hingegen wächst nur — jeder je gesendete Fingerprint
wird dauerhaft protokolliert. Diese Trennung ist bewusst: Der State steuert,
ob eine Benachrichtigung gesendet wird; der Fingerprint dokumentiert, was ein
Nutzer zu welchem Zeitpunkt gesehen hat. Würde man beide in einer Tabelle
zusammenfassen, ließe sich der Versandverlauf nicht mehr rekonstruieren.

**Warum TimetablePreset neben TimetableEntry existiert.** Ein TimetableEntry
repräsentiert eine konkrete Unterrichtsstunde mit Zeitdaten (Wochentag,
Stunde, Wochenmodus). Ein TimetablePreset speichert nur die inhaltliche
Kombination — Fach, Lehrkraft, Raum — ohne Zeitbezug. Er dient als
Autocomplete-Gedächtnis im Stundenplan-Editor: Die am häufigsten genutzten
Kombinationen erscheinen als Schnellauswahl. Beide Entitäten haben
orthogonale Zwecke und lassen sich nicht sinnvoll zusammenlegen.
