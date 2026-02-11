import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Program } from "../entities/program.entity";
import { Provider, ProgramStatus } from "../enums/program.enums";

/**
 * BaseProgramsRepository
 * Contains shared data access methods used by both CMS and Discovery repositories
 * Follows DRY principle while enabling proper separation of concerns
 */
@Injectable()
export abstract class BaseProgramsRepository {
  constructor(
    @InjectRepository(Program)
    protected readonly typeOrmRepository: Repository<Program>,
  ) {}

  /**
   * Find program by ID (used by both CMS and Discovery)
   */
  async findById(id: string): Promise<Program | null> {
    return this.typeOrmRepository.findOne({ where: { id } });
  }

  /**
   * Find program by external provider ID (used by both CMS and Discovery)
   */
  async findByExternalId(
    provider: Provider,
    externalId: string,
  ): Promise<Program | null> {
    return this.typeOrmRepository.findOne({
      where: { source_provider: provider, external_id: externalId },
    });
  }

  /**
   * Find program by slug (used by both CMS and Discovery)
   */
  async findBySlug(slug: string): Promise<Program | null> {
    return this.typeOrmRepository.findOne({ where: { slug } });
  }

  /**
   * Find published program by ID (used by both CMS and Discovery)
   */
  async findPublished(id: string): Promise<Program | null> {
    return this.typeOrmRepository.findOne({
      where: { id, status: ProgramStatus.PUBLISHED, deleted_at: IsNull() },
    });
  }

  async findLatestSlugPattern(baseSlug: string): Promise<string | null> {
    const regexPattern = `^${baseSlug}-[0-9]+$`;

    const result = await this.typeOrmRepository
      .createQueryBuilder("p")
      .select("p.slug")
      .where("p.slug ~ :pattern", { pattern: regexPattern })
      .orderBy("LENGTH(p.slug)", "DESC")
      .addOrderBy("p.slug", "DESC")
      .limit(1)
      .getOne();

    return result ? result.slug : null;
  }
}
