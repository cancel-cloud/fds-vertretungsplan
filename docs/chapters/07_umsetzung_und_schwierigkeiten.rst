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

Grenzen der Loesung und verworfene Alternativen
------------------------------------------------

**Kein Mehrmandantenbetrieb.** Das System ist auf eine Schule (FDS Limburg)
zugeschnitten. Mehrere Schulen zu unterstuetzen wuerde Mandantentrennung und
separate WebUntis-Zugangsdaten erfordern — ein deutlich groesserer
Architekturaufwand, der den BLL-Rahmen sprengen wuerde.

**Keine native App.** Web Push funktioniert auf Android und Desktop zuverlaessig,
aber die iOS-Unterstuetzung fuer Web Push ist weiterhin eingeschraenkt. Eine
native App haette dieses Problem geloest, waere aber mit erheblichem Mehraufwand
fuer Entwicklung und Verteilung verbunden gewesen.

**Keine Echtzeit-Aktualisierung.** WebUntis bietet keinen Event-Stream. Die
15-Minuten-Abfrage ueber QStash ist daher die praktisch sinnvolle Obergrenze,
nicht eine kuenstliche Einschraenkung.

**Kein formales DSGVO-Audit.** Technische Massnahmen (Hashing, HTTPS, CSP,
minimale Datenhaltung) sind umgesetzt, eine juristische Pruefung lag jedoch
ausserhalb des Projektumfangs.

**Verworfene Alternative: WebSocket/SSE.** Echtzeitprotokolle wurden frueh
verworfen, weil die Datenquelle kein ereignisbasiertes Modell unterstuetzt.
Die zusaetzliche Komplexitaet haette keinen realen Vorteil gebracht.

**Verworfene Alternative: Native App.** Eine PWA deckt die meisten
Anwendungsfaelle ohne App-Store-Aufwand ab. Push war der Haupttreiber, und
Web Push genuegt dafuer auf den relevanten Plattformen.

**Verworfene Alternative: Redis als externer Cache.** Ein In-Memory-Cache
genuegt, weil die Anwendung als einzelne Instanz laeuft. Redis haette
operativen Mehraufwand erzeugt, ohne die Leistung merklich zu verbessern.

Die Architektur bevorzugt bewusst Einfachheit, Wartbarkeit und Passung zum
Schulkontext gegenueber Featurevollstaendigkeit oder theoretischer Eleganz.

Eigenleistung und Werkzeugeinsatz
---------------------------------

Das Projekt nutzt etablierte Frameworks und Bibliotheken als Bausteine:
Next.js fuer Routing und serverseitige Logik, shadcn/ui fuer
UI-Komponenten und Prisma fuer den Datenbankzugriff. Diese Werkzeuge
liefern Struktur und Grundfunktionen, aber keine projektspezifischen
Loesungen — Architektur, Geschaeftslogik und Integration mussten
eigenstaendig entworfen und umgesetzt werden.

Die eigentliche Kernleistung liegt in der Problemanalyse, dem
Architekturentwurf, der Datenflussgestaltung und den projektspezifischen
Algorithmen: Schedule-Matching mit Confidence-Scoring, Delta-basierte
Push-Logik mit Fingerprint-Vergleich und die Caching-Strategie mit
Stale-while-revalidate. Diese Bestandteile sind nicht aus Vorlagen oder
Standardloesungen ableitbar, sondern Ergebnis eigenstaendiger
Entwurfsarbeit.

Fazit
-----

Das Projekt hat gezeigt, dass professionelle Wirkung nicht aus moeglichst viel
Technik entsteht, sondern aus passenden Entscheidungen. Besonders wichtig waren
dabei die Einsicht, Echtzeit nicht zu ueberschaetzen, Nutzerfuehrung ernst zu
nehmen und Hintergrundprozesse kontrolliert statt spektakulaer zu bauen.
