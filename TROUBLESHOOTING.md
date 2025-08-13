# Troubleshooting Guide

Dieser Leitfaden hilft bei der Lösung häufiger Probleme mit der FDS Vertretungsplan Anwendung.

## 🚨 Häufige Probleme und Lösungen

### 📱 Installation & Setup

#### Problem: `npm install` schlägt fehl
**Symptome:**
- Fehler beim Installieren der Abhängigkeiten
- `node_modules` Ordner fehlt oder ist unvollständig

**Lösungen:**
1. **Node.js Version prüfen:**
   ```bash
   node --version  # Sollte 18+ sein
   npm --version   # Sollte 8+ sein
   ```

2. **Cache leeren:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Berechtigungen prüfen (macOS/Linux):**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

#### Problem: Port 3000 bereits belegt
**Symptome:**
- `Error: listen EADDRINUSE: address already in use :::3000`

**Lösungen:**
1. **Anderen Port verwenden:**
   ```bash
   npm run dev -- -p 3001
   ```

2. **Blockierenden Prozess finden und beenden:**
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### 🔧 Entwicklung

#### Problem: TypeScript Compilation Fehler
**Symptome:**
- Build schlägt fehl mit TypeScript Errors
- Red squiggly lines in VS Code

**Lösungen:**
1. **TypeScript Server neu starten (VS Code):**
   - `Cmd/Ctrl + Shift + P`
   - "TypeScript: Restart TS Server"

2. **Types neu installieren:**
   ```bash
   npm install @types/node @types/react @types/react-dom --save-dev
   ```

3. **TSConfig prüfen:**
   ```bash
   npx tsc --noEmit  # Nur Type-Checking ohne Build
   ```

#### Problem: ESLint Warnings/Errors
**Symptome:**
- Gelbe/rote Unterstreichungen im Code
- Build Warnings

**Lösungen:**
1. **Auto-Fix anwenden:**
   ```bash
   npm run lint -- --fix
   ```

2. **ESLint Konfiguration zurücksetzen:**
   ```bash
   rm -rf .eslintcache
   npm run lint
   ```

3. **Spezifische Regeln deaktivieren:**
   ```javascript
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const unusedVar = 'example';
   ```

#### Problem: Tailwind CSS Styles funktionieren nicht
**Symptome:**
- CSS Klassen werden nicht angewendet
- Styling ist gebrochen

**Lösungen:**
1. **Tailwind CSS neu generieren:**
   ```bash
   npm run build  # Regeneriert CSS
   ```

2. **Browser Cache leeren:**
   - `Cmd/Ctrl + Shift + R` (Hard Refresh)

3. **Tailwind Konfiguration prüfen:**
   ```javascript
   // tailwind.config.ts
   content: [
     './src/**/*.{js,ts,jsx,tsx,mdx}',
   ]
   ```

### 🌐 API & Daten

#### Problem: WebUntis API nicht erreichbar
**Symptome:**
- `Failed to fetch data from WebUntis`
- Network Error 500/502

**Lösungen:**
1. **WebUntis Status prüfen:**
   - Direkt auf WebUntis Website gehen
   - Prüfen ob Server erreichbar ist

2. **API Konfiguration prüfen:**
   ```typescript
   // src/constants/index.ts
   export const API_CONFIG = {
     WEBUNTIS_BASE_URL: "https://hepta.webuntis.com/WebUntis/monitor/substitution/data",
     SCHOOL_NAME: "dessauer-schule-limburg",
     // ...
   };
   ```

3. **CORS Issues:**
   - Problem tritt nur bei direkten Browser-Anfragen auf
   - Nutze immer die `/api/getSubstitutionData` Route

#### Problem: Keine Daten angezeigt
**Symptome:**
- "Keine Vertretungen für diesen Tag vorhanden"
- Leere Liste

**Mögliche Ursachen:**
1. **Wochenende/Feiertag:**
   - Normalerweise keine Vertretungen an schulfreien Tagen

2. **Falsches Datum:**
   - Prüfe ob das richtige Datum abgefragt wird

3. **API Response Format geändert:**
   - WebUntis könnte API-Format geändert haben
   - Console-Logs prüfen

**Debug-Schritte:**
```bash
# Browser Developer Tools → Network Tab
# POST /api/getSubstitutionData
# Response prüfen
```

#### Problem: Suchfunktion zeigt keine Ergebnisse
**Symptome:**
- Suche findet bekannte Klassen/Lehrer nicht
- Filter funktioniert nicht

**Lösungen:**
1. **Cache leeren:**
   ```bash
   # Browser Cache + localStorage leeren
   localStorage.clear();
   location.reload();
   ```

2. **Suchbegriff prüfen:**
   - Groß-/Kleinschreibung wird ignoriert
   - Teilstrings funktionieren
   - Leerzeichen beachten

3. **Debouncing-Delay:**
   - Warte 300ms nach der Eingabe
   - Funktion ist verzögert für Performance

### 🎨 UI/UX Issues

#### Problem: Mobile Ansicht gebrochen
**Symptome:**
- Responsive Design funktioniert nicht
- Horizontaler Scroll auf Mobile

**Lösungen:**
1. **Viewport Meta Tag prüfen:**
   ```html
   <!-- src/pages/_document.tsx -->
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

2. **Tailwind Breakpoints prüfen:**
   ```css
   /* Richtig: */
   .grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   
   /* Falsch: */
   .grid-cols-3 /* Immer 3 Spalten */
   ```

#### Problem: Dark Mode funktioniert nicht
**Symptome:**
- Theme ändert sich nicht
- Farben sind inkonsistent

**Status:**
- **Nicht implementiert** - Dark Mode ist geplant aber noch nicht verfügbar
- Siehe Feature Roadmap in README.md

#### Problem: Bilder laden nicht (Easter Egg)
**Symptome:**
- "Mr. Big" Bild wird nicht angezeigt
- 404 Error in Network Tab

**Lösungen:**
1. **Bildpfad prüfen:**
   ```typescript
   // public/MRBIG.JPG muss existieren
   EASTER_EGG_IMAGE: "/MRBIG.JPG",
   ```

2. **Groß-/Kleinschreibung:**
   - Dateiname exakt wie in constants definiert
   - MRBIG.JPG (nicht mrbig.jpg)

### 🚀 Deployment Issues

#### Problem: Vercel Deployment schlägt fehl
**Symptome:**
- Build fails on Vercel
- Deployment Error

**Lösungen:**
1. **Lokal testen:**
   ```bash
   npm run build  # Muss lokal funktionieren
   npm start      # Production Server testen
   ```

2. **Node.js Version:**
   - Vercel nutzt Node.js 18+
   - Package.json engines spezifizieren:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. **Environment Variables:**
   - Keine sensiblen Daten in Code committen
   - Vercel Dashboard → Settings → Environment Variables

#### Problem: Static Export Fehler
**Symptome:**
- `next export` schlägt fehl
- API Routes in static export

**Lösung:**
- **Nicht möglich**: API Routes benötigen Server
- Nutze Vercel oder anderen Node.js Host

### 📊 Performance Issues

#### Problem: Langsame Ladezeiten
**Symptome:**
- Seite lädt länger als 3 Sekunden
- Schlechte Lighthouse Scores

**Optimierungen:**
1. **Bundle Size analysieren:**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   # In next.config.mjs aktivieren
   ```

2. **Image Optimization:**
   ```jsx
   // Nutze Next.js Image Component
   import Image from 'next/image';
   <Image src="/image.jpg" width={400} height={300} alt="..." />
   ```

3. **Code Splitting:**
   ```jsx
   // Dynamic Imports für große Components
   const HeavyComponent = dynamic(() => import('./HeavyComponent'));
   ```

#### Problem: Speicher-Leaks
**Symptome:**
- Browser wird langsamer nach längerer Nutzung
- RAM-Verbrauch steigt kontinuierlich

**Lösungen:**
1. **Event Listeners aufräumen:**
   ```jsx
   useEffect(() => {
     const handler = () => { /* ... */ };
     window.addEventListener('resize', handler);
     
     return () => {
       window.removeEventListener('resize', handler);
     };
   }, []);
   ```

2. **Debounced Functions:**
   - Bereits implementiert in SearchBar
   - Verhindert Memory-Leaks durch Timer

### 🔍 Debug-Tools und -Techniken

#### Browser Developer Tools
1. **Console:**
   ```javascript
   // API Response debuggen
   console.log('SubstitutionData:', data);
   
   // Performance messen
   console.time('API Call');
   // ... API Call
   console.timeEnd('API Call');
   ```

2. **Network Tab:**
   - API Requests überwachen
   - Response Headers prüfen
   - Payload Size analysieren

3. **Application Tab:**
   - localStorage/sessionStorage prüfen
   - Service Worker Status (bei PWA)

#### Next.js Debug Mode
```bash
# Verbose Logging
NODE_OPTIONS='--inspect' npm run dev

# Bundle Analysis
npm run build && npm run analyze
```

#### React Developer Tools
- React Components Tree
- Props und State inspection
- Performance Profiler

### 📞 Hilfe anfordern

#### Bevor du ein Issue erstellst:
1. **Konsole prüfen:** Browser Developer Tools → Console
2. **Network prüfen:** Sind API Calls erfolgreich?
3. **Lokal reproduzieren:** `npm run dev` funktioniert?
4. **Build testen:** `npm run build` erfolgreich?

#### Issue erstellen:
Füge folgende Informationen hinzu:
- **Betriebssystem:** (Windows 10, macOS 13, Ubuntu 22.04)
- **Browser:** (Chrome 120, Firefox 119, Safari 17)
- **Node.js Version:** `node --version`
- **npm Version:** `npm --version`
- **Fehlerlog:** Vollständige Fehlermeldung
- **Screenshots:** Bei UI-Problemen
- **Schritte zur Reproduktion:** Detaillierte Anleitung

#### Notfallkontakt:
- **GitHub Issues:** Für Code-bezogene Probleme
- **Email:** [0rare-reputed@icloud.com](mailto:0rare-reputed@icloud.com)
- **Antwortzeit:** Meist innerhalb 24h

### 🔄 Cache-Management

#### Browser Cache leeren:
```bash
# Chrome
Cmd/Ctrl + Shift + Delete

# Firefox  
Cmd/Ctrl + Shift + Delete

# Safari
Cmd + Option + E
```

#### Entwicklungs-Cache:
```bash
# Next.js Cache
rm -rf .next

# Node Modules
rm -rf node_modules package-lock.json
npm install

# npm Cache
npm cache clean --force
```

### 🧪 Testing & Validation

#### Manuelle Tests:
1. **Responsive Design:**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

2. **Funktionalität:**
   - Suche funktioniert
   - Toggle Heute/Morgen
   - Easter Egg ("mr big")
   - Navigation Links

3. **Performance:**
   - Lighthouse Audit
   - Pagespeed Insights
   - WebPageTest.org

#### Browser-Kompatibilität:
- ✅ Chrome 120+
- ✅ Firefox 119+
- ✅ Safari 17+
- ✅ Edge 120+
- ❌ Internet Explorer (nicht supported)

---

**💡 Tipp:** Halte immer ein aktuelles Backup deiner `package-lock.json` und teste Änderungen erst lokal bevor du deployest.