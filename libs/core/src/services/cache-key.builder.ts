import { Provider, Language } from "../enums/program.enums";

/**
 * CacheKeyBuilder
 * Centralized cache key generation to avoid string-based key duplication
 * Single source of truth for cache key formats
 */
export class CacheKeyBuilder {
  /**
   * Generate cache key for external provider details
   * @param provider - Provider enum value
   * @param externalId - External resource ID
   * @returns Formatted cache key
   */
  static providerDetails(provider: Provider, externalId: string): string {
    return `${provider.toLowerCase()}:details:${externalId}`;
  }

  /**
   * Generate cache key for filter options
   * @param lang - Language enum value
   * @returns Formatted cache key
   */
  static filters(lang: Language): string {
    return `filters:${lang}`;
  }

  /**
   * Generate cache key for program details
   * @param id - Program ID
   * @returns Formatted cache key
   */
  static programDetails(id: string): string {
    return `program:${id}`;
  }

  /**
   * Generate cache key for related programs
   * @param id - Program ID
   * @param limit - Number of related items
   * @returns Formatted cache key
   */
  static relatedPrograms(id: string, limit: number): string {
    return `related:${id}:${limit}`;
  }

  /**
   * Generate cache key for search results
   * @param query - Search query string
   * @param lang - Language enum value
   * @param limit - Result limit
   * @param offset - Result offset
   * @returns Formatted cache key
   */
  static searchResults(
    query: string,
    lang: Language,
    limit: number,
    offset: number,
  ): string {
    return `search:${lang}:${query}:${limit}:${offset}`;
  }

  /**
   * Generate cache key for home feed
   * @param page - Page number
   * @param sort - Sort option
   * @param lang - Language enum value
   * @param limit - Result limit
   * @returns Formatted cache key
   */
  static homeFeed(
    page: number,
    sort: string,
    lang: Language,
    limit: number,
  ): string {
    return `feed:${lang}:${sort}:${page}:${limit}`;
  }
}
