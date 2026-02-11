import { Injectable, Inject } from '@nestjs/common';
import { Provider } from '../enums/program.enums';
import { IExternalProviderService } from '../interfaces/external-provider-service.interface';
import { ICacheService } from '../interfaces/cache.service.interface';
import { SearchResult, ProgramDetails } from '../interfaces/external-provider.interface';
import { ProviderFactory } from '../providers';

/**
 * Refactored: Single Responsibility - External provider orchestration only
 * Uses Strategy Pattern for providers
 * Uses CacheService for cache management
 * Dependency Inversion: Depends on abstractions (IExternalProvider, ICacheService)
 */
@Injectable()
export class ExternalProviderService implements IExternalProviderService {
  constructor(
    @Inject('ICacheService') private readonly cacheService: ICacheService,
    private readonly providerFactory: ProviderFactory,
  ) {}

  async search(provider: Provider, query: string, limit: number = 10): Promise<SearchResult[]> {
    const cacheKey = `${provider.toLowerCase()}:search:${query}:${limit}`;
    const cachedResult = this.cacheService.get<SearchResult[]>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // Open/Closed: Uses factory instead of switch statement
    const providerStrategy = this.providerFactory.getProvider(provider);
    const results = await providerStrategy.search(query, limit);

    this.cacheService.set(cacheKey, results);
    return results;
  }

  async fetchDetails(provider: Provider, externalId: string): Promise<ProgramDetails> {
    const cacheKey = `${provider.toLowerCase()}:details:${externalId}`;
    const cachedResult = this.cacheService.get<ProgramDetails>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // Open/Closed: Uses factory instead of switch statement
    const providerStrategy = this.providerFactory.getProvider(provider);
    const details = await providerStrategy.fetchDetails(externalId);

    this.cacheService.set(cacheKey, details);
    return details;
  }

  /**
   * Expose cache stats for monitoring (optional)
   */
  getCacheStats(): any {
    return this.cacheService.getStats();
  }

  /**
   * Clear cache (for testing or maintenance)
   */
  clearCache(): void {
    this.cacheService.clear();
  }
}
