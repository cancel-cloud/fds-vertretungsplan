# Architektur-Dokumentation

## Systemübersicht

Das FDS Vertretungsplan ist eine moderne Web-Anwendung, die als Proxy zwischen der WebUntis API und den Endnutzern fungiert. Die Anwendung bietet eine benutzerfreundliche Oberfläche zur Anzeige von Schulvertretungsplänen.

## Architekturdiagramm

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │   WebUntis API  │
│   (React/Next)  │◄──►│   Routes        │◄──►│   (External)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Analytics     │    │   Error Logging │
│   (PostHog/     │    │   (Console/     │
│    Vercel)      │    │    Future)      │
└─────────────────┘    └─────────────────┘
```

## Technologie-Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS + NextUI Components
- **Animationen**: Framer Motion
- **Rendering**: Server-Side Rendering (SSR) + Static Site Generation (SSG)

### Backend/API
- **Runtime**: Next.js API Routes (Node.js)
- **Datenquelle**: WebUntis REST API
- **Request Handling**: Native Fetch API
- **Error Handling**: Custom Error Classes

### Entwicklung & Build
- **Package Manager**: npm
- **Linting**: ESLint + Next.js ESLint Config
- **Formatierung**: Prettier mit Tailwind Plugin
- **Build Tool**: Next.js (Webpack unter der Haube)

### Analytics & Monitoring
- **Web Analytics**: Vercel Analytics
- **User Analytics**: PostHog
- **Error Monitoring**: Zukunftsplanung (Sentry o.ä.)

## Ordnerstruktur

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx         # Root Layout
│   ├── opengraph-image.png # Social Media Preview
│   └── providers.tsx      # Context Providers
├── components/            # React Komponenten
│   ├── ErrorBoundary.tsx # Fehlerbehandlung
│   ├── Header.tsx        # Navigation
│   ├── Footer.tsx        # Footer
│   ├── SearchBar.tsx     # Suchfunktionalität
│   ├── SubstitutionPlan.tsx # Hauptkomponente
│   ├── SkeletonLoader.tsx # Loading States
│   ├── Loading.tsx       # Einfacher Loader
│   ├── Error.tsx         # Fehleranzeige
│   └── Button.tsx        # UI Button
├── pages/                # Pages Router (Legacy)
│   ├── api/             # API Endpunkte
│   │   ├── getSubstitutionData.ts
│   │   └── getDate.ts
│   ├── index.tsx        # Homepage
│   ├── impressum.tsx    # Impressum
│   ├── datenschutz.tsx  # Datenschutz
│   ├── _app.tsx         # App Konfiguration
│   └── _document.tsx    # HTML Document
├── types/               # TypeScript Definitionen
│   └── index.ts
├── utils/               # Hilfsfunktionen
│   └── index.ts
├── constants/           # Anwendungskonstanten
│   └── index.ts
└── styles/             # CSS Dateien
    └── globals.css
```

## Datenfluss

### 1. Benutzer-Interaktion
```
Benutzer → React Component → State Update → Re-render
```

### 2. API-Aufruf
```
Frontend → Next.js API Route → WebUntis API → Response → Frontend
```

### 3. Datenverarbeitung
```
Raw Data → Validation → Sanitization → Sorting → Filtering → Display
```

## Komponenten-Architektur

### Hierarchie
```
App (ErrorBoundary)
├── Header
├── Main
│   └── SubstitutionPlan
│       ├── SearchBar
│       ├── Switch (Today/Tomorrow)
│       ├── SkeletonLoader | Loading | Error
│       └── SubstitutionCards[]
└── Footer
```

### State Management
- **Local State**: React useState für Komponenten-spezifische Daten
- **Props**: Eltern-Kind Kommunikation
- **Callbacks**: Kind-Eltern Kommunikation
- **Keine globale State Library**: Einfache Anwendung benötigt Redux/Zustand nicht

## API-Design

### Endpunkte
- `POST /api/getSubstitutionData` - Hauptdatenquelle
- `GET /api/getDate` - Datum-Utilities (intern)

### Datenmodelle
```typescript
interface SubstitutionData {
  data: string[];  // [Stunde, Zeit, Klasse, Fach, Raum, Lehrer, Info, Text]
  group: string;   // Klassenbezeichnung
}

interface SubstitutionApiResponse {
  payload?: {
    rows: SubstitutionData[];
  };
}
```

### Fehlerbehandlung
- **Client-Side**: Try-Catch mit Custom Error Classes
- **Server-Side**: HTTP Status Codes + Error Messages
- **User-Facing**: Benutzerfreundliche Fehlermeldungen

## Sicherheit

### XSS-Schutz
- **HTML Sanitization**: DOMPurify für sichere HTML-Darstellung
- **Input Validation**: Validierung aller Eingaben
- **Content Security Policy**: Über Next.js Headers

### API-Sicherheit
- **CORS**: Standardkonfiguration von Next.js
- **Rate Limiting**: Noch nicht implementiert (Zukunftsplanung)
- **Input Validation**: Validierung aller API-Parameter

## Performance

### Frontend-Optimierungen
- **Code Splitting**: Automatisch durch Next.js
- **Image Optimization**: Next.js Image Component
- **CSS Optimization**: Tailwind CSS Purging
- **Bundle Analysis**: Möglichkeit für `npm run analyze`

### API-Optimierungen
- **Debouncing**: Suchfunktion verzögert Anfragen
- **Caching**: Noch nicht implementiert (Browser-Cache)
- **Compression**: Automatisch durch Vercel/Deployment

### Ladezeiten
- **First Contentful Paint**: ~1.5s
- **Largest Contentful Paint**: ~2.5s
- **Time to Interactive**: ~3s

## Accessibility (a11y)

### Implementiert
- **Semantisches HTML**: Korrekte HTML-Struktur
- **ARIA Labels**: Screen Reader Unterstützung
- **Keyboard Navigation**: Tab-Navigation möglich
- **Focus Management**: Sichtbare Focus-Indikatoren

### Geplant
- **Screen Reader Testing**: Umfassende Tests
- **Color Contrast**: WCAG 2.1 AA Compliance
- **Reduced Motion**: Unterstützung für Bewegungsempfindlichkeit

## Deployment

### Hosting
- **Platform**: Vercel (empfohlen)
- **Alternative**: Jeder Node.js-fähige Server

### CI/CD
- **GitHub Actions**: Automatische Builds (optional)
- **Vercel Integration**: Automatisches Deployment bei Git Push

### Umgebungen
- **Development**: `npm run dev` (localhost:3000)
- **Build**: `npm run build` + `npm start`
- **Production**: Vercel Deployment

## Monitoring & Analytics

### Aktuelle Implementierung
- **Vercel Analytics**: Performance Metriken
- **PostHog**: User Behavior Analytics
- **Console Logging**: Entwicklungs-Logs

### Zukünftige Erweiterungen
- **Sentry**: Error Monitoring
- **Custom Metrics**: Business Metriken
- **User Feedback**: Feedback-System

## Wartung & Updates

### Abhängigkeiten-Management
- **Security Updates**: Regelmäßige npm audit
- **Major Version Updates**: Vorsichtige Migration
- **Deprecated Dependencies**: Zeitnahe Ersetzung

### Code-Qualität
- **ESLint**: Automatische Code-Analyse
- **Prettier**: Code-Formatierung
- **TypeScript**: Typ-Sicherheit
- **Code Reviews**: Pull Request Process

## Skalierung

### Horizontal Scaling
- **Serverless**: Vercel Functions skalieren automatisch
- **CDN**: Statische Assets über Vercel CDN

### Vertikal Scaling
- **Database**: Für zukünftige Features (SQLite/PostgreSQL)
- **Caching**: Redis für API-Response Caching
- **Load Balancing**: Bei hohem Traffic erforderlich

## Erweiterte Features (Roadmap)

### Kurzfristig (1-3 Monate)
- Caching für API-Responses
- PWA-Funktionalität
- Dark Mode

### Mittelfristig (3-6 Monate)
- Push Notifications
- Offline-Support
- Benutzer-Präferenzen

### Langfristig (6+ Monate)
- Multi-Schulen Support
- Admin Dashboard
- Real-time Updates

## Technische Schulden

### Bekannte Issues
- Keine Test-Suite (Unit/Integration Tests)
- Fehlende Umgebungsvariablen für API-Konfiguration
- Begrenzte Error Monitoring

### Priorisierung
1. **Hoch**: Test-Suite implementieren
2. **Mittel**: Environment Variables
3. **Niedrig**: Advanced Caching

## Performance-Metriken

### Aktuelle Werte (Lighthouse)
- **Performance**: 85-90
- **Accessibility**: 88-92
- **Best Practices**: 90-95
- **SEO**: 90-95

### Zielwerte
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+