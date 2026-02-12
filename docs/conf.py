from datetime import datetime

project = 'Moderne Webentwicklung am Beispiel einer alternativen Vertretungsplan-Anwendung'
author = 'Lukas Dienst'
copyright = f"{datetime.now().year}, {author}"

extensions = [
    'sphinx.ext.autosectionlabel',
    'sphinx.ext.todo',
    'sphinxcontrib.plantuml',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store', '.venv', '.venv/**']
language = 'de'
autosectionlabel_prefix_document = True
todo_include_todos = True
numfig = True

html_theme = 'furo'
html_title = 'Moderne Webentwicklung am Beispiel einer alternativen Vertretungsplan-Anwendung'
html_static_path = ['_static']

plantuml = 'plantuml'
plantuml_output_format = 'svg'

latex_engine = 'pdflatex'
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
''',
    'maketitle': r'\input{deckblatt-content.tex.txt}\clearpage',
}
