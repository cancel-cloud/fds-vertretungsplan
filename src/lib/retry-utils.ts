/**
 * Calculates exponential backoff delay with jitter to avoid thundering herd.
 * Uses full jitter strategy: randomizes the delay between minDelay and the exponential backoff value.
 * 
 * @param attempt - The current attempt number (1-indexed)
 * @param baseDelayMs - The base delay in milliseconds (default: 100ms)
 * @param maxDelayMs - The maximum delay in milliseconds (default: 5000ms)
 * @returns The delay in milliseconds with jitter applied (minimum 50ms)
 */
export function calculateExponentialBackoff(
  attempt: number,
  baseDelayMs = 100,
  maxDelayMs = 5000
): number {
  const minDelayMs = 50; // Minimum delay to ensure some backoff always occurs

  // Calculate exponential backoff: baseDelay * 2^(attempt - 1)
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);

  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

  // Apply full jitter: random value between minDelay and cappedDelay
  return Math.floor(Math.random() * (cappedDelay - minDelayMs + 1)) + minDelayMs;
}
