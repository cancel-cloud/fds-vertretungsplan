import { SampleData } from '@/types';

export const sampleData: SampleData = {
  sampleSubstitutions: [
    {
      data: ['1 - 4', '07:45-11:00', '10A BK', 'BT-LF06', 'B207 (A304)', 'WIRM', 'Raumänderung', ''],
      group: '10A BK',
      cellClasses: {},
    },
    {
      data: ['7 - 8', '13:15-14:45', '10A BK', 'BT-LF05', 'A304', 'HOFF', 'Entfall', ''],
      group: '10A BK',
      cellClasses: {},
    },
    {
      data: ['1 - 4', '07:45-11:00', '11A BZ', 'BT-LF09-BZ', 'A210 (A307)', 'WIES (HOFF)', 'Vertretung', ''],
      group: '11A BZ',
      cellClasses: {},
    },
    {
      data: ['5', '11:15-12:00', '11A KF', 'POWI', 'AE01', 'DICK (DONE)', 'Sondereinsatz', ''],
      group: '11A KF',
      cellClasses: {},
    },
    {
      data: ['3 - 4', '09:30-11:00', '12B FO', 'MAT', 'B102', 'SCHM', 'EVA', 'Selbstständiges Arbeiten'],
      group: '12B FO',
      cellClasses: {},
    },
    {
      data: ['7 - 8', '13:15-14:45', '12A TI', 'Prüfung', 'A305', 'MUEL', 'Klausur', 'Abschlussklausur'],
      group: '12A TI',
      cellClasses: {},
    },
    {
      data: ['5 - 6', '11:15-12:45', '13BG', 'TECH', 'Labor', '---', 'Freisetzung', 'Praktikum'],
      group: '13BG',
      cellClasses: {},
    },
    {
      data: ['2', '08:30-09:15', '11C FO', 'ENG', 'B204', 'HANS', 'Sonstiges', 'Zusatztermin'],
      group: '11C FO',
      cellClasses: {},
    },
  ],
  categories: [
    { key: 'Entfall', label: 'Entfall', priority: 1, color: '#C0152F' },
    { key: 'Raumänderung', label: 'Raumänderung', priority: 2, color: '#1FB8CD' },
    { key: 'Vertretung', label: 'Vertretung', priority: 3, color: '#5D878F' },
    { key: 'Sondereinsatz', label: 'Sondereinsatz', priority: 4, color: '#944454' },
    { key: 'EVA', label: 'EVA', priority: 5, color: '#FFC185' },
    { key: 'Klausur', label: 'Klausur', priority: 6, color: '#D2BA4C' },
    { key: 'Freisetzung', label: 'Freisetzung', priority: 7, color: '#13343B' },
    { key: 'Sonstiges', label: 'Sonstiges', priority: 8, color: '#626C71' },
  ],
};
