import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import {
  Program,
  Provider,
  ProgramStatus,
  Language,
  ICmsOperations,
  IExternalProviderService,
  ICmsRepository,
  ICacheService,
  CacheKeyBuilder,
  SearchResult,
  SlugGenerator,
} from "@app/core";
import { CmsUpdateProgramDto } from '../dto/update-program.dto';
@Injectable()
export class CmsOperationsService implements ICmsOperations {
  constructor(
    @Inject("ICmsRepository") private readonly cmsRepository: ICmsRepository,
    @Inject("IExternalProviderService")
    private readonly externalProviderService: IExternalProviderService,
    @Inject("ICacheService") private readonly cacheService: ICacheService,
  ) {}

  async searchExternal(
    provider: Provider,
    query: string,
    limit: number = 10,
  ): Promise<SearchResult[]> {
    return this.externalProviderService.search(provider, query, limit);
  }

  async importProgram(
    provider: Provider,
    externalId: string,
  ): Promise<Program> {
    const existing = await this.cmsRepository.findByExternalId(
      provider,
      externalId,
    );
    if (existing) return existing;

    const details = await this.externalProviderService.fetchDetails(
      provider,
      externalId,
    );

    const uniqueSlug = await this.ensureUniqueSlug(details.title);

    const program = this.cmsRepository.create({
      title: details.title,
      slug: uniqueSlug,
      description: details.description,
      duration_seconds: details.duration_seconds,
      thumbnail_url: details.thumbnail,
      source_provider: provider,
      external_id: externalId,
      source_metadata: details.source_metadata,
      status: ProgramStatus.DRAFT,
      language: Language.AR_SA,
    });

    return this.cmsRepository.save(program);
  }

  async listDrafts(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Program[]; total: number }> {
    return this.cmsRepository.findDrafts(page, limit);
  }

  async getEditorView(id: string): Promise<Program> {
    const program = await this.cmsRepository.findById(id);
    if (!program) throw new NotFoundException("Program not found");
    return program;
  }

  async updateProgram(
  id: string,
  updateDto: CmsUpdateProgramDto,
): Promise<Program> {
  const program = await this.getEditorView(id);

  if (updateDto.title) program.title = updateDto.title;
  if (updateDto.description) program.description = updateDto.description;
  if (updateDto.duration_seconds !== undefined) program.duration_seconds = updateDto.duration_seconds;
  if (updateDto.language) program.language = updateDto.language;
  if (updateDto.source_metadata) program.source_metadata = updateDto.source_metadata;
  if (updateDto.category) program.category = updateDto.category;
  if (updateDto.thumbnail_url) program.thumbnail_url = updateDto.thumbnail_url;

  const result = await this.cmsRepository.save(program);
  this.invalidateProgramCache(program);
  return result;
}

  async publishProgram(id: string): Promise<Program> {
    const program = await this.getEditorView(id);

    if (!program.title || !program.slug) {
      throw new BadRequestException(
        "Program must have title and slug before publishing",
      );
    }

    program.status = ProgramStatus.PUBLISHED;
    program.published_at = new Date();

    const result = await this.cmsRepository.save(program);
    this.invalidateProgramCache(program);
    return result;
  }

  async archiveProgram(id: string): Promise<void> {
    const program = await this.getEditorView(id);
    await this.cmsRepository.softDelete(id);
    this.invalidateProgramCache(program);
  }

  private invalidateProgramCache(program: Program): void {
    if (program.source_provider && program.external_id) {
      const cacheKey = CacheKeyBuilder.providerDetails(
        program.source_provider,
        program.external_id,
      );
      this.cacheService.delete(cacheKey);
    }
  }


  private async ensureUniqueSlug(title: string): Promise<string> {
    const baseSlug = SlugGenerator.generate(title);

    // Check if the clean slug exists
    const exactMatch = await this.cmsRepository.findBySlug(baseSlug);
    if (!exactMatch) return baseSlug;

    // Efficiently find the highest numbered suffix
    const latestSlug = await this.cmsRepository.findLatestSlugPattern(baseSlug);

    if (latestSlug) {
      // Extract number from end of string (e.g. "video-5" -> 5)
      const match = latestSlug.match(/-(\d+)$/);
      const number = match ? parseInt(match[1], 10) + 1 : 1;
      return `${baseSlug}-${number}`;
    }

    return `${baseSlug}-1`;
  }
}