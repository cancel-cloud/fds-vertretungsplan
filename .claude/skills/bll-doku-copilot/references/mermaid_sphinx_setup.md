# Mermaid mit Sphinx (kurzreferenz)

Diese Referenz nur laden, wenn Mermaid-Diagramme fuer BLL-Doku geplant oder erstellt werden.

## Abhaengigkeiten

1. Python:
   - `sphinxcontrib-mermaid>=2.0.0`
2. Node/CLI (nur fuer gerenderte SVG/PNG/PDF noetig):
   - `@mermaid-js/mermaid-cli`
   - Installationsoptionen:
     - Global: `npm install -g @mermaid-js/mermaid-cli`
     - Ohne globale Installation: `npx -p @mermaid-js/mermaid-cli mmdc`

## `conf.py` Minimalsetup

```python
extensions = [
    # ...
    'sphinxcontrib.mermaid',
]
```

### Option A: HTML-first ohne CLI

```python
mermaid_output_format = 'raw'
```

Hinweis: `raw` erzeugt keine SVG-Dateien; fuer LaTeX/PDF sind gerenderte Assets oft stabiler.

### Option B: Rendering fuer PDF/non-HTML

```python
mermaid_output_format = 'svg'
mermaid_cmd = 'mmdc'
# alternativ:
# mermaid_cmd = 'npx -p @mermaid-js/mermaid-cli mmdc'
```

## RST-Einbindung

```rst
.. mermaid::

   graph TD
     A[Start] --> B[Build]
```

## Build-Pruefung

1. `make html` ausfuehren.
2. `make latexpdf` ausfuehren.
3. Bei Fehlern:
   - CLI erreichbar? (`mmdc --version`)
   - `mermaid_output_format` passend gesetzt?
   - `docs/requirements.txt` enthaelt `sphinxcontrib-mermaid`?

## Primarquellen

- https://pypi.org/project/sphinxcontrib-mermaid/
- https://sphinxcontrib-mermaid-demo.readthedocs.io/en/latest/
- https://github.com/mermaid-js/mermaid-cli
