from datetime import datetime

project = 'Moderne Webentwicklung am Beispiel einer alternativen Vertretungsplan-Anwendung'
author = 'Lukas Dienst'
copyright = f"{datetime.now().year}, {author}"

extensions = [
    'sphinx.ext.autosectionlabel',
    'sphinx.ext.todo',
    'sphinxcontrib.plantuml',
    'sphinxcontrib.mermaid',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store', '.venv', '.venv/**', 'status.rst', 'chapters/00_deckblatt.rst']
language = 'de'
autosectionlabel_prefix_document = True
todo_include_todos = True
numfig = True

html_theme = 'furo'
html_title = 'Moderne Webentwicklung am Beispiel einer alternativen Vertretungsplan-Anwendung'
html_static_path = []

plantuml = 'plantuml'
plantuml_output_format = 'svg'

# Mermaid diagrams are rendered as SVG to support PDF output.
mermaid_output_format = 'svg'
mermaid_cmd = 'npx -p @mermaid-js/mermaid-cli mmdc'
# --pdfFit crops the PDF page to the diagram content (no letter-size whitespace).
mermaid_params = ['--pdfFit']

latex_engine = 'pdflatex'
latex_toplevel_sectioning = 'section'
latex_additional_files = ['_latex/deckblatt-content.tex.txt']
latex_documents = [
    (
        'index',
        'bll-dokumentation.tex',
        'Moderne Webentwicklung am Beispiel einer alternativen Vertretungsplan-Anwendung',
        'Lukas Dienst',
        'manual',
    )
]

latex_elements = {
    'papersize': 'a4paper',
    'pointsize': '11pt',
    'extraclassoptions': 'openany,oneside',
    # Use default chapter package handling and control chapter spacing explicitly below.
    'fncychap': '',
    'preamble': r'''
\usepackage{setspace}
\onehalfspacing
\usepackage{fancyhdr}
\setlength{\headheight}{14pt}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{BLL-Dokumentation}
\fancyhead[R]{\nouppercase{\leftmark}}
\renewcommand{\headrulewidth}{0.3pt}
\fancyfoot[R]{\thepage}
\fancypagestyle{plain}{
  \fancyhf{}
  \fancyhead[L]{BLL-Dokumentation}
  \renewcommand{\headrulewidth}{0.3pt}
  \fancyfoot[R]{\thepage}
}
% Reduce large whitespace on chapter-start pages (report class default is very high).
\usepackage{titlesec}
\titleformat{\chapter}[hang]{\normalfont\huge\bfseries}{\thechapter\quad}{0pt}{}
\titlespacing*{\chapter}{0pt}{0.5\baselineskip}{1.0\baselineskip}
% Each top-level section (= BLL chapter) starts on a new page.
\newcommand{\sectionbreak}{\clearpage}
% Keep compact top-level sectioning without the unwanted "0." prefix in PDF numbering.
\renewcommand{\thesection}{\arabic{section}}
\renewcommand{\thesubsection}{\thesection.\arabic{subsection}}
% Prevent huge word gaps in narrow table columns.
% Sphinx defines \X columns as plain p{} (justified). Override to ragged-right.
% sphinxlatextables.sty is loaded before this preamble, so array.sty will warn
% "Column X already defined, redefining" but proceed correctly.
\usepackage{ragged2e}
\makeatletter
\newcolumntype{\X}[2]{>{\RaggedRight\arraybackslash}p{\dimexpr
  (\linewidth-\spx@arrayrulewidth)*#1/#2-\tw@\tabcolsep-\spx@arrayrulewidth\relax}}
\makeatother
% Move table captions below tables.
\usepackage{caption}
\captionsetup[table]{position=below}
% Reduce float spacing around figures.
\setlength{\intextsep}{6pt plus 2pt minus 2pt}
\setlength{\floatsep}{6pt plus 2pt minus 2pt}
% Force PlantUML/figure floats to [H] placement (no floating to separate pages).
% Patches \@xfloat to discard any explicit placement and always use H.
\usepackage{float}
\makeatletter
\let\sphinx@orig@xfloat\@xfloat
\def\@xfloat#1[#2]{\sphinx@orig@xfloat{#1}[H]}
\makeatother
''',
    'maketitle': r'\input{deckblatt-content.tex.txt}\clearpage',
}
