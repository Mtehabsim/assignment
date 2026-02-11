/**
 * Liskov Substitution & Open/Closed: Provider Strategy contract
 * Allows swapping providers without changing business logic
 */
export interface IExternalProvider {
  /**
   * Search for programs on external platform
   */
  search(query: string, limit: number): Promise<SearchResult[]>;

  /**
   * Fetch full details for a specific program
   */
  fetchDetails(externalId: string): Promise<ProgramDetails>;
}

export interface SearchResult {
  externalId: string;
  title: string;
  thumbnail: string;
  duration: number;
  provider: string;
}

export interface ProgramDetails {
  externalId: string;
  title: string;
  description: string;
  duration_seconds: number;
  thumbnail: string;
  provider: string;
  source_metadata: Record<string, any>;
}
