import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core';
import { DiscoveryService } from './services/discovery.service';

/**
 * Discovery Module: Handles public read operations
 * Imports CoreModule which provides all dependencies via DI
 * Single Responsibility: Discovery operations only
 */
@Module({
  imports: [CoreModule],
  providers: [
    DiscoveryService,
    { provide: 'IDiscoveryOperations', useClass: DiscoveryService },
  ],
  exports: [DiscoveryService, 'IDiscoveryOperations'],
})
export class DiscoveryModule {}
