02 Informationsquellen und Anforderungen (Lastenheft)
=====================================================

Informationsquellen
-------------------

Die Anforderungen wurden aus folgenden Quellen zusammengeführt:

- Schulalltag: Bedarf an schneller, mobiler Vertretungsinformation.
- Eigene Projektdokumentation und vorhandene Oberflächenstruktur.
- Rechtliche Anforderungen: Impressum und Datenschutz als Pflichtbestandteil.
- Qualitätsziele: Tests, Linting und robuste Fehlerdarstellung.

Zielgruppen und Beteiligte
--------------------------

- Primär: Schülerinnen, Schüler und Lehrkräfte.
- Sekundär: Projektbetreiber und Schule als organisatorischer Rahmen.
- Extern: WebUntis als datenlieferndes Fremdsystem.

Funktionale Anforderungen
-------------------------

1. Tagesbezogene Anzeige von Vertretungen.
2. Such- und Filtermöglichkeiten für schnelle Orientierung.
3. Verständliche Darstellung bei leerem Plan, Teildaten oder Fehlern.
4. Registrierung, Login und persönlicher Stundenplan für angemeldete Nutzer.
5. Zugriff auf rechtliche Pflichtseiten.

Bedienanforderungen
-------------------

Die Anwendung sollte nicht nur Informationen bereitstellen, sondern auch ohne
Einweisung verständlich benutzbar sein. Daraus ergeben sich drei
Bedienanforderungen:

1. Der Einstieg für Gäste muss sofort funktionieren, ohne dass zuerst ein
   Konto angelegt werden muss.
2. Der Wechsel von Registrierung zu Onboarding und danach ins Dashboard muss
   nachvollziehbar geführt werden.
3. Push-Notifications und persönliche Einstellungen müssen als Zusatznutzen
   erkennbar sein, ohne die Grundfunktion der Vertretungsanzeige zu überladen.

Nicht-funktionale Anforderungen
-------------------------------

1. Kurze Antwortzeiten und stabile Darstellung.
2. Sicherheit im Browserbetrieb.
3. Wartbarkeit durch klare Modultrennung.
4. Nachvollziehbarkeit durch Tests und Dokumentation.

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
     - Vertretungsinfos für ein Datum in maximal drei Interaktionen erreichen.
     - Datum wählen, Daten laden, Ergebnis sichtbar; kein zusätzlicher Seitenwechsel.
     - Spart Zeit im Schulalltag.
     - Bis 30.11.2025
   * - S2
     - Such- und Filterfunktionen für Klassen/Fächer/Typen bereitstellen.
     - Kombination aus Textsuche plus Kategorienfilter funktioniert stabil.
     - Erhöht Orientierung bei vielen Einträgen.
     - Bis 15.12.2025
   * - S3
     - Robuste API-Nutzung mit klaren Fehlerpfaden sicherstellen.
     - Rate-Limit, Retry-Logik und definierte Fehlerantworten sind implementiert und getestet.
     - Verhindert Ausfälle bei Lastspitzen oder Upstream-Problemen.
     - Bis 22.12.2025
   * - S4
     - Sicherheits- und Datenschutzbasis für Browserbetrieb sicherstellen.
     - CSP aktiv, Auth-Guard für geschützte Bereiche, Impressum/Datenschutz erreichbar.
     - Erfüllt Schul- und Web-Grundanforderungen.
     - Bis 10.01.2026
   * - S5
     - Wartbarkeit und Nachvollziehbarkeit der Lösung absichern.
     - Testdateien für Kernrouten vorhanden und Build-/Doku-Prozess dokumentiert.
     - Senkt Risiko bei späteren Änderungen.
     - Bis 31.01.2026
