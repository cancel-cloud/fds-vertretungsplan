# API Documentation

## Overview

Diese Dokumentation beschreibt die API-Endpunkte der Vertretungsplan-Anwendung.

## Base URL

```
http://localhost:3000/api  (Development)
https://your-domain.com/api  (Production)
```

## Endpoints

### `POST /api/getSubstitutionData`

Ruft Vertretungsplan-Daten von der WebUntis API ab.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "date": "20240115"
}
```

**Parameters:**
- `date` (string, required): Datum im Format YYYYMMDD

#### Response

**Success (200):**
```json
{
  "payload": {
    "rows": [
      {
        "data": [
          "1",                    // Stunde
          "07:45-08:30",         // Zeit
          "10a",                 // Klassen
          "Mathematik",          // Fach
          "A101",                // Raum
          "MUE",                 // Lehrkraft
          "Vertretung",          // Info
          "Arbeitsblatt S. 42"   // Vertretungstext
        ],
        "group": "10a"
      }
    ]
  }
}
```

**Error (400):**
```json
{
  "error": "Date parameter is required"
}
```

**Error (500):**
```json
{
  "error": "Failed to fetch data"
}
```

#### Example

```javascript
const response = await fetch('/api/getSubstitutionData', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    date: '20240115'
  })
});

const data = await response.json();
```

### `GET /api/getDate`

Hilfsfunktion zur Datumsgenerierung (wird intern verwendet).

#### Response

```javascript
// Wird als Utility-Funktion verwendet, kein direkter API-Endpunkt
```

## Data Structures

### SubstitutionData

```typescript
interface SubstitutionData {
  data: string[];  // Array mit 8 Elementen: [Stunde, Zeit, Klassen, Fach, Raum, Lehrkraft, Info, Vertretungstext]
  group: string;   // Klassenbezeichnung
  [key: string]: any;
}
```

### SubstitutionApiResponse

```typescript
interface SubstitutionApiResponse {
  payload?: {
    rows: SubstitutionData[];
  };
}
```

## Error Handling

Die API verwendet standardisierte HTTP-Statuscodes:

- `200` - Success
- `400` - Bad Request (fehlende oder ungültige Parameter)
- `405` - Method Not Allowed (nur POST erlaubt)
- `500` - Internal Server Error

Fehler-Responses enthalten immer ein `error`-Feld mit einer beschreibenden Nachricht.

## Rate Limiting

Aktuell gibt es keine Rate-Limiting-Beschränkungen, aber es wird empfohlen, Anfragen verantwortungsvoll zu verwenden.

## WebUntis Integration

Die API fungiert als Proxy zur WebUntis-API der Friedrich-Dessauer-Schule Limburg:

- **Base URL**: `https://hepta.webuntis.com/WebUntis/monitor/substitution/data`
- **School**: `dessauer-schule-limburg`
- **Format**: `Web-Schüler-heute`

### Konfiguration

Die WebUntis-Konfiguration kann in `/src/constants/index.ts` angepasst werden:

```typescript
export const API_CONFIG = {
  WEBUNTIS_BASE_URL: "https://hepta.webuntis.com/WebUntis/monitor/substitution/data",
  SCHOOL_NAME: "dessauer-schule-limburg",
  FORMAT_NAME: "Web-Schüler-heute",
  // ...
};
```

## Security

- **CORS**: Standardkonfiguration von Next.js
- **Input Validation**: Validierung der eingehenden Daten
- **HTML Sanitization**: Schutz vor XSS-Angriffen bei der Darstellung

## Development

### Testen der API

Mit curl:
```bash
curl -X POST http://localhost:3000/api/getSubstitutionData \
  -H "Content-Type: application/json" \
  -d '{"date":"20240115"}'
```

Mit JavaScript (Browser):
```javascript
fetch('/api/getSubstitutionData', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ date: '20240115' })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Debug-Logs

Die API loggt Fehler in der Konsole. Für detaillierteres Debugging kann die Logging-Konfiguration erweitert werden.

## Changelog

### v0.1.1
- Verbesserte Fehlerbehandlung
- Input-Validierung hinzugefügt
- Konfiguration in Konstanten ausgelagert
- Bessere TypeScript-Typisierung