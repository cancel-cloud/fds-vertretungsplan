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

#### Automatisches Deployment
1. **Repository zu Vercel verbinden:**
   - Gehe zu [vercel.com](https://vercel.com)
   - "New Project" → GitHub Repository importieren
   - `cancel-cloud/fds-vertretungsplan` auswählen

2. **Konfiguration:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (Standard)
   - Build Command: `npm run build` (automatisch erkannt)
   - Output Directory: `.next` (automatisch)

3. **Umgebungsvariablen (Optional):**
   ```
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

4. **Deploy:**
   - Automatisch bei jedem Push auf `main` Branch
   - Preview-Deployments für Pull Requests

#### Manuelles Deployment
```bash
# Vercel CLI installieren
npm install -g vercel

# Im Projektverzeichnis
vercel

# Production Deployment
vercel --prod
```

### Eigener Server

#### Voraussetzungen
- Node.js 18+
- npm 8+
- PM2 (für Production)

#### Setup
```bash
# 1. Repository klonen
git clone https://github.com/cancel-cloud/fds-vertretungsplan.git
cd fds-vertretungsplan

# 2. Abhängigkeiten installieren
npm ci --production

# 3. Build erstellen
npm run build

# 4. PM2 für Process Management
npm install -g pm2

# 5. Application starten
pm2 start npm --name "fds-vertretungsplan" -- start

# 6. PM2 Auto-Startup konfigurieren
pm2 startup
pm2 save
```

#### Nginx Konfiguration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL/HTTPS Setup
```bash
# Certbot für Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

### Docker Deployment

#### Dockerfile erstellen
```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

#### Docker Commands
```bash
# Build Image
docker build -t fds-vertretungsplan .

# Run Container
docker run -p 3000:3000 fds-vertretungsplan

# Mit Docker Compose
docker-compose up -d
```

### Umgebungsvariablen

#### Entwicklung (.env.local)
```bash
# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# WebUntis Konfiguration (falls angepasst)
WEBUNTIS_SCHOOL_NAME=dessauer-schule-limburg
WEBUNTIS_BASE_URL=https://hepta.webuntis.com/WebUntis/monitor/substitution/data

# Development
NODE_ENV=development
```

#### Production
```bash
# Required
NODE_ENV=production

# Optional - Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key

# Optional - Custom API Endpoints
WEBUNTIS_SCHOOL_NAME=your-school-name
```

### CI/CD mit GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run lint
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Performance Optimierung

#### Next.js Konfiguration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kompression aktivieren
  compress: true,
  
  // Image Optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  
  // Bundle Analyzer (development)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundleAnalyzer: {
        enabled: true,
      },
    },
  }),
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### Bundle-Analyse
```bash
# Bundle Size analysieren
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

### Monitoring & Health Checks

#### Health Check Endpoint
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

#### Uptime Monitoring
- **UptimeRobot**: Kostenlose Überwachung
- **Pingdom**: Erweiterte Monitoring-Features
- **StatusPage**: Status-Seite für Nutzer

### Backup & Recovery

#### Automatische Backups
```bash
# Git Repository als Backup
git remote add backup https://github.com/user/backup-repo.git
git push backup main

# Database Backup (falls später hinzugefügt)
pg_dump database_name > backup.sql
```

#### Disaster Recovery Plan
1. **Code**: GitHub Repository
2. **Deployment**: Vercel/Server Konfiguration dokumentiert
3. **Domain**: DNS-Einstellungen dokumentiert
4. **Certificates**: Let's Encrypt automatische Erneuerung

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
