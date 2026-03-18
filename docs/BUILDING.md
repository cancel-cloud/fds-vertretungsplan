# Dokumentation bauen (Sphinx -> LaTeX -> PDF)

## Voraussetzungen

- Python 3.11+
- `make`
- LaTeX mit `latexmk` und `pdflatex` (z. B. TeX Live / MacTeX)
- Java Runtime
- `plantuml` im `PATH`
- Node.js + `npx` (fuer Mermaid CLI)

## 1) Umgebung einrichten

```bash
cd /Users/cancelcloud/Developer/personal/fds-vertretungsplan/docs
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Mermaid CLI pruefen

In `conf.py` wird `mermaid_output_format = 'svg'` verwendet. Dafuer muss die
Mermaid CLI verfuegbar sein.

```bash
npx -p @mermaid-js/mermaid-cli mmdc -h
```

Alternative global:

```bash
npm install -g @mermaid-js/mermaid-cli
```

## 3) HTML bauen

```bash
make html
```

Ergebnis: `_build/html/index.html`

## 4) PDF bauen

```bash
make latexpdf
```

Ergebnis: `_build/latex/bll-dokumentation.pdf`

## 5) Formale PDF-Pruefung

Nach dem Build pruefen:

- Deckblatt als erste Seite vorhanden
- Zeilenabstand sichtbar 1.5
- Seitenzahl unten rechts in den Folgeseiten
- Kapitel 00 bis 10 plus Kapitel 03a in Reihenfolge enthalten
- Gantt, Netzplan und Objektdiagramm sichtbar

## Troubleshooting

### Fehler: `plantuml` fehlt

```bash
brew install plantuml graphviz
```

### Fehler: `mmdc` nicht verfuegbar

```bash
npx -p @mermaid-js/mermaid-cli mmdc -h
```

### Fehler: `latexmk` / `pdflatex` fehlt

Installiere eine vollstaendige LaTeX-Distribution und starte `make latexpdf` erneut.

### Rueckstandsfrei entfernen

Siehe `docs/DEINSTALLATION.md`.
