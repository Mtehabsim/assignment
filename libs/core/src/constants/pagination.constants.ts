/**
 * Pagination Constants
 * Centralized pagination values to ensure consistency
 */
export const PAGINATION = {
  /** Default page size for list endpoints */
  DEFAULT_PAGE_SIZE: 20,

  /** Maximum allowed page size */
  MAX_PAGE_SIZE: 100,

  /** Minimum allowed page size */
  MIN_PAGE_SIZE: 1,

  /** Minimum allowed page number */
  MIN_PAGE: 1,

  /** Default limit for search results */
  DEFAULT_SEARCH_LIMIT: 10,

  /** Default limit for related items */
  DEFAULT_RELATED_LIMIT: 5,

  /** Maximum limit for related items */
  MAX_RELATED_LIMIT: 50,
} as const;
