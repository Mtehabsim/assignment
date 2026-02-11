import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Program } from "./entities/program.entity";
import { ProgramsRepository } from "./repositories/programs.repository";
import { CmsRepository } from "./repositories/cms.repository";
import { DiscoveryRepository } from "./repositories/discovery.repository";
import { CacheService } from "./services/cache.service";
import { ExternalProviderService } from "./services/external-provider.service.new";
import { ProviderFactory } from "./providers/provider.factory";
import { YouTubeProvider } from "./providers/youtube.provider";

@Module({
  imports: [TypeOrmModule.forFeature([Program])],
  providers: [
    // ========== Repositories (SOLID Compliant - Separated by Responsibility) ==========
    // Separate CMS and Discovery repositories (Liskov Substitution Principle)
    CmsRepository,
    DiscoveryRepository,

    // Interface bindings
    { provide: "ICmsRepository", useClass: CmsRepository },
    { provide: "IDiscoveryRepository", useClass: DiscoveryRepository },

    // Backward compatibility - unified repository still available if needed
    ProgramsRepository,
    { provide: "IProgramsRepository", useClass: ProgramsRepository },

    // ========== Cache Service ==========
    CacheService,
    { provide: "ICacheService", useClass: CacheService },

    // ========== External Provider Strategy Pattern ==========
    // Individual providers
    { provide: "YOUTUBE_PROVIDER", useClass: YouTubeProvider },
    // Provider Factory (orchestrates strategies)
    ProviderFactory,

    // ========== External Provider Service (Orchestrator) ==========
    ExternalProviderService,
    { provide: "IExternalProviderService", useClass: ExternalProviderService },
  ],
  exports: [
    // Repositories - Separate implementations
    CmsRepository,
    DiscoveryRepository,
    "ICmsRepository",
    "IDiscoveryRepository",

    // Backward compatibility
    ProgramsRepository,
    "IProgramsRepository",

    // Services
    CacheService,
    "ICacheService",
    ExternalProviderService,
    "IExternalProviderService",
    ProviderFactory,
  ],
})
export class CoreModule {}
