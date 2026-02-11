import { SelectQueryBuilder } from "typeorm";
import { Program } from "../entities/program.entity";
import { Language, ProgramStatus } from "../enums/program.enums";

/**
 * ProgramQueryBuilder
 * Extracts business logic (sorting, filtering, pagination) from repository layer
 * Single Responsibility: Query building strategies
 */
export class ProgramQueryBuilder {
  /**
   * Apply sorting strategy to query builder
   * @param query - TypeORM SelectQueryBuilder
   * @param sort - Sort option (newest, oldest, views, duration)
   * @returns Modified query builder
   */
  static applySorting(
    query: SelectQueryBuilder<Program>,
    sort: string,
  ): SelectQueryBuilder<Program> {
    switch (sort) {
      case "newest":
        return query.orderBy("p.published_at", "DESC");
      case "oldest":
        return query.orderBy("p.published_at", "ASC");
      case "views":
        return query.orderBy("p.view_count", "DESC");
      case "duration":
        return query.orderBy("p.duration_seconds", "DESC");
      default:
        return query.orderBy("p.published_at", "DESC");
    }
  }

  /**
   * Apply pagination to query builder
   * @param query - TypeORM SelectQueryBuilder
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Modified query builder
   */
  static applyPagination(
    query: SelectQueryBuilder<Program>,
    page: number,
    limit: number,
  ): SelectQueryBuilder<Program> {
    const skip = (page - 1) * limit;
    return query.take(limit).skip(skip);
  }

  /**
   * Apply base filters for published programs
   * @param query - TypeORM SelectQueryBuilder
   * @param lang - Language filter
   * @param status - Program status filter
   * @returns Modified query builder
   */
  static applyPublishedFilters(
    query: SelectQueryBuilder<Program>,
    lang: Language,
    status: ProgramStatus = ProgramStatus.PUBLISHED,
  ): SelectQueryBuilder<Program> {
    return query
      .where("p.status = :status", { status })
      .andWhere("p.deleted_at IS NULL")
      .andWhere("p.language = :lang", { lang });
  }

  /**
   * Apply full-text search with ranking
   * @param query - TypeORM SelectQueryBuilder
   * @param searchQuery - Search term
   * @param lang - Language for search
   * @returns Modified query builder
   */
  static applyFullTextSearch(
    query: SelectQueryBuilder<Program>,
    searchQuery: string,
    lang: Language,
  ): SelectQueryBuilder<Program> {
    return query
      .where("p.search_vector @@ plainto_tsquery('arabic', :query)", {
        query: searchQuery,
      })
      .andWhere("p.status = :status", { status: ProgramStatus.PUBLISHED })
      .andWhere("p.deleted_at IS NULL")
      .andWhere("p.language = :lang", { lang })
      .orderBy(
        "ts_rank(p.search_vector, plainto_tsquery('arabic', :query))",
        "DESC",
      )
      .addOrderBy("p.published_at", "DESC");
  }

  /**
   * Apply related programs query
   * @param query - TypeORM SelectQueryBuilder
   * @param currentId - Current program ID to exclude
   * @param title - Title for similarity matching
   * @param lang - Language filter
   * @returns Modified query builder
   */
  static applyRelatedQuery(
    query: SelectQueryBuilder<Program>,
    currentId: string,
    title: string,
    lang: Language,
  ): SelectQueryBuilder<Program> {
    return query
      .where("p.status = :status", { status: ProgramStatus.PUBLISHED })
      .andWhere("p.deleted_at IS NULL")
      .andWhere("p.id != :id", { id: currentId })
      .andWhere("p.language = :lang", { lang })
      .orderBy(`similarity(p.title, :title)`, "DESC")
      .setParameter("title", title);
  }
}
