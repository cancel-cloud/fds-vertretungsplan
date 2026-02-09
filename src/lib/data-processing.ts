import {
  FilterState,
  ProcessedSubstitution,
  SubstitutionType,
  WebUntisResponse,
  WebUntisSubstitutionRow,
} from '@/types';
import { SUBSTITUTION_PRIORITY } from '@/lib/substitution-config';

const TYPE_TEXT_INDEX = 6;

const parseHtmlContent = (content: string): string =>
  content
    .replace(/<[^>]*>/g, '')
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/g, 'ß')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

export const extractSubstitutionType = (
  data: string[],
  cellClasses: Record<string, string[]> = {}
): SubstitutionType => {
  const typeText = data[TYPE_TEXT_INDEX] || '';

  const hasCancelStyle = Object.values(cellClasses).some((classes) => classes.includes('cancelStyle'));

  if (hasCancelStyle || typeText.includes('Entfall')) {
    return 'Entfall';
  }

  if (typeText.includes('Raumänderung') || /\bRaum\b/.test(typeText)) {
    return 'Raumänderung';
  }

  if (typeText.includes('Vertretung')) {
    return 'Vertretung';
  }

  if (typeText.includes('Verlegung')) {
    return 'Verlegung';
  }

  if (typeText.includes('Sondereinsatz')) {
    return 'Sondereinsatz';
  }

  if (typeText.includes('EVA')) {
    return 'EVA';
  }

  if (typeText.includes('Klausur')) {
    return 'Klausur';
  }

  if (typeText.includes('Freisetzung')) {
    return 'Freisetzung';
  }

  return 'Sonstiges';
};

const parseHourForSorting = (hourString: string): number => {
  const match = hourString.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 999;
};

const extractRoomInfo = (roomData: string): string => {
  const cleanRoom = parseHtmlContent(roomData);
  const roomMatch = cleanRoom.match(/^([^(]+)(?:\s*\([^)]+\))?/);
  return roomMatch ? roomMatch[1].trim() : cleanRoom;
};

const extractTeacherInfo = (teacherData: string): string => {
  const cleanTeacher = parseHtmlContent(teacherData);
  const teacherMatch = cleanTeacher.match(/^([^(]+)(?:\s*\([^)]+\))?/);
  return teacherMatch ? teacherMatch[1].trim() : cleanTeacher;
};

export const processSubstitutionRow = (row: WebUntisSubstitutionRow): ProcessedSubstitution => {
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

export const processApiResponse = (
  source: WebUntisResponse | WebUntisSubstitutionRow[]
): ProcessedSubstitution[] => {
  const rows = Array.isArray(source) ? source : source?.payload?.rows;

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map(processSubstitutionRow);
};

export const sortSubstitutions = (substitutions: ProcessedSubstitution[]): ProcessedSubstitution[] =>
  [...substitutions].sort((a, b) => {
    const priorityA = SUBSTITUTION_PRIORITY[a.type] ?? SUBSTITUTION_PRIORITY.Sonstiges;
    const priorityB = SUBSTITUTION_PRIORITY[b.type] ?? SUBSTITUTION_PRIORITY.Sonstiges;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const hourA = parseHourForSorting(a.hours);
    const hourB = parseHourForSorting(b.hours);

    if (hourA !== hourB) {
      return hourA - hourB;
    }

    return a.group.localeCompare(b.group, 'de');
  });

export const filterSubstitutions = (
  substitutions: ProcessedSubstitution[],
  filterState: FilterState
): ProcessedSubstitution[] => {
  let filtered = substitutions;

  if (filterState.search.trim()) {
    const searchTerm = filterState.search.toLowerCase().trim();
    filtered = filtered.filter((substitution) =>
      [
        substitution.group,
        substitution.subject,
        substitution.room,
        substitution.teacher,
        substitution.type,
        substitution.hours,
        substitution.info,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm)
    );
  }

  if (filterState.categories.length > 0) {
    filtered = filtered.filter((substitution) => filterState.categories.includes(substitution.type));
  }

  return filtered;
};

export const getUniqueSubstitutionTypes = (substitutions: ProcessedSubstitution[]): SubstitutionType[] => {
  const uniqueTypes = new Set<SubstitutionType>(substitutions.map((substitution) => substitution.type));

  return Array.from(uniqueTypes).sort(
    (a, b) => (SUBSTITUTION_PRIORITY[a] ?? 99) - (SUBSTITUTION_PRIORITY[b] ?? 99)
  );
};
