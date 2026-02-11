import { Injectable, Inject } from "@nestjs/common";
import {
  Program,
  Language,
  ProgramStatus,
  IDiscoveryOperations,
  IDiscoveryRepository,
  ICacheService,
  CACHE_TTL,
  CacheKeyBuilder,
} from "@app/core";
import { FilterOptions } from "../interfaces";

/**
 * Single Responsibility: Discovery read operations only
 * Handles program search, feed, filters, related content, views
 * Depends only on IDiscoveryRepository (Interface Segregation)
 */
@Injectable()
export class DiscoveryService implements IDiscoveryOperations {
  constructor(
    @Inject("IDiscoveryRepository")
    private readonly discoveryRepository: IDiscoveryRepository,
    @Inject("ICacheService") private readonly cacheService: ICacheService,
  ) {}

  async search(
    query: string,
    lang: Language = Language.AR_SA,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: Program[]; total: number }> {
    return this.discoveryRepository.searchByFullText(
      query,
      lang,
      limit,
      offset,
    );
  }

  async findHomeFeed(
    page: number = 1,
    sort: string = "newest",
    lang: Language = Language.AR_SA,
    limit: number = 20,
  ): Promise<{ data: Program[]; total: number }> {
    const offset = (page - 1) * limit;
    return this.discoveryRepository.findPublishedByStatus(
      ProgramStatus.PUBLISHED,
      lang,
      limit,
      offset,
      sort,
    );
  }

  async findById(id: string): Promise<Program | null> {
    return this.discoveryRepository.findPublished(id);
  }

  async getRelated(id: string, limit: number = 5): Promise<Program[]> {
    const program = await this.findById(id);
    if (!program) return [];

    return this.discoveryRepository.findRelated(id, program.language, limit);
  }

  async getFilters(lang: Language = Language.AR_SA): Promise<FilterOptions> {
    const cacheKey = CacheKeyBuilder.filters(lang);

    // Try to get from cache
    const cached = this.cacheService.get<FilterOptions>(cacheKey);
    if (cached) {
      return cached;
    }

    // In production: This could fetch dynamic filters from database
    // For now, return static options
    const filters: FilterOptions = {
      languages: Object.values(Language),
      statuses: ["PUBLISHED"],
    };

    // Cache for 1 hour
    this.cacheService.set(cacheKey, filters, CACHE_TTL.ONE_HOUR);

    return filters;
  }
}
