Moderne Webentwicklung am Beispiel einer alternativen Vertretungsplan-Anwendung
================================================================================

**Problem der aktuellen Vertretungsübersicht**

Der offizielle WebUntis-Vertretungsplan der Friedrich-Dessauer-Schule Limburg
zeigte Einträge als automatisch durchlaufende Liste - ohne Suchfunktion, ohne
Filter. Wer seinen Eintrag sehen wollte, musste warten, bis die eigene Klasse
erschien. Wer zu früh wegschaute, riskierte, in den falschen Raum zu gehen,
eine Freistunde zu verpassen oder unnötig früh erschienen zu sein.

Dazu kommt eine strukturelle Einschränkung: Die offizielle WebUntis-App setzt
einen Schulaccount voraus - nur Schülerinnen und Schüler der FDS haben diesen.
Die FDS wird jedoch auch von Lernenden anderer Schulen besucht, etwa in
Kooperationsklassen. Diese Gruppe verfügt über keinen WebUntis-Account, hat
aber denselben Informationsbedarf wie alle anderen.

**Ziel des Systems**

Ziel war eine Vertretungsübersicht, die für alle zugänglich ist - unabhängig
davon, ob ein WebUntis-Account vorhanden ist oder nicht. Wer seinen Stundenplan
hinterlegt, sieht sofort nur die eigenen relevanten Einträge. Wer sich nicht
anmelden will oder kann, nutzt die öffentliche, filterbare Ansicht.

Zusätzlich sollte die Anwendung proaktiv informieren: Nutzer werden automatisch
benachrichtigt, wenn sich relevante Vertretungen ändern - ohne manuell
nachschauen zu müssen.

**Kurzbeschreibung der Lösung**

Die Lösung ist eine plattformunabhängige Webanwendung: keine Installation,
läuft auf Smartphone, Tablet und Desktop. Öffentlicher Zugang ohne Anmeldung
ist der Standard; wer sich registriert und seinen Stundenplan eingibt, erhält
ein personalisiertes Dashboard.

Das technische Kernstück ist ein Delta-basierter Push-Prozess: Alle 15 Minuten
wird geprüft, ob sich relevante Vertretungen geändert haben. Nur bei echten
Änderungen wird eine Nachricht gesendet - kein Benachrichtigungsrauschen. Die
Darstellung ist für alle Nutzergruppen gleich einfach: mit oder ohne
persönlichem Stundenplan.

.. toctree::
   :maxdepth: 2
   :caption: Inhalte
   :numbered:

   chapters/00_kurzfassung
   chapters/01_einleitung_und_motivation
   chapters/02_informationsquellen_und_anforderungen
   chapters/03_loesungsansatz_und_pflichtenheft
   chapters/03a_projektmanagement_und_zeitplanung
   chapters/04_tools_und_tech_stack
   chapters/06_uml_und_ablaeufe
   chapters/07_umsetzung_und_schwierigkeiten
   chapters/08_ergebnisbewertung
   chapters/09_ausblick
   chapters/10_quellen
