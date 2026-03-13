02 Informationsquellen und Anforderungen (Lastenheft)
=====================================================

Rolle dieses Kapitels
---------------------

Das Lastenheft beschreibt die fachliche Sicht: Welche Probleme sollen geloest
werden, welche Anforderungen bestehen, und woran Erfolg gemessen wird.
Technische Implementierungsdetails gehoeren nicht in dieses Kapitel.

Informationsquellen
-------------------

Die Anforderungen wurden aus folgenden Quellen zusammengefuehrt:

- Schulalltag: Bedarf an schneller, mobiler Vertretungsinformation.
- Projektartefakte: ``README.md``, ``TODO.md`` und vorhandene UI-Struktur.
- Rechtliche Anforderungen: Impressum und Datenschutz als Pflichtbestandteil.
- Qualitaetsziele: Tests, Linting und robuste Fehlerdarstellung.

Stakeholder
-----------

- Primaer: Schuelerinnen, Schueler und Lehrkraefte.
- Sekundaer: Projektbetreiber und Schule als organisatorischer Rahmen.
- Extern: WebUntis als datenlieferndes Fremdsystem.

Funktionale Anforderungen
-------------------------

1. Tagesbezogene Anzeige von Vertretungen.
2. Such- und Filtermoeglichkeiten fuer schnelle Orientierung.
3. Verstaendliche Darstellung bei leerem Plan, Teildaten oder Fehlern.
4. Registrierung, Login und persoenlicher Stundenplan fuer angemeldete Nutzer.
5. Zugriff auf rechtliche Pflichtseiten.

Bedienanforderungen
-------------------

Die Anwendung sollte nicht nur Informationen bereitstellen, sondern auch ohne
Einweisung verstaendlich benutzbar sein. Daraus ergeben sich drei
Bedienanforderungen:

1. Der Einstieg fuer Gaeste muss sofort funktionieren, ohne dass zuerst ein
   Konto angelegt werden muss.
2. Der Wechsel von Registrierung zu Onboarding und danach ins Dashboard muss
   nachvollziehbar gefuehrt werden.
3. Push-Notifications und persoenliche Einstellungen muessen als Zusatznutzen
   erkennbar sein, ohne die Grundfunktion der Vertretungsanzeige zu ueberladen.

Nicht-funktionale Anforderungen
-------------------------------

1. Kurze Antwortzeiten und stabile Darstellung.
2. Sicherheit im Browserbetrieb (CSP, geschuetzte Endpunkte, Login-Fuehrung).
3. Wartbarkeit durch klare Modultrennung.
4. Nachvollziehbarkeit durch dokumentierten Build- und Testprozess.

SMART-Ziele (S1 bis S5)
-----------------------

.. list-table:: SMART-Ziele mit messbaren Erfolgskriterien
   :header-rows: 1
   :widths: 8 30 22 20 20

   * - ID
     - Spezifisch
     - Messbar
     - Attraktiv/Relevant
     - Terminiert
   * - S1
     - Vertretungsinfos fuer ein Datum in maximal drei Interaktionen erreichen.
     - Datum waehlen, Daten laden, Ergebnis sichtbar; kein zusaetzlicher Seitenwechsel.
     - Spart Zeit im Schulalltag.
     - Bis 30.11.2025
   * - S2
     - Such- und Filterfunktionen fuer Klassen/Faecher/Typen bereitstellen.
     - Kombination aus Textsuche plus Kategorienfilter funktioniert stabil.
     - Erhoeht Orientierung bei vielen Eintraegen.
     - Bis 15.12.2025
   * - S3
     - Robuste API-Nutzung mit klaren Fehlerpfaden sicherstellen.
     - Rate-Limit, Retry-Logik und definierte Fehlerantworten sind implementiert und getestet.
     - Verhindert Ausfaelle bei Lastspitzen oder Upstream-Problemen.
     - Bis 22.12.2025
   * - S4
     - Sicherheits- und Datenschutzbasis fuer Browserbetrieb sicherstellen.
     - CSP aktiv, Auth-Guard fuer geschuetzte Bereiche, Impressum/Datenschutz erreichbar.
     - Erfuellt Schul- und Web-Grundanforderungen.
     - Bis 10.01.2026
   * - S5
     - Wartbarkeit und Nachvollziehbarkeit der Loesung absichern.
     - Testdateien fuer Kernrouten vorhanden und Build-/Doku-Prozess dokumentiert.
     - Senkt Risiko bei spaeteren Aenderungen.
     - Bis 31.01.2026

Abgrenzung zu Kapitel 03
------------------------

- Kapitel 02: Ziele, Anforderungen, Erfolgskriterien aus Nutzersicht.
- Kapitel 03: konkrete technische Architektur und Implementierung.

Diese Trennung sorgt dafuer, dass die Dokumentation fachlich und technisch
sauber argumentiert.

Fazit
-----

Das Lastenheft legt mit den SMART-Zielen ``S1`` bis ``S5`` den verbindlichen
Bewertungsrahmen fest. Kapitel 08 nutzt dieselben IDs fuer den Soll-Ist-
Abgleich.
