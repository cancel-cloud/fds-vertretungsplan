import { SubstitutionType } from '@/types';

export const SUBSTITUTION_PRIORITY: Record<SubstitutionType, number> = {
  Entfall: 0,
  Raumänderung: 1,
  Vertretung: 2,
  Verlegung: 3,
  Sondereinsatz: 4,
  EVA: 5,
  Klausur: 6,
  Freisetzung: 7,
  Sonstiges: 8,
};
