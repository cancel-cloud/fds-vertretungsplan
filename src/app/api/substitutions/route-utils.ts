const DEFAULT_SCHOOL_NAME = 'friedrich-dessauer-schule-limburg';

export function resolveSchoolName() {
  const configured = process.env.UNTIS_SCHOOL?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_SCHOOL_NAME;
}

export function resolveBaseUrl(schoolName: string) {
  const envUrl = process.env.UNTIS_BASE_URL?.trim();

  if (!envUrl) {
    return `https://${schoolName}.webuntis.com`;
  }

  const parsed = new URL(envUrl);
  if (parsed.protocol !== 'https:') {
    throw new Error('UNTIS_BASE_URL must use HTTPS.');
  }

  const host = parsed.hostname.toLowerCase();
  if (!host.endsWith('.webuntis.com')) {
    throw new Error('UNTIS_BASE_URL must target https://*.webuntis.com.');
  }

  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
}

export function buildSubstitutionUrl(baseUrl: string, schoolName: string) {
  return `${baseUrl}/WebUntis/monitor/substitution/data?school=${encodeURIComponent(schoolName)}`;
}

function formatDateForUntis(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const formatted = `${year}${month}${day}`;

  return {
    raw: formatted,
    numeric: Number.parseInt(formatted, 10),
  };
}

export function normalizeDateParam(dateParam: string | null, offsetParam: string | null) {
  if (dateParam && /^\d{8}$/.test(dateParam)) {
    return {
      raw: dateParam,
      numeric: Number.parseInt(dateParam, 10),
    };
  }

  const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;
  const targetDate = new Date();
  targetDate.setHours(0, 0, 0, 0);

  if (!Number.isNaN(offset) && offset !== 0) {
    targetDate.setDate(targetDate.getDate() + offset);
  }

  return formatDateForUntis(targetDate);
}
