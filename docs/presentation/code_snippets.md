# Code-Snippets für die BLL-Präsentation

Alle Snippets sind bewusst kurz gehalten und eignen sich für Folien mit Monospace-Codekarte. Für die Präsentation sollte jeweils nur ein Kernaspekt farblich hervorgehoben werden.

## 1. `matchSubstitutionToEntry`: persönliches Matching

Quelle: `src/lib/schedule-matching.ts`

```ts
export const matchSubstitutionToEntry = (
  substitution: ProcessedSubstitution,
  entry: TimetableMatchEntry,
  targetDate: Date
): MatchResult | null => {
  const weekday = weekdayFromDate(targetDate);
  if (!weekday || weekday !== entry.weekday) return null;
  if (!appliesToWeekMode(entry.weekMode, targetDate)) return null;

  const substitutionPeriods = parsePeriodsFromHours(substitution.hours);
  const entryPeriods = periodsForEntry(entry.startPeriod, entry.duration);
  const overlaps = substitutionPeriods.some((period) => entryPeriods.includes(period));
  if (!overlaps) return null;

  const subjectMatch = textMatchesCode(substitution.subject, entry.subjectCode);
  const teacherMatch = textMatchesCode(substitution.teacher, entry.teacherCode);
  if (!subjectMatch && !teacherMatch) return null;

  const roomMatch = Boolean(entry.room && textMatchesCode(substitution.room, entry.room));
  return { entry, substitution, subjectMatch, teacherMatch, roomMatch,
    confidence: roomMatch || (subjectMatch && teacherMatch) ? 'high' : 'medium' };
};
```

**Warum es wichtig ist:** Dieses Snippet zeigt den fachlichen Kern der App: Aus einer allgemeinen WebUntis-Zeile wird nur dann ein persönlicher Treffer, wenn Datum, Wochenmodus, Stundenüberlappung und Fach oder Lehrer passen.

## 2. Fingerprint- und Delta-Logik

Quelle: `src/lib/notification-state.ts`

```ts
export function buildNotificationFingerprint(
  userId: string,
  targetDate: number,
  keys: string[]
): string {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${targetDate}:${keys.join('||')}`)
    .digest('hex');
}

type DeltaAction = 'send' | 'skip' | 'clear';

export function resolveNotificationDeltaAction(
  previousFingerprint: string | null,
  currentFingerprint: string | null,
  currentMatchCount: number
): DeltaAction {
  if (currentMatchCount <= 0 || !currentFingerprint) {
    return previousFingerprint ? 'clear' : 'skip';
  }
  if (!previousFingerprint) return 'send';
  return previousFingerprint === currentFingerprint ? 'skip' : 'send';
}
```

**Warum es wichtig ist:** Die App verschickt Push nicht bei jeder Prüfung, sondern nur bei neuen oder geänderten relevanten Zuständen. Der Fingerprint ist der stabile Vergleichswert.

## 3. Push-Dispatch-Loop

Quelle: `src/app/api/internal/push/dispatch/route.ts`

```ts
for (const dayDate of lookaheadDays) {
  const dateNumber = toUntisDateNumber(dayDate);
  const substitutions = substitutionsByDate.get(dateNumber) ?? [];
  const matches = findRelevantSubstitutions(substitutions, entries, dayDate);
  const keys = canonicalizeMatchKeys(matches);
  const currentMatchCount = keys.length;
  const currentFingerprint =
    currentMatchCount > 0 ? buildNotificationFingerprint(user.id, dateNumber, keys) : null;
  const previousState = stateByDate.get(dateNumber) ?? null;

  const action = resolveNotificationDeltaAction(
    previousState?.lastFingerprint ?? null,
    currentFingerprint,
    currentMatchCount
  );

  if (action === 'skip') {
    if (!sendUnchanged || currentMatchCount <= 0) {
      skippedUnchanged += 1;
      continue;
    }
  }
}
```

**Warum es wichtig ist:** Das Snippet zeigt, wie der geplante Dispatch pro Nutzer und Zieldatum arbeitet: Daten laden, matchen, fingerprinten und anhand des Deltas entscheiden.

## 4. Daten-Normalisierung aus WebUntis-Zeilen

Quelle: `src/lib/data-processing.ts`

```ts
export const processSubstitutionRow = (
  row: WebUntisSubstitutionRow
): ProcessedSubstitution => {
  const [hours, time, group, subject, room, teacher, , info] = row.data;
  const processedType = extractSubstitutionType(row.data, row.cellClasses || {});

  return {
    hours: hours || '',
    time: time || '',
    group: group || '',
    subject: parseHtmlContent(subject || ''),
    room: extractRoomInfo(room || ''),
    teacher: extractTeacherInfo(teacher || ''),
    type: processedType,
    info: parseHtmlContent(info || ''),
    originalData: {
      data: row.data,
      group: row.group,
      cellClasses: row.cellClasses || {},
    },
  };
};
```

**Warum es wichtig ist:** WebUntis liefert Rohdaten mit HTML und fachlichen Typinformationen. Erst die Normalisierung macht daraus strukturierte Daten für UI, Filter und Matching.

## 5. Stundenplan-Konfliktvalidierung

Quelle: `src/lib/timetable.ts`

```ts
const buildConflicts = (normalized: NormalizedTimetableEntryWithMeta[]): TimetableConflict[] => {
  const conflicts: TimetableConflict[] = [];

  for (let i = 0; i < normalized.length; i += 1) {
    const left = normalized[i];
    const leftPeriods = periodsForEntry(left.startPeriod, left.duration);

    for (let j = i + 1; j < normalized.length; j += 1) {
      const right = normalized[j];
      if (left.weekday !== right.weekday) continue;
      if (!isWeekModeOverlap(left.weekMode, right.weekMode)) continue;

      const rightPeriods = periodsForEntry(right.startPeriod, right.duration);
      const overlappingPeriods = leftPeriods.filter((period) => rightPeriods.includes(period));
      if (overlappingPeriods.length > 0) {
        const [leftEntry, rightEntry] = buildConflictEntries(left, right);
        conflicts.push({ weekday: left.weekday, periods: overlappingPeriods,
          left: leftEntry, right: rightEntry });
      }
    }
  }
  return conflicts;
};
```

**Warum es wichtig ist:** Die Validierung verhindert widersprüchliche Stundenpläne. Gleichzeitig berücksichtigt sie gerade/ungerade Wochen, damit A/B-Wochen nicht fälschlich als Konflikt gelten.
