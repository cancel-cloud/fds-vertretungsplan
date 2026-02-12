import { describe, expect, it, vi } from 'vitest';
import { calculateExponentialBackoff } from '@/lib/retry-utils';

describe('retry-utils', () => {
  describe('calculateExponentialBackoff', () => {
    it('returns a delay within expected range for attempt 1', () => {
      const delay = calculateExponentialBackoff(1);
      // For attempt 1: baseDelay * 2^0 = 100ms
      // With jitter: between 50ms and 100ms
      expect(delay).toBeGreaterThanOrEqual(50);
      expect(delay).toBeLessThanOrEqual(100);
    });

    it('returns a delay within expected range for attempt 2', () => {
      const delay = calculateExponentialBackoff(2);
      // For attempt 2: baseDelay * 2^1 = 200ms
      // With jitter: between 50ms and 200ms
      expect(delay).toBeGreaterThanOrEqual(50);
      expect(delay).toBeLessThanOrEqual(200);
    });

    it('returns a delay within expected range for attempt 3', () => {
      const delay = calculateExponentialBackoff(3);
      // For attempt 3: baseDelay * 2^2 = 400ms
      // With jitter: between 50ms and 400ms
      expect(delay).toBeGreaterThanOrEqual(50);
      expect(delay).toBeLessThanOrEqual(400);
    });

    it('caps delay at maxDelayMs', () => {
      const maxDelay = 1000;
      // Attempt 10 would normally be 100 * 2^9 = 51200ms, but should be capped at 1000ms
      const delay = calculateExponentialBackoff(10, 100, maxDelay);
      expect(delay).toBeGreaterThanOrEqual(50);
      expect(delay).toBeLessThanOrEqual(maxDelay);
    });

    it('respects custom baseDelayMs', () => {
      const baseDelay = 200;
      const delay = calculateExponentialBackoff(1, baseDelay);
      // For attempt 1 with baseDelay 200: 200 * 2^0 = 200ms
      // With jitter: between 50ms and 200ms
      expect(delay).toBeGreaterThanOrEqual(50);
      expect(delay).toBeLessThanOrEqual(baseDelay);
    });

    it('always returns at least minDelayMs (50ms)', () => {
      // Mock Math.random to return 0 (which would normally give 0 delay without minimum)
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0);

      const delay = calculateExponentialBackoff(1);
      expect(delay).toBeGreaterThanOrEqual(50);

      // Restore original Math.random
      Math.random = originalRandom;
    });

    it('produces different values due to jitter', () => {
      // Generate multiple delays and check that they vary (not all the same)
      const delays = Array.from({ length: 20 }, () => calculateExponentialBackoff(3));
      const uniqueDelays = new Set(delays);
      
      // With jitter, we should get more than one unique value in 20 attempts
      // (though theoretically it's possible but very unlikely to get the same value each time)
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('increases delay exponentially across attempts', () => {
      // Test that average delay grows exponentially
      // We'll sample multiple times to account for jitter variation
      const samplesPerAttempt = 50;
      
      const avgDelay1 = Array.from({ length: samplesPerAttempt }, () => calculateExponentialBackoff(1))
        .reduce((sum, val) => sum + val, 0) / samplesPerAttempt;
      
      const avgDelay2 = Array.from({ length: samplesPerAttempt }, () => calculateExponentialBackoff(2))
        .reduce((sum, val) => sum + val, 0) / samplesPerAttempt;
      
      const avgDelay3 = Array.from({ length: samplesPerAttempt }, () => calculateExponentialBackoff(3))
        .reduce((sum, val) => sum + val, 0) / samplesPerAttempt;
      
      // Each subsequent attempt should have a higher average delay
      expect(avgDelay2).toBeGreaterThan(avgDelay1);
      expect(avgDelay3).toBeGreaterThan(avgDelay2);
    });
  });
});
