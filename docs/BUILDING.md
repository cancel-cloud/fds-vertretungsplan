# Dokumentation bauen (Sphinx -> LaTeX -> PDF)

## Voraussetzungen

- Python 3.11+
- `make`
- LaTeX mit `latexmk` und `pdflatex` (z. B. TeX Live / MacTeX)
- Java Runtime
- `plantuml` im `PATH`

## 1) Umgebung einrichten

```bash
cd /Users/cancelcloud/Developer/personal/fds-vertretungsplan/docs
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) HTML bauen

```bash
make html
```

Ergebnis: `_build/html/index.html`

## 3) PDF bauen

```bash
make latexpdf
```

Ergebnis: `_build/latex/bll-dokumentation.pdf`

## 4) Formale PDF-Prüfung

Nach dem Build prüfen:

- Deckblatt als erste Seite vorhanden
- Zeilenabstand sichtbar 1.5
- Seitenzahl unten rechts in den Folgeseiten
- Kapitel 00 bis 10 in Reihenfolge enthalten

## Troubleshooting

### Fehler: `plantuml` fehlt

```bash
brew install plantuml graphviz
```

### Fehler: `latexmk` / `pdflatex` fehlt

Installiere eine vollständige LaTeX-Distribution und starte `make latexpdf` erneut.

### Rückstandsfrei entfernen

Siehe `docs/DEINSTALLATION.md`.
