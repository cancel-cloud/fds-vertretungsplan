export type MotionLevel = 'none' | 'subtle' | 'expressive';

export interface MotionTimings {
  fast: number;
  base: number;
  slow: number;
}

export const MOTION_TIMINGS_MS: MotionTimings = {
  fast: 150,
  base: 220,
  slow: 320,
};
