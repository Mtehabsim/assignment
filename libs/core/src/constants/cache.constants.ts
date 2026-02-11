/**
 * Cache TTL (Time To Live) Constants
 * Centralized cache duration values to avoid magic numbers
 */
export const CACHE_TTL = {
  /** 1 hour in milliseconds */
  ONE_HOUR: 3600000,

  /** 5 minutes in milliseconds */
  FIVE_MINUTES: 300000,

  /** 1 day in milliseconds */
  ONE_DAY: 86400000,

  /** 30 seconds in milliseconds */
  THIRTY_SECONDS: 30000,
} as const;

/**
 * Cache size limits
 */
export const CACHE_LIMITS = {
  /** Maximum number of entries in in-memory cache */
  MAX_CACHE_SIZE: 1000,

  /** Default TTL for cache entries */
  DEFAULT_TTL: CACHE_TTL.ONE_HOUR,
} as const;
