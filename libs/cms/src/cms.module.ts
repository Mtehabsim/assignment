import { Module } from '@nestjs/common';
import { CoreModule } from '@app/core';
import { CmsOperationsService } from './services/cms-operations.service';

/**
 * CMS Module: Handles admin write operations
 * Imports CoreModule which provides all dependencies via DI
 * Single Responsibility: CMS operations only
 */
@Module({
  imports: [CoreModule],
  providers: [
    CmsOperationsService,
    { provide: 'ICmsOperations', useClass: CmsOperationsService },
  ],
  exports: [CmsOperationsService, 'ICmsOperations'],
})
export class CmsModule {}
