import { describe, expect, it } from 'vitest';
import {
  extractSubstitutionType,
  filterSubstitutions,
  processSubstitutionRow,
  sortSubstitutions,
} from '@/lib/data-processing';
import { FilterState, WebUntisSubstitutionRow } from '@/types';

describe('data-processing', () => {
  it('maps cancelStyle rows to Entfall', () => {
    const type = extractSubstitutionType(
      ['1', '07:45-08:30', '10A', 'MAT', 'A101', 'ABC', 'Vertretung', ''],
      { room: ['cancelStyle'] }
    );

    expect(type).toBe('Entfall');
  });

  it('detects Verlegung type', () => {
    const type = extractSubstitutionType(
      ['1', '07:45-08:30', '10A', 'MAT', 'A101', 'ABC', 'Verlegung', ''],
      {}
    );

    expect(type).toBe('Verlegung');
  });

  it('sorts by substitution priority and hour', () => {
    const rowA = processSubstitutionRow({
      data: ['2', '08:30-09:15', '10A', 'MAT', 'A101', 'ABC', 'Vertretung', ''],
      cssClasses: [],
      cellClasses: {},
      group: '10A',
    });
    const rowB = processSubstitutionRow({
      data: ['1', '07:45-08:30', '10A', 'MAT', 'A101', 'ABC', 'Entfall', ''],
      cssClasses: [],
      cellClasses: {},
      group: '10A',
    });

    const sorted = sortSubstitutions([rowA, rowB]);
    expect(sorted[0].type).toBe('Entfall');
    expect(sorted[1].type).toBe('Vertretung');
  });

  it('filters by search and categories', () => {
    const rows: WebUntisSubstitutionRow[] = [
      {
        data: ['1', '07:45-08:30', '10A BK', 'MAT', 'A101', 'ABC', 'Entfall', ''],
        cssClasses: [],
        cellClasses: {},
        group: '10A BK',
      },
      {
        data: ['2', '08:30-09:15', '11B', 'ENG', 'B201', 'DEF', 'Vertretung', ''],
        cssClasses: [],
        cellClasses: {},
        group: '11B',
      },
    ];

    const processed = rows.map(processSubstitutionRow);
    const filterState: FilterState = { search: '10a', categories: ['Entfall'] };

    const filtered = filterSubstitutions(processed, filterState);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].group).toContain('10A');
  });
});
