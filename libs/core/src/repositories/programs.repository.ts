import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, SelectQueryBuilder } from "typeorm";
import { Program } from "../entities/program.entity";
import {
  IProgramsRepository,
  ICmsRepository,
  IDiscoveryRepository,
} from "../interfaces/programs.repository.interface";
import { ProgramStatus, Language, Provider } from "../enums/program.enums";
import { ProgramQueryBuilder } from "../query-builders";

/**
 * Unified Repository Implementation
 * Implements both ICmsRepository (write) and IDiscoveryRepository (read)
 * Dependency Inversion: Abstracts TypeORM implementation details from business logic
 * Allows for easy testing and switching database implementations
 */
@Injectable()
export class ProgramsRepository
  implements IProgramsRepository, ICmsRepository, IDiscoveryRepository
{
  private readonly logger = new Logger(ProgramsRepository.name);

  constructor(
    @InjectRepository(Program)
    private typeOrmRepository: Repository<Program>,
  ) {}

  async findById(id: string): Promise<Program | null> {
    return this.typeOrmRepository.findOne({ where: { id } });
  }

  async findByExternalId(
    provider: Provider,
    externalId: string,
  ): Promise<Program | null> {
    return this.typeOrmRepository.findOne({
      where: { source_provider: provider, external_id: externalId },
    });
  }

  async findDrafts(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Program[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.typeOrmRepository.findAndCount({
      where: { status: ProgramStatus.DRAFT, deleted_at: IsNull() },
      order: { created_at: "DESC" },
      take: limit,
      skip,
    });
    return { data, total };
  }

  create(program: Partial<Program>): Program {
    return this.typeOrmRepository.create(program);
  }

  async save(program: Program): Promise<Program> {
    return this.typeOrmRepository.save(program);
  }

  async softDelete(id: string): Promise<void> {
    const program = await this.findById(id);
    if (!program) {
      throw new NotFoundException("Program not found");
    }
    program.deleted_at = new Date();
    await this.typeOrmRepository.save(program);
  }

  async findPublished(id: string): Promise<Program | null> {
    return this.typeOrmRepository.findOne({
      where: { id, status: ProgramStatus.PUBLISHED, deleted_at: IsNull() },
    });
  }

  async searchByFullText(
    query: string,
    lang: Language = Language.AR_SA,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ data: Program[]; total: number }> {
    let queryBuilder = this.typeOrmRepository.createQueryBuilder("p");

    queryBuilder = ProgramQueryBuilder.applyFullTextSearch(
      queryBuilder,
      query,
      lang,
    );

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { data, total };
  }

  async findPublishedByStatus(
    status: ProgramStatus = ProgramStatus.PUBLISHED,
    lang: Language = Language.AR_SA,
    limit: number = 20,
    offset: number = 0,
    sort: string = "newest",
  ): Promise<{ data: Program[]; total: number }> {
    let query = this.typeOrmRepository.createQueryBuilder("p");

    // Apply filters and sorting using QueryBuilder
    query = ProgramQueryBuilder.applyPublishedFilters(query, lang, status);
    query = ProgramQueryBuilder.applySorting(query, sort);

    const [data, total] = await query
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { data, total };
  }

  async findRelated(
    currentId: string,
    language: Language = Language.AR_SA,
    limit: number = 5,
  ): Promise<Program[]> {
    const program = await this.findPublished(currentId);
    if (!program) return [];

    let query = this.typeOrmRepository.createQueryBuilder("p");

    query = ProgramQueryBuilder.applyRelatedQuery(
      query,
      currentId,
      program.title,
      language,
    );

    return query.take(limit).getMany();
  }

  async findBySlug(slug: string): Promise<Program | null> {
    return this.typeOrmRepository.findOne({ where: { slug } });
  }
}
