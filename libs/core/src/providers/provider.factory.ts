import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { Provider } from '../enums/program.enums';
import { IExternalProvider } from '../interfaces/external-provider.interface';

/**
 * Factory Pattern: Provides strategy instances
 * Open/Closed: Adding new providers is now possible via DI
 * Dependency Inversion: Providers are injected, not hardcoded
 * Single Responsibility: Only responsible for provider selection
 */
@Injectable()
export class ProviderFactory {
  private providers: Map<Provider, IExternalProvider>;

  constructor(
    @Inject('YOUTUBE_PROVIDER') private youtubeProvider: IExternalProvider,
  ) {
    this.providers = new Map();
    this.providers.set(Provider.YOUTUBE, youtubeProvider);
  }

  getProvider(type: Provider): IExternalProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new BadRequestException(`Unsupported provider: ${type}`);
    }
    return provider;
  }

  /**
   * Register a new provider at runtime (useful for testing or plugins)
   */
  registerProvider(type: Provider, provider: IExternalProvider): void {
    this.providers.set(type, provider);
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders(): Provider[] {
    return Array.from(this.providers.keys());
  }
}
