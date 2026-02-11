/**
 * Interface Segregation: Repository contracts split by responsibility
 * Abstracts TypeORM details from business logic
 */
import { Program } from "../entities/program.entity";
import { ProgramStatus, Language } from "../enums/program.enums";

/**
 * CMS Write Operations Repository
 * Single Responsibility: CMS operations only
 * Used by: CmsOperationsService
 */
export interface ICmsRepository {
  findById(id: string): Promise<Program | null>;
  findByExternalId(
    provider: string,
    externalId: string,
  ): Promise<Program | null>;
  findDrafts(
    page: number,
    limit: number,
  ): Promise<{ data: Program[]; total: number }>;
  create(program: Partial<Program>): Program;
  save(program: Program): Promise<Program>;
  softDelete(id: string): Promise<void>;
  findBySlug(slug: string): Promise<Program | null>;
  findLatestSlugPattern(baseSlug: string): Promise<string | null>;
}

/**
 * Discovery Read Operations Repository
 * Single Responsibility: Discovery operations only
 * Used by: DiscoveryService
 */
export interface IDiscoveryRepository {
  findPublished(id: string): Promise<Program | null>;
  searchByFullText(
    query: string,
    lang: Language,
    limit: number,
    offset: number,
  ): Promise<{ data: Program[]; total: number }>;
  findPublishedByStatus(
    status: ProgramStatus,
    lang: Language,
    limit: number,
    offset: number,
    sort: string,
  ): Promise<{ data: Program[]; total: number }>;
  findRelated(
    currentId: string,
    language: Language,
    limit: number,
  ): Promise<Program[]>;
}

/**
 * Unified Repository (extends both for backward compatibility)
 */
export interface IProgramsRepository
  extends ICmsRepository, IDiscoveryRepository {
  // No additional methods - this interface exists for backward compatibility
}
