import { SubstitutionType } from '@/types';

export interface SubstitutionStyleConfig {
  border: string;
  background: string;
  badge: string;
  dot: string;
  text: string;
}

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

export const SUBSTITUTION_STYLES: Record<SubstitutionType, SubstitutionStyleConfig> = {
  Entfall: {
    border: 'border-l-[var(--substitution-entfall)]',
    background: 'bg-[var(--substitution-entfall-soft)]',
    badge: 'bg-[var(--substitution-entfall)] text-white',
    dot: 'bg-[var(--substitution-entfall)]',
    text: 'text-white',
  },
  Raumänderung: {
    border: 'border-l-[var(--substitution-raumaenderung)]',
    background: 'bg-[var(--substitution-raumaenderung-soft)]',
    badge: 'bg-[var(--substitution-raumaenderung)] text-white',
    dot: 'bg-[var(--substitution-raumaenderung)]',
    text: 'text-white',
  },
  Vertretung: {
    border: 'border-l-[var(--substitution-vertretung)]',
    background: 'bg-[var(--substitution-vertretung-soft)]',
    badge: 'bg-[var(--substitution-vertretung)] text-white',
    dot: 'bg-[var(--substitution-vertretung)]',
    text: 'text-white',
  },
  Verlegung: {
    border: 'border-l-[var(--substitution-verlegung)]',
    background: 'bg-[var(--substitution-verlegung-soft)]',
    badge: 'bg-[var(--substitution-verlegung)] text-black',
    dot: 'bg-[var(--substitution-verlegung)]',
    text: 'text-black',
  },
  Sondereinsatz: {
    border: 'border-l-[var(--substitution-sondereinsatz)]',
    background: 'bg-[var(--substitution-sondereinsatz-soft)]',
    badge: 'bg-[var(--substitution-sondereinsatz)] text-white',
    dot: 'bg-[var(--substitution-sondereinsatz)]',
    text: 'text-white',
  },
  EVA: {
    border: 'border-l-[var(--substitution-eva)]',
    background: 'bg-[var(--substitution-eva-soft)]',
    badge: 'bg-[var(--substitution-eva)] text-black',
    dot: 'bg-[var(--substitution-eva)]',
    text: 'text-black',
  },
  Klausur: {
    border: 'border-l-[var(--substitution-klausur)]',
    background: 'bg-[var(--substitution-klausur-soft)]',
    badge: 'bg-[var(--substitution-klausur)] text-black',
    dot: 'bg-[var(--substitution-klausur)]',
    text: 'text-black',
  },
  Freisetzung: {
    border: 'border-l-[var(--substitution-freisetzung)]',
    background: 'bg-[var(--substitution-freisetzung-soft)]',
    badge: 'bg-[var(--substitution-freisetzung)] text-white',
    dot: 'bg-[var(--substitution-freisetzung)]',
    text: 'text-white',
  },
  Sonstiges: {
    border: 'border-l-[var(--substitution-sonstiges)]',
    background: 'bg-[var(--substitution-sonstiges-soft)]',
    badge: 'bg-[var(--substitution-sonstiges)] text-white',
    dot: 'bg-[var(--substitution-sonstiges)]',
    text: 'text-white',
  },
};

export const getSubstitutionStyle = (type: string): SubstitutionStyleConfig => {
  if (type in SUBSTITUTION_STYLES) {
    return SUBSTITUTION_STYLES[type as SubstitutionType];
  }
  return SUBSTITUTION_STYLES.Sonstiges;
};
