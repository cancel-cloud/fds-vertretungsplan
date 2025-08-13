# Contributing to Vertretungsplan FDS-Limburg

Vielen Dank für dein Interesse, zu diesem Projekt beizutragen! 🎉

## 🚀 Wie du beitragen kannst

### 🐛 Bugs melden

Wenn du einen Bug gefunden hast:

1. **Prüfe**, ob der Bug bereits als Issue gemeldet wurde
2. **Erstelle ein neues Issue** mit dem Label `bug`
3. **Beschreibe** das Problem detailliert:
   - Was ist passiert?
   - Was hast du erwartet?
   - Schritte zur Reproduktion
   - Screenshots (falls hilfreich)
   - Browser/Device-Informationen

### 💡 Features vorschlagen

Hast du eine Idee für ein neues Feature?

1. **Erstelle ein Issue** mit dem Label `enhancement`
2. **Beschreibe** das Feature:
   - Was soll es tun?
   - Warum wäre es nützlich?
   - Wie könnte es umgesetzt werden?

### 🔧 Code beitragen

#### Voraussetzungen

- Node.js 18+
- Git
- Ein GitHub Account

#### Setup

1. **Forke** das Repository
2. **Clone** dein Fork:
   ```bash
   git clone https://github.com/DEIN-USERNAME/fds-vertretungsplan.git
   ```
3. **Installiere** Abhängigkeiten:
   ```bash
   cd fds-vertretungsplan
   npm install
   ```
4. **Erstelle** einen neuen Branch:
   ```bash
   git checkout -b feature/dein-feature-name
   ```

#### Entwicklung

1. **Mache** deine Änderungen
2. **Teste** deine Änderungen:
   ```bash
   npm run dev
   npm run build
   npm run lint
   ```
3. **Committe** deine Änderungen:
   ```bash
   git add .
   git commit -m "feat: beschreibung deiner änderung"
   ```

#### Pull Request erstellen

1. **Push** deinen Branch:
   ```bash
   git push origin feature/dein-feature-name
   ```
2. **Erstelle** einen Pull Request auf GitHub
3. **Beschreibe** deine Änderungen im PR

## 📝 Code-Richtlinien

### Coding Standards

- **TypeScript** für alle neuen Dateien verwenden
- **ESLint-Regeln** befolgen
- **Prettier** für Code-Formatierung nutzen
- **Aussagekräftige Variablennamen** verwenden
- **JSDoc-Kommentare** für Funktionen und Komponenten

### Commit-Nachrichten

Verwende [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Beispiele:**
- `feat: add dark mode toggle`
- `fix: resolve search filtering issue`
- `docs: update installation instructions`
- `style: improve mobile responsive design`
- `refactor: extract date utility functions`
- `test: add unit tests for search component`

### Komponenten-Struktur

```typescript
import React from "react";
import { ComponentProps } from "@/types";

/**
 * Komponenten-Beschreibung
 * @param prop1 - Beschreibung von prop1
 * @param prop2 - Beschreibung von prop2
 */
const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Datei-Organisation

- **Komponenten**: `/src/components/`
- **Seiten**: `/src/pages/`
- **Types**: `/src/types/`
- **Utils**: `/src/utils/`
- **Constants**: `/src/constants/`
- **Styles**: `/src/styles/`

## 🧪 Testing

### Vor dem Commit

Stelle sicher, dass:
- [ ] Code kompiliert ohne Fehler (`npm run build`)
- [ ] Linting-Regeln eingehalten werden (`npm run lint`)
- [ ] Die Anwendung im Browser funktioniert (`npm run dev`)
- [ ] Responsive Design auf verschiedenen Bildschirmgrößen getestet

### Browser-Testing

Teste deine Änderungen in:
- [ ] Chrome (Desktop & Mobile)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop & Mobile)
- [ ] Edge (Desktop)

## 🎨 Design-Richtlinien

### UI/UX Prinzipien

- **Mobile First**: Beginne mit mobiler Gestaltung
- **Accessibility**: Barrierefreie Gestaltung beachten
- **Konsistenz**: Einheitliche UI-Elemente verwenden
- **Performance**: Optimierte Ladezeiten anstreben

### Tailwind CSS

- Verwende **vorhandene Utility-Klassen**
- Erstelle **wiederverwendbare Komponenten**
- Befolge die **Responsive Design** Breakpoints
- Nutze die **Design-Tokens** aus der Konfiguration

## 🔍 Code Review Process

1. **Automated Checks**: GitHub Actions führen automatische Tests durch
2. **Manual Review**: Maintainer prüfen Code-Qualität und Design
3. **Feedback**: Konstruktives Feedback wird zeitnah gegeben
4. **Iteration**: Ggf. werden Änderungen angefragt
5. **Merge**: Nach Approval wird der PR gemerged

## 💡 Tipps für Erstbeiträger

### Einfache Einstiege

- **Dokumentation** verbessern
- **Typos** korrigieren
- **Kleine UI-Verbesserungen**
- **Accessibility** verbessern
- **Mobile Responsiveness** optimieren

### Hilfe bekommen

- **Issues** durchstöbern für Inspiration
- **Discussion** für Fragen nutzen
- **Maintainer** über Issues kontaktieren

## 🛡️ Sicherheit

### Sicherheitslücken melden

Falls du eine Sicherheitslücke findest:
1. **Nicht** als öffentliches Issue melden
2. **Email** direkt an: [0rare-reputed@icloud.com](mailto:0rare-reputed@icloud.com)
3. **Beschreibe** das Problem detailliert
4. **Warte** auf Rückmeldung vor Veröffentlichung

### Sichere Entwicklung

- **Input-Validierung** implementieren
- **XSS-Schutz** beachten
- **Abhängigkeiten** regelmäßig aktualisieren
- **Secrets** nie in Code committen

## 📞 Kontakt

**Fragen? Probleme? Ideen?**

- **GitHub Issues**: Für Feature-Requests und Bugs
- **GitHub Discussions**: Für allgemeine Fragen
- **Email**: [0rare-reputed@icloud.com](mailto:0rare-reputed@icloud.com)

## 🎉 Anerkennung

Alle Beiträger werden in der [README.md](README.md) erwähnt. Dein Beitrag wird geschätzt! 🙏

---

**Happy Coding!** 🚀