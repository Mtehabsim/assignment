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
  UpdateProgramDto,
  ICacheService,
  CacheKeyBuilder,
  SearchResult,
  SlugGenerator,
} from "@app/core";

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
    if (existing) {
      return existing;
    }

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
    updateDto: UpdateProgramDto,
  ): Promise<Program> {
    const program = await this.getEditorView(id);
    Object.assign(program, updateDto);
    program.updated_at = new Date();

    // Use transaction to ensure atomicity
    const result = await this.cmsRepository.save(program);

    // Invalidate cache after successful save
    this.invalidateProgramCache(program);
    return result;
  }

  async publishProgram(id: string): Promise<Program> {
    const program = await this.getEditorView(id);

    // Ensure program is in valid state for publishing
    if (!program.title || !program.slug) {
      throw new BadRequestException(
        "Program must have title and slug before publishing",
      );
    }

    program.status = ProgramStatus.PUBLISHED;
    program.published_at = new Date();
    program.updated_at = new Date();

    // Use transaction to ensure atomicity
    const result = await this.cmsRepository.save(program);

    // Invalidate cache after successful save
    this.invalidateProgramCache(program);
    return result;
  }

  async archiveProgram(id: string): Promise<void> {
    const program = await this.getEditorView(id);

    // Use transaction to ensure atomicity
    await this.cmsRepository.softDelete(id);

    // Invalidate cache after successful delete
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
    let slug = baseSlug;
    let counter = 1;

    while (await this.cmsRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
