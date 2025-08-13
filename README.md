# Vertretungsplan FDS-Limburg

Eine moderne Web-Anwendung zur Anzeige des Vertretungsplans der Friedrich-Dessauer-Schule Limburg.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-0.1.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **📱 Responsive Design**: Optimiert für Mobile, Tablet und Desktop
- **🔍 Intelligente Suchfunktion**: Filtern nach Klassen, Lehrern, Fächern oder Räumen
- **📅 Tages-Toggle**: Wechsel zwischen heutigem und morgigem Vertretungsplan
- **⚡ Echtzeit-Daten**: Direkte Anbindung an WebUntis
- **🎨 Moderne UI**: Sauberes Design mit Tailwind CSS
- **🔒 Sicherheit**: Schutz vor XSS-Angriffen durch HTML-Sanitization
- **🎁 Easter Egg**: Versteckte Überraschung für aufmerksame Nutzer
- **♿ Accessibility**: Barrierefreie Gestaltung

## 🛠 Technologien

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS, NextUI Components
- **API**: Next.js API Routes
- **Datenquelle**: WebUntis API
- **Analytics**: Vercel Analytics, PostHog
- **Animation**: Framer Motion

## 📦 Installation

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn

### Setup

1. **Repository klonen:**
   ```bash
   git clone https://github.com/cancel-cloud/fds-vertretungsplan.git
   ```

2. **In das Projektverzeichnis wechseln:**
   ```bash
   cd fds-vertretungsplan
   ```

3. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

4. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

5. **Browser öffnen und zu `http://localhost:3000` navigieren**

## 🎯 Nutzung

### Grundfunktionen

- **Heute/Morgen Toggle**: Zwischen aktuellem und morgigem Vertretungsplan wechseln
- **Suchfunktion**: Nach Klassen, Lehrern, Fächern oder Räumen suchen
- **Responsive Navigation**: Mobile-freundliche Navigation mit Hamburger-Menü

### Suchfunktionen

- Suche nach **Klassenname** (z.B. "10a", "Q1")
- Suche nach **Lehrerkürzel** (z.B. "MUE", "SCH")
- Suche nach **Fach** (z.B. "Mathematik", "Deutsch")
- Suche nach **Raum** (z.B. "A101", "Sporthalle")

### Easter Egg

Probiere mal "mr big" in die Suchleiste einzugeben! 🎉

## 📁 Projektstruktur

```
src/
├── components/          # React Komponenten
│   ├── Header.tsx      # Navigation und Header
│   ├── Footer.tsx      # Footer mit Kontaktinformationen
│   ├── SearchBar.tsx   # Suchfunktionalität
│   ├── SubstitutionPlan.tsx  # Hauptkomponente für Vertretungsplan
│   ├── Loading.tsx     # Ladeanimation
│   ├── Error.tsx       # Fehlerbehandlung
│   └── Button.tsx      # Wiederverwendbare Button-Komponente
├── pages/              # Next.js Seiten
│   ├── api/           # API Endpunkte
│   │   ├── getSubstitutionData.ts  # WebUntis API Integration
│   │   └── getDate.ts  # Datum-Utilities
│   ├── index.tsx      # Hauptseite
│   ├── impressum.tsx  # Impressum
│   ├── datenschutz.tsx # Datenschutzerklärung
│   ├── _app.tsx       # App-Konfiguration
│   └── _document.tsx  # HTML-Dokument-Setup
├── types/             # TypeScript Typdefinitionen
├── constants/         # Anwendungskonstanten
├── utils/            # Hilfsfunktionen
├── styles/           # CSS Styles
└── app/              # App Router Konfiguration
```

## 🔧 Entwicklung

### Verfügbare Scripts

```bash
npm run dev      # Entwicklungsserver starten
npm run build    # Produktions-Build erstellen
npm run start    # Produktionsserver starten
npm run lint     # Code-Linting ausführen
```

### Code-Qualität

Das Projekt verwendet:
- **ESLint** für Code-Linting
- **TypeScript** für Typsicherheit
- **Prettier** für Code-Formatierung
- **Tailwind CSS** für konsistentes Styling

### API-Endpunkte

#### `POST /api/getSubstitutionData`

Ruft Vertretungsplan-Daten von WebUntis ab.

**Request Body:**
```json
{
  "date": "20240115"  // Format: YYYYMMDD
}
```

**Response:**
```json
{
  "payload": {
    "rows": [
      {
        "data": ["1", "07:45-08:30", "10a", "Mathematik", "A101", "MUE", "Vertretung", "Arbeitsblatt S. 42"],
        "group": "10a"
      }
    ]
  }
}
```

## 🚀 Deployment

### Vercel (Empfohlen)

1. **Repository zu Vercel verbinden**
2. **Automatisches Deployment bei Push auf `main`**
3. **Umgebungsvariablen konfigurieren** (falls erforderlich)

### Eigener Server

```bash
npm run build
npm run start
```

## 🤝 Contributing

Beiträge sind willkommen! Bitte beachte die folgenden Schritte:

1. **Fork** das Repository
2. **Feature Branch** erstellen: `git checkout -b feature/amazing-feature`
3. **Änderungen committen**: `git commit -m 'Add amazing feature'`
4. **Branch pushen**: `git push origin feature/amazing-feature`
5. **Pull Request** öffnen

### Entwicklungsrichtlinien

- Verwende **TypeScript** für neue Dateien
- Befolge die bestehenden **ESLint-Regeln**
- Schreibe **selbsterklärenden Code** mit JSDoc-Kommentaren
- Teste deine Änderungen vor dem Commit
- Verwende **konventionelle Commit-Nachrichten**

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 👨‍💻 Autor

**Lukas Dienst**
- Email: [0rare-reputed@icloud.com](mailto:0rare-reputed@icloud.com)
- GitHub: [@cancel-cloud](https://github.com/cancel-cloud)

## 🙏 Danksagungen

- **Friedrich-Dessauer-Schule Limburg** für die Inspiration
- **WebUntis** für die API-Bereitstellung
- **Next.js Team** für das großartige Framework
- **Vercel** für die Hosting-Plattform

## 📊 Analytics

Diese Anwendung nutzt anonyme Analytics, um die Nutzererfahrung zu verbessern:
- **Vercel Analytics** für Performance-Monitoring
- **PostHog** für Nutzungsstatistiken

Alle Daten werden anonymisiert erfasst und dienen ausschließlich der Verbesserung der Anwendung.

---

**Hinweis**: Diese Anwendung ist nicht offiziell mit der Friedrich-Dessauer-Schule Limburg verbunden und wird als Hilfsmittel für Schüler und Lehrer bereitgestellt.
