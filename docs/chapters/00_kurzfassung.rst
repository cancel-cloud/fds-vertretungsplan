Kurzfassung
===========

Der offizielle Vertretungsplan der Friedrich-Dessauer-Schule Limburg war für
Schülerinnen und Schüler nur über WebUntis zugänglich - eine Plattform, die
einen schulischen Account voraussetzt und keine gezielte Filterung nach
eigenen Fächern ermöglicht. Ziel dieser Besonderen Lernleistung war es, eine
personalisierte, öffentlich zugängliche Vertretungsplan-Webanwendung zu
entwickeln, die diesen Informationszugang grundlegend verbessert.

Die Entwicklung verlief in drei Iterationen: Eine erste statische Version ohne
Backend zeigte die Grenzen eines filterfreien Ansatzes. Eine zweite, auf
Next.js basierende Version ohne Authentifizierung machte die Notwendigkeit
einer sauberen Komponentenstruktur und API-Trennung deutlich. Die dritte und
aktuelle Version wurde von Grund auf neu entwickelt und vereint
Nutzerauthentifizierung, eine relationale Datenbank, einen cachegestützten
API-Proxy und ein Delta-basiertes Push-Benachrichtigungssystem.

Die technische Realisierung erfolgte mit Next.js (App Router), NextAuth,
Prisma (PostgreSQL) und dem Web-Push-Standard (VAPID). Die
WebUntis-Schnittstelle wurde durch systematisches Reverse-Engineering
erschlossen. Architektur, Datenmodell und Benachrichtigungslogik wurden
eigenständig konzipiert. Das System ist produktiv im Einsatz; 134 automatisierte
Testfälle sichern die Kernlogik ab.

Die Arbeit ist dem Fach Informatik zuzuordnen und umfasst Konzeption,
Implementierung und Dokumentation einer vollständigen Webanwendung.
