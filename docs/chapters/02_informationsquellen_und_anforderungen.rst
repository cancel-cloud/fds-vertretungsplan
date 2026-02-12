02 Informationsquellen und Anforderungen (Lastenheft)
=====================================================

Rolle dieses Kapitels
---------------------

Das Lastenheft beschreibt die fachliche Sicht: Welche Probleme sollen gelöst
werden, welche Anforderungen bestehen, und woran wird Erfolg gemessen.
Technische Implementierungsdetails gehören explizit nicht hierher.

Informationsquellen
-------------------

Die Anforderungen wurden aus folgenden Quellen zusammengeführt:

- Schulalltag: Bedarf an schneller, mobiler Vertretungsinformation.
- Projektartefakte: ``README.md``, ``TODO.md`` und bestehende UI-Struktur.
- Rechtliche Seiten: Impressum/Datenschutz als verpflichtender Bestandteil.
- Qualitätsziele: Tests, Linting und robuste Fehlerdarstellung.

Stakeholder
-----------

- Primär: Schülerinnen, Schüler, Lehrkräfte.
- Sekundär: Projektbetreiber und Schule als organisatorischer Rahmen.
- Extern: WebUntis als datenlieferndes Fremdsystem.

Funktionale Anforderungen
-------------------------

1. Tagesbezogene Anzeige von Vertretungen.
2. Such- und Filtermöglichkeiten für schnelle Orientierung.
3. Verständliche Darstellung bei leerem Plan, Teildaten oder Fehlern.
4. Zugriff auf rechtliche Pflichtseiten.

Nicht-funktionale Anforderungen
-------------------------------

1. Kurze Antwortzeiten und stabile Darstellung.
2. Sicherheit im Browserbetrieb (Header, CSP, keine unkontrollierten Endpunkte).
3. Wartbarkeit durch klare Modultrennung.
4. Nachvollziehbarkeit durch dokumentierten Build- und Testprozess.

Fachliche Datenbasis im Typsystem
---------------------------------

Das Typsystem (``src/types/index.ts``) definiert, welche Felder aus
Vertretungsdaten in der Anwendung wirklich fachlich relevant sind. Es belegt
damit die Grenze zwischen Rohdaten und nutzbarer Information.

Abgrenzung zu Kapitel 03
------------------------

- Kapitel 02: Ziele, Anforderungen, Erfolgskriterien aus Nutzersicht.
- Kapitel 03: konkrete technische Architektur und Implementierung.

Diese Trennung ist wichtig, damit die Dokumentation sowohl fachlich als auch
technisch sauber argumentiert.
