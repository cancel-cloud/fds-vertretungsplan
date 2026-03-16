07 Umsetzung und Schwierigkeiten
================================

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

Die 15-Minuten-Frequenz ist ein bewusstes Ergebnis aus technischem Rahmen und
praktischem Nutzen. WebUntis liefert keinen Event-Stream, haeufigeres Polling
wuerde Last und Fehlerpotenzial erhoehen, und im Schulalltag zaehlt
Verlaesslichkeit mehr als Sekunden-Echtzeit.

Lesson Learned 3: Push-Notifications brauchen Zustandslogik
-----------------------------------------------------------

Es reicht nicht, bei jeder Aenderung blind eine Nachricht zu verschicken. Erst
mit persoenlichem Stundenplan, Delta-Logik und einem geplanten Dispatcher wurde
daraus eine Benachrichtigung, die im Alltag wirklich hilfreich ist. Die Einsicht:
Benachrichtigungen sind nur dann gut, wenn sie sparsam, relevant und technisch
kontrolliert ausgeliefert werden.

Lesson Learned 4: Hosting zwingt zu sauberen Schnittstellen
-----------------------------------------------------------

Sobald das Projekt nicht nur lokal, sondern als oeffentliche Webanwendung
gedacht wurde, veraenderte sich der Anspruch. Eine externe URL, gesetzte
Secrets, geschuetzte Routen und ein reproduzierbarer Deploy-Prozess wurden zu
Pflichtpunkten. Gerade fuer QStash und Push zeigte sich, dass eine lokale
Entwicklungsumgebung noch kein Beweis fuer echten Webbetrieb ist.

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

Grenzen der Loesung
-------------------

**Kein Mehrmandantenbetrieb.** Das System ist auf eine Schule (FDS Limburg)
zugeschnitten. Mehrere Schulen zu unterstuetzen wuerde Mandantentrennung und
separate WebUntis-Zugangsdaten erfordern.

**Keine native App.** Web Push funktioniert auf Android und Desktop zuverlaessig,
aber die iOS-Unterstuetzung fuer Web Push ist weiterhin eingeschraenkt.

**Kein formales DSGVO-Audit.** Technische Massnahmen (Hashing, HTTPS, CSP,
minimale Datenhaltung) sind umgesetzt, eine juristische Pruefung lag jedoch
ausserhalb des Projektumfangs.

Eigenleistung und Werkzeugeinsatz
---------------------------------

Frameworks und Bibliotheken liefern Grundfunktionen, aber keine
projektspezifischen Loesungen. Architektur, Geschaeftslogik und die Algorithmen
fuer Stundenplanabgleich, Benachrichtigungslogik und Caching wurden
eigenstaendig entworfen.
