Umsetzung und Schwierigkeiten
================================

Lesson Learned 1: Gute Bedienung entsteht nicht von allein
----------------------------------------------------------

Am Anfang lag der Fokus stark auf der reinen Vertretungsanzeige. Erst später
wurde deutlich, dass ein brauchbares Produkt auch einen geführten Nutzerfluss
braucht: Registrierung, Admin-Ersteinrichtung, Onboarding und Dashboard mussten
aufeinander abgestimmt werden. Ohne diese Schritte wäre zwar Code vorhanden
gewesen, aber kein in sich schlüssiger Arbeitsablauf für echte Nutzer.

Gelernt wurde dabei vor allem, dass Produktqualität nicht nur aus
Datenverarbeitung besteht. Auch Weiterleitungen, Rollen und klare Einstiege sind
Teil der eigentlichen Funktion.

Lesson Learned 2: Echtzeit klingt besser, ist hier aber nicht sinnvoll
-----------------------------------------------------------------------

Die 15-Minuten-Frequenz ist ein bewusstes Ergebnis aus technischem Rahmen und
praktischem Nutzen. WebUntis liefert keinen Event-Stream, häufigeres Polling
würde Last und Fehlerpotenzial erhöhen, und im Schulalltag zählt
Verlässlichkeit mehr als Sekunden-Echtzeit.

Lesson Learned 3: Push-Notifications brauchen Zustandslogik
-----------------------------------------------------------

Es reicht nicht, bei jeder Änderung blind eine Nachricht zu verschicken. Erst
mit persönlichem Stundenplan, Delta-Logik und einem geplanten Dispatcher wurde
daraus eine Benachrichtigung, die im Alltag wirklich hilfreich ist. Die Einsicht:
Benachrichtigungen sind nur dann gut, wenn sie sparsam, relevant und technisch
kontrolliert ausgeliefert werden.

Lesson Learned 4: Hosting zwingt zu sauberen Schnittstellen
-----------------------------------------------------------

Sobald das Projekt nicht nur lokal, sondern als öffentliche Webanwendung
gedacht wurde, veränderte sich der Anspruch. Eine externe URL, gesetzte
Secrets, geschützte Routen und ein reproduzierbarer Deploy-Prozess wurden zu
Pflichtpunkten. Gerade für QStash und Push zeigte sich, dass eine lokale
Entwicklungsumgebung noch kein Beweis für echten Webbetrieb ist. Hinzu kam,
dass der Scheduler-Dienst QStash ausschließlich HTTPS-Endpunkte akzeptiert.
Diese Anforderung erzwang ein SSL-Zertifikat, brachte aber gleichzeitig den
Vorteil, dass sämtlicher Datenverkehr zwischen Nutzer und Anwendung
verschlüsselt übertragen wird.

Lesson Learned 5: Oberfläche gestalten braucht Klarheit
-------------------------------------------------------

Die Gestaltung der Benutzeroberfläche erwies sich als einer der aufwendigsten
Teile des Projekts. Insgesamt durchlief das Interface drei Iterationen: von
einer rein funktionalen ersten Version über eine benutzbare zweite bis hin zu
einer Oberfläche, die funktional, hilfreich und ansprechend ist. Der größte
Zeitfresser war dabei, dass Styling-Entscheidungen erst sinnvoll getroffen
werden konnten, nachdem klar war, welche Inhalte und Funktionen die Anwendung
überhaupt anbieten soll.

Wo es nicht sofort funktioniert hat
-----------------------------------

Rückblickend gab es drei typische Stolperstellen:

1. Der Produktumfang war anfangs zu breit gedacht und musste auf einen klaren
   Nutzerkern reduziert werden.
2. Der Nutzerfluss zwischen Registrierung, Admin-Setup und Onboarding war erst
   nach mehreren Anpassungen wirklich schlüssig.
3. Push-Notifications brauchten mehr Hintergrundlogik als anfangs erwartet.

Diese Punkte waren keine Rückschläge ohne Nutzen, sondern genau die Phasen,
aus denen der größte Lerngewinn entstand.

Grenzen der Lösung
-------------------

**Kein Mehrmandantenbetrieb.** Das System ist auf eine Schule (FDS Limburg)
bezogen. Mehrere Schulen zu unterstützen würde bedeuten, für jede separate
WebUntis-Zugangsdaten zu haben.

**Keine native App.** Web Push funktioniert auf Apple-Geräten (iPhone, iPad
und Mac) als auch auf Desktop zuverlässig.

**Kein formales DSGVO-Audit.** Technische Maßnahmen (Hashing, HTTPS, CSP,
minimale Datenhaltung) sind umgesetzt, eine juristische Prüfung lag jedoch
außerhalb des Projektumfangs.

Eigenleistung und Werkzeugeinsatz
---------------------------------

Kein Framework liefert eine fertige Vertretungsplan-App. Die Eigenleistung
liegt in Architektur, Stundenplanabgleich, Delta-basierter
Benachrichtigungslogik und Caching - also genau den Teilen, die das Projekt
von einer reinen Konfigurationsarbeit unterscheiden.
