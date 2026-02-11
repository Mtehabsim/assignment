/**
 * Interface Segregation: Discovery read operations
 * Controllers/clients only depend on methods they use
 */
import { Program } from "../entities/program.entity";
import { Language } from "../enums/program.enums";

export interface IDiscoveryOperations {
  /**
   * Full-text search published programs
   */
  search(
    query: string,
    lang: Language,
    limit: number,
    offset: number,
  ): Promise<{ data: Program[]; total: number }>;

  /**
   * Get home feed with sorting
   */
  findHomeFeed(
    page: number,
    sort: string,
    lang: Language,
    limit: number,
  ): Promise<{ data: Program[]; total: number }>;

  /**
   * Get program by ID
   */
  findById(id: string): Promise<Program | null>;

  /**
   * Find related/similar programs
   */
  getRelated(id: string, limit: number): Promise<Program[]>;

  /**
   * Get available filters (languages, statuses, categories)
   */
  getFilters(lang: Language): Promise<FilterOptions>;
}

export interface FilterOptions {
  languages: string[];
  statuses: string[];
  categories?: string[];
}
