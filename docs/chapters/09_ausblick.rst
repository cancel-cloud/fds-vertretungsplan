09 Ausblick
===========

Produktperspektive
------------------

Der nächste sinnvolle Schritt ist eine systematische Rückkopplung mit echten
Nutzergruppen. Nur so lässt sich bewerten, welche Filter, Darstellungsformen
oder Benachrichtigungen den größten Mehrwert liefern.

Technische Perspektive
----------------------

1. New-UI-Variante schrittweise über Feature-Flags ausrollen.
2. Fehler- und Lasttests um weitere reale Störszenarien erweitern.
3. Optional: Export- oder Benachrichtigungsfunktionen für wichtige Änderungen.

Betriebsperspektive
-------------------

Mit der bestehenden Architektur können diese Erweiterungen inkrementell erfolgen,
ohne den Kernfluss (UI -> Hook -> API -> WebUntis) grundlegend zu verändern.
Das reduziert Risiko und erleichtert langfristige Wartung.
