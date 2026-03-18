Umsetzung und Schwierigkeiten
================================

Lesson Learned 1: Gute Bedienung entsteht nicht von allein
----------------------------------------------------------

Am Anfang lag der Fokus stark auf der reinen Vertretungsanzeige. Erst im
Verlauf der Entwicklung wurde deutlich, dass ein brauchbares Produkt auch
einen geführten Nutzerfluss braucht: Registrierung, Admin-Ersteinrichtung,
Onboarding und Dashboard mussten konzeptionell aufeinander abgestimmt werden.
Ohne diesen Ablauf wäre zwar funktionierender Code vorhanden gewesen, aber
kein in sich schlüssiger Arbeitsablauf für echte Nutzerinnen und Nutzer.

Der wesentliche Erkenntnisgewinn war: Produktqualität erschöpft sich nicht
in korrekter Datenverarbeitung. Weiterleitungslogik, Rollenkonzept und klare
Einstiegspunkte sind gleichwertige Bestandteile der eigentlichen
Systemfunktion - nicht nachgelagerte Kosmetik.

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

Lesson Learned 5: Oberfläche gestalten braucht inhaltliche Klarheit zuerst
---------------------------------------------------------------------------

Die Gestaltung der Benutzeroberfläche erwies sich als einer der aufwendigsten
Teile des Projekts. Das Interface durchlief insgesamt drei Iterationen: von
einer rein funktionalen ersten Fassung über eine grundlegend bedienbare zweite
bis hin zu einer Oberfläche, die funktional, hilfreich und ansprechend ist.
Die entscheidende Erkenntnis war dabei, dass Gestaltungsentscheidungen erst
dann sinnvoll getroffen werden können, wenn der Funktionsumfang und die
inhaltliche Struktur feststehen. Wer zu früh an der Oberfläche arbeitet,
überarbeitet sie zwangsläufig, sobald sich die Anforderungen konkretisieren.

Wo es nicht sofort funktioniert hat
-----------------------------------

Rückblickend gab es drei typische Stolperstellen, die sich durch alle
Entwicklungsphasen zogen:

1. Der Produktumfang war anfangs zu breit gedacht und musste auf einen klaren
   Nutzerkern reduziert werden. Die ersten beiden Versionen (V1 und V2,
   beschrieben in Kapitel 3a) zeigen, wie dieser Klärungsprozess verlief.
2. Der Nutzerfluss zwischen Registrierung, Admin-Setup und Onboarding war erst
   nach mehreren Überarbeitungen wirklich in sich schlüssig - technische
   Korrektheit und tatsächliche Bedienbarkeit sind zwei verschiedene Dinge.
3. Push-Benachrichtigungen erforderten deutlich mehr Zustandslogik als
   anfangs erwartet: Ohne Delta-Vergleich, Fingerabdruck-Speicherung und
   geplanten Dispatcher hätten die Nutzer bei jeder Abfrage eine Nachricht
   erhalten - unabhängig davon, ob sich etwas verändert hatte.

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
minimale Datenhaltung) sind umgesetzt, [#s07_1]_ eine juristische Prüfung lag
jedoch außerhalb des Projektumfangs.

Eigenleistung und Werkzeugeinsatz
---------------------------------

Kein Framework liefert eine fertige Vertretungsplan-App. Die Eigenleistung
liegt in Architektur, Stundenplanabgleich, Delta-basierter
Benachrichtigungslogik und Caching - also genau den Teilen, die das Projekt
von einer reinen Konfigurationsarbeit unterscheiden.

Die WebUntis-Schnittstelle wurde ohne externe Dokumentation durch eigene
Netzwerkanalyse erschlossen. Das Datenbankmodell, die Rollenstruktur und die
Dispatch-Logik wurden selbst konzipiert. KI-Werkzeuge (konkret: Claude)
wurden punktuell eingesetzt, um Entwürfe für das Datenbankschema zu
validieren und auf strukturelle Schwachstellen zu prüfen. Alle
Architekturentscheidungen - welche Tabellen, welche Relationen, welche
Indexierung - wurden eigenständig getroffen; die KI diente dabei als
kritisches Gegenüber, nicht als Entscheidungsinstanz. Implementierung,
Tests und Dokumentation entstanden vollständig in eigener Arbeit.

.. [#s07_1] Vgl. OWASP Top 10 (2021): Die gewählten Maßnahmen adressieren
   u.a. Injection (A03), Security Misconfiguration (A05) und Identification
   and Authentication Failures (A07).
