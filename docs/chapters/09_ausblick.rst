Ausblick
===========

Weiterentwicklung
-----------------

Der nächste logische Schritt ist eine Testgruppe mit mehr als sieben aktiv
nutzenden Personen, um belastbares Feedback zu Bedienbarkeit und
Alltagstauglichkeit zu sammeln. Daraus ließen sich gezielt weitere
Verbesserungen ableiten:

1. feinere Personalisierung für Klassen, Kurse oder Lehrkräfte,
2. klarere Priorisierung wichtiger Änderungen,
3. Testabdeckung für Randfälle in Push, Auth und Fehlerbehandlung erweitern,
4. Admin-Funktionen für Nutzerverwaltung und Datenpflege vereinfachen,
5. systematischere Beobachtung von Push-Erfolg und Fehlerquoten.

Solange das nicht der Fall ist, bleibt der 15-Minuten-Dispatcher die
vernünftigere Lösung.

Fazit
-----

Das Projekt hat sein zentrales Ziel erreicht: eine Webanwendung, die
Vertretungsdaten der Friedrich-Dessauer-Schule schnell, gefiltert und
personalisiert bereitstellt. Die vier Kernziele (S1–S4) sind vollständig
erfüllt, das fünfte Ziel (S5, Wartbarkeit) ist in weiten Teilen umgesetzt.

Die technisch anspruchsvollsten Eigenleistungen liegen im
Stundenplan-Abgleich, der Delta-basierten Push-Logik und der mehrstufigen
Caching-Strategie. Diese Bausteine unterscheiden das Projekt von einer reinen
Konfigurationsarbeit und zeigen, dass auch ein Schulprojekt belastbare
Architekturentscheidungen erfordert.

Gleichzeitig bleiben Grenzen bestehen: Die Anwendung ist auf eine Schule
bezogen, hat kein formales DSGVO-Audit durchlaufen und wird als Webanwendung
statt als native App betrieben. Diese Einschränkungen waren von Anfang an
bekannt und bewusst in Kauf genommen.

Rückblickend war der größte Lerngewinn nicht die Implementierung einzelner
Features, sondern das Zusammenspiel von Nutzerführung, API-Robustheit,
Hintergrundprozessen und Hosting zu einem funktionierenden Gesamtprodukt.
