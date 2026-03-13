07 Umsetzung und Schwierigkeiten
================================

Warum dieses Kapitel wichtig ist
--------------------------------

Die interessantesten Erkenntnisse des Projekts entstanden nicht dort, wo alles
funktionierte, sondern dort, wo erste Ideen an Grenzen stiessen. Genau diese
Stellen sind fuer die Bewertung wichtig, weil sie zeigen, wie aus Problemen
konkrete technische Entscheidungen wurden.

Lesson Learned 1: Gute Bedienung entsteht nicht von allein
----------------------------------------------------------

Am Anfang lag der Fokus stark auf der reinen Vertretungsanzeige. Erst spaeter
wurde deutlich, dass ein brauchbares Produkt auch einen gefuehrten Nutzerfluss
braucht: Registrierung, Admin-Ersteinrichtung, Onboarding und Dashboard mussten
aufeinander abgestimmt werden. Ohne diese Schritte waere zwar Code vorhanden
gewesen, aber kein in sich schluessiger Arbeitsablauf fuer echte Nutzer.

Gelernt wurde dabei vor allem, dass Produktqualitaet nicht nur aus
Datenverarbeitung besteht. Auch Weiterleitungen, Rollen und klare Einstiege sind
Teil der eigentlichen Funktion.

Lesson Learned 2: Echtzeit klingt besser, ist hier aber nicht sinnvoll
-----------------------------------------------------------------------

Eine naheliegende Idee waere gewesen, Vertretungsdaten moeglichst haeufig oder
sogar sekundenweise neu abzurufen. In der Praxis waere das fuer dieses Projekt
jedoch die falsche Entscheidung gewesen:

- Die Datenquelle arbeitet nicht als echter Event-Stream.
- Haeufigere Polls haetten Last und Fehlerpotenzial erhoeht.
- Im Schulalltag zaehlt Verlaesslichkeit mehr als Sekunden-Echtzeit.

Die 15-Minuten-Frequenz ist deshalb ein bewusstes Ergebnis aus technischem
Rahmen und praktischem Nutzen. Diese Einsicht war wichtiger als der anfaengliche
Wunsch nach maximaler Aktualitaet.

Lesson Learned 3: Push-Notifications brauchen Zustandslogik
-----------------------------------------------------------

Push war einer der Punkte, die in der Vorstellung einfacher klangen als in der
Umsetzung. Es reicht nicht, bei jeder Aenderung blind eine Nachricht zu
verschicken. Erst mit persoenlichem Stundenplan, Delta-Logik, Push-Fenstern und
einem geplanten Dispatcher wurde daraus eine Benachrichtigung, die im Alltag
wirklich hilfreich ist.

Der wichtigste Lerngewinn war hier: Benachrichtigungen sind nur dann gut, wenn
sie sparsam, relevant und technisch kontrolliert ausgeliefert werden.

Lesson Learned 4: Hosting zwingt zu sauberen Schnittstellen
-----------------------------------------------------------

Sobald das Projekt nicht nur lokal, sondern als oeffentliche Webanwendung
gedacht wurde, veraenderte sich der Anspruch. Eine externe URL, gesetzte
Secrets, geschuetzte Routen und ein reproduzierbarer Deploy-Prozess wurden zu
Pflichtpunkten. Gerade fuer QStash und Push zeigte sich, dass eine lokale
Entwicklungsumgebung noch kein Beweis fuer echten Webbetrieb ist.

Dadurch wurde klar, wie wichtig saubere Umgebungsvariablen, feste Endpunkte und
ein reproduzierbarer Build sind.

Wo es nicht sofort funktioniert hat
-----------------------------------

Rueckblickend gab es drei typische Stolperstellen:

1. Der Produktumfang war anfangs zu breit gedacht und musste auf einen klaren
   Nutzerkern reduziert werden.
2. Der Nutzerfluss zwischen Registrierung, Admin-Setup und Onboarding war erst
   nach mehreren Anpassungen wirklich schluessig.
3. Push-Notifications brauchten mehr Hintergrundlogik als anfangs erwartet.

Diese Punkte waren keine Rueckschlaege ohne Nutzen, sondern genau die Phasen,
aus denen der groesste Lerngewinn entstand.

Fazit
-----

Das Projekt hat gezeigt, dass professionelle Wirkung nicht aus moeglichst viel
Technik entsteht, sondern aus passenden Entscheidungen. Besonders wichtig waren
dabei die Einsicht, Echtzeit nicht zu ueberschaetzen, Nutzerfuehrung ernst zu
nehmen und Hintergrundprozesse kontrolliert statt spektakulaer zu bauen.
