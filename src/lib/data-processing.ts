import { 
  WebUntisResponse, 
  WebUntisSubstitutionRow, 
  ProcessedSubstitution,
  FilterState 
} from '@/types';

// Create utility functions for HTML parsing and type extraction
const parseHtmlContent = (content: string): string => {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
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
};

const extractSubstitutionType = (data: string[], cellClasses: Record<string, string[]>): string => {
  const typeText = data[6] || '';
  
  const hasCancelStyle = Object.values(cellClasses).some(classes => 
    classes.includes('cancelStyle')
  );
  
  if (hasCancelStyle || typeText.includes('Entfall')) {
    return 'Entfall';
  }
  
  if (typeText.includes('Raumänderung') || typeText.includes('Raum')) {
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
  
  return typeText || 'Sonstiges';
};

// Priority mapping for sorting substitutions
const SUBSTITUTION_PRIORITY: Record<string, number> = {
  'Entfall': 0,
  'Raumänderung': 1,
  'Vertretung': 2,
  'Verlegung': 3,
  'Sondereinsatz': 4,
  'EVA': 5,
  'Klausur': 6,
  'Freisetzung': 7,
  'Sonstiges': 8,
};

// Parse hour range to get start hour for sorting
const parseHourForSorting = (hourString: string): number => {
  const match = hourString.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 999;
};

// Extract room information, handling substitution markup
const extractRoomInfo = (roomData: string): string => {
  const cleanRoom = parseHtmlContent(roomData);
  const roomMatch = cleanRoom.match(/^([^(]+)(?:\s*\([^)]+\))?/);
  return roomMatch ? roomMatch[1].trim() : cleanRoom;
};

// Extract teacher information, handling substitution markup
const extractTeacherInfo = (teacherData: string): string => {
  const cleanTeacher = parseHtmlContent(teacherData);
  const teacherMatch = cleanTeacher.match(/^([^(]+)(?:\s*\([^)]+\))?/);
  return teacherMatch ? teacherMatch[1].trim() : cleanTeacher;
};

// Process a single WebUntis row into our app format
export const processSubstitutionRow = (row: WebUntisSubstitutionRow): ProcessedSubstitution => {
  const [hours, time, group, subject, room, teacher, , info] = row.data;
  
  const processedType = extractSubstitutionType(row.data, row.cellClasses);
  
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
    },
  };
};

// Process WebUntis API response into app format
export const processApiResponse = (
  source: WebUntisResponse | WebUntisSubstitutionRow[]
): ProcessedSubstitution[] => {
  const rows = Array.isArray(source)
    ? source
    : source?.payload?.rows;

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map(processSubstitutionRow);
};

// Sort substitutions by priority (Entfall first) and then by hour
export const sortSubstitutions = (substitutions: ProcessedSubstitution[]): ProcessedSubstitution[] => {
  return [...substitutions].sort((a, b) => {
    const priorityA = SUBSTITUTION_PRIORITY[a.type] ?? SUBSTITUTION_PRIORITY['Sonstiges'];
    const priorityB = SUBSTITUTION_PRIORITY[b.type] ?? SUBSTITUTION_PRIORITY['Sonstiges'];
    
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
};

// Filter substitutions based on search and categories
export const filterSubstitutions = (
  substitutions: ProcessedSubstitution[],
  filterState: FilterState
): ProcessedSubstitution[] => {
  let filtered = substitutions;

  if (filterState.search.trim()) {
    const searchTerm = filterState.search.toLowerCase().trim();
    filtered = filtered.filter(sub => 
      sub.group.toLowerCase().includes(searchTerm) ||
      sub.subject.toLowerCase().includes(searchTerm) ||
      sub.room.toLowerCase().includes(searchTerm) ||
      sub.teacher.toLowerCase().includes(searchTerm) ||
      sub.type.toLowerCase().includes(searchTerm) ||
      sub.hours.toLowerCase().includes(searchTerm) ||
      sub.info.toLowerCase().includes(searchTerm)
    );
  }

  if (filterState.categories.length > 0) {
    filtered = filtered.filter(sub => 
      filterState.categories.includes(sub.type)
    );
  }

  return filtered;
};

// Get unique substitution types for filter options
export const getUniqueSubstitutionTypes = (substitutions: ProcessedSubstitution[]): string[] => {
  const types = new Set(substitutions.map(sub => sub.type));
  return Array.from(types).sort((a, b) => {
    const priorityA = SUBSTITUTION_PRIORITY[a] ?? SUBSTITUTION_PRIORITY['Sonstiges'];
    const priorityB = SUBSTITUTION_PRIORITY[b] ?? SUBSTITUTION_PRIORITY['Sonstiges'];
    return priorityA - priorityB;
  });
}; 
