import { WebUntisSubstitutionRow } from '@/types';
import { fetchUntisRowsForDate, toUntisDateNumber } from '@/lib/untis-client';

export { toUntisDateNumber };

export async function fetchUntisRows(
  date: Date
): Promise<{ date: number; rows: WebUntisSubstitutionRow[] }> {
  return fetchUntisRowsForDate(date);
}
