import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Program } from "../entities/program.entity";
import { IDiscoveryRepository } from "../interfaces/programs.repository.interface";
import { ProgramStatus, Language } from "../enums/program.enums";
import { BaseProgramsRepository } from "./base-programs.repository";
import { ProgramQueryBuilder } from "../query-builders";

/**
 * DiscoveryRepository
 * Implements read operations for Discovery (public-facing content)
 * Single Responsibility: Discovery data operations only
 * Liskov Substitution Principle: Can be substituted with any IDiscoveryRepository implementation
 */
@Injectable()
export class DiscoveryRepository
  extends BaseProgramsRepository
  implements IDiscoveryRepository
{
  private readonly logger = new Logger(DiscoveryRepository.name);

  /**
   * Full-text search across published programs
   * Discovery-specific operation with search ranking
   */
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

  /**
   * Find published programs by status with sorting and pagination
   * Discovery-specific operation for public content feeds
   */
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

  /**
   * Find related programs based on similarity
   * Discovery-specific operation for content recommendations
   */
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
}
