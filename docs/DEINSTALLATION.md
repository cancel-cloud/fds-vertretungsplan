# Deinstallation (rückstandsfrei)

Diese Schritte entfernen alles, was ich für den Doku-Build zusätzlich installiert habe.

## 1) Projektlokal entfernen

```bash
cd /Users/cancelcloud/Developer/personal/fds-vertretungsplan
rm -rf docs/.venv docs/_build
```

## 2) Homebrew-Pakete entfernen

```bash
brew uninstall graphviz plantuml
brew uninstall --cask basictex
brew autoremove
brew cleanup
```

## 3) TeX-Reste komplett entfernen (Systemweit)

```bash
sudo rm -rf /usr/local/texlive
sudo rm -rf /Library/TeX
sudo rm -rf /Applications/TeX
rm -rf ~/Library/texlive
rm -rf ~/.texlive* ~/.TinyTeX
```

## 4) Paket-Receipts vergessen (optional, für "sauber")

```bash
pkgutil --pkgs | rg -i 'texlive|mactex|basictex' | xargs -n1 sudo pkgutil --forget
```

## 5) Prüfen, dass nichts mehr da ist

```bash
which plantuml || echo 'plantuml entfernt'
which dot || echo 'graphviz entfernt'
which pdflatex || echo 'tex entfernt'
which latexmk || echo 'latexmk entfernt'
```

## Hinweis

Wenn du TeX schon vor meiner Arbeit genutzt hast, entfernt Schritt 3 auch deine bestehende TeX-Installation.
