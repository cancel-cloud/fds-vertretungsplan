# Screenshot-Plan für die BLL-Präsentation

Ziel: Screenshots sollen die technische Erzählung unterstützen, nicht die Folien überladen. Pro Screenshot möglichst Browserbreite 1440 x 900, Light- oder Dark-Mode einheitlich wählen, echte Secrets und private E-Mail-Adressen ausblenden.

## 1. Dashboard: Alle Vertretungen

- Route: `/` oder `/stundenplan/dashboard?scope=all`
- Zustand: Datum mit mehreren Vertretungen auswählen.
- Sichtbar machen: Titel "Vertretungsplan", Datum, Suche, Eintragsliste, Zähler "Einträge".
- Zweck in der Präsentation: Ausgangspunkt der allgemeinen WebUntis-Datenansicht.
- Wenn keine echten Daten verfügbar sind: Demo-Modus verwenden; falls auch das nicht möglich ist, als "Demo-Daten" beschriften.

## 2. Dashboard: Persönliche Ansicht

- Route: `/stundenplan/dashboard?scope=personal`
- Voraussetzung: angemeldeter User mit hinterlegtem Stundenplan.
- Sichtbar machen: Umschalter "Meine Vertretungen" / "Alle Vertretungen", Zähler "relevante Einträge", persönliche Ergebnisliste oder leerer persönlicher Zustand.
- Zweck in der Präsentation: Ergebnis des Matching-Algorithmus zeigen.
- Hinweis: Falls keine Treffer vorhanden sind, Screenshot mit "Keine passenden Vertretungen" nutzen und in der Folie erklären, dass die Logik trotzdem ausgeführt wurde.

## 3. Stundenplan-Editor oder Onboarding

- Route: `/stundenplan/onboarding` oder `/stundenplan/stundenplan`
- Voraussetzung: User ohne abgeschlossenen Stundenplan für Onboarding oder bestehender User für Editor.
- Sichtbar machen: Wochentag, Startstunde, Dauer, Fach, Lehrer, Raum und Wochenmodus.
- Zweck in der Präsentation: Datenquelle für persönliches Matching zeigen.
- Optional: Konflikt-Dialog oder Fehlermeldung bei überlappenden Stunden zeigen, wenn ohne großen Aufwand reproduzierbar.

## 4. Push-Einstellungen

- Route: `/stundenplan/settings`
- Voraussetzung: angemeldeter User; Browser mit Push-Unterstützung oder klar sichtbarer "nicht verfügbar"-Zustand.
- Sichtbar machen: Benachrichtigungen aktivieren/deaktivieren, Gerätebezug, Lookahead-Schultage falls sichtbar.
- Zweck in der Präsentation: Verbindung zwischen Nutzerentscheidung, PushSubscription und Notification-State erklären.
- Hinweis: iOS-spezifische Installationshinweise nur zeigen, wenn sie wirklich im aktuellen Browserzustand erscheinen.

## 5. Admin-Panel

- Route: `/stundenplan/admin`
- Voraussetzung: Admin-User.
- Sichtbar machen: Lehrer-Verwaltung, User-Verwaltung, Push-Testbereich.
- Zweck in der Präsentation: Rollenmodell und Pflege fachlicher Stammdaten zeigen.
- Grenze: Ein Admin-UI-Button zum geplanten Dispatch ist nicht aus der Codebase ersichtlich; sichtbar ist ein Push-Testbereich.

## 6. Empty State

- Route: `/stundenplan/dashboard?scope=all` oder `scope=personal`
- Zustand: Datum ohne Vertretungen oder persönlicher Stundenplan ohne passende Treffer.
- Sichtbar machen: "Keine Vertretungen" oder "Keine passenden Vertretungen".
- Zweck in der Präsentation: robuste UI für normale Null-Ergebnisse zeigen.

## 7. Error State

- Route: `/stundenplan/dashboard`
- Zustand: Upstream/API-Fehler provozieren, z. B. lokal mit ungültiger WebUntis-Konfiguration oder Netzwerkfehler.
- Sichtbar machen: "Fehler beim Laden" und Button "Erneut versuchen".
- Zweck in der Präsentation: Fehlerbehandlung statt Absturz zeigen.
- Hinweis: Nur in einer lokalen oder Demo-Umgebung provozieren, nicht in Produktion.
