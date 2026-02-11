import { Injectable, NotFoundException } from "@nestjs/common";
import { IsNull } from "typeorm";
import { Program } from "../entities/program.entity";
import { ICmsRepository } from "../interfaces/programs.repository.interface";
import { ProgramStatus } from "../enums/program.enums";
import { BaseProgramsRepository } from "./base-programs.repository";

/**
 * CmsRepository
 * Implements write operations for CMS (Content Management System)
 * Single Responsibility: CMS data operations only
 * Liskov Substitution Principle: Can be substituted with any ICmsRepository implementation
 */
@Injectable()
export class CmsRepository
  extends BaseProgramsRepository
  implements ICmsRepository
{
  /**
   * Find draft programs with pagination
   * CMS-specific operation for managing unpublished content
   */
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

  /**
   * Create a new program instance (not persisted yet)
   * CMS write operation
   */
  create(program: Partial<Program>): Program {
    return this.typeOrmRepository.create(program);
  }

  /**
   * Save program to database (insert or update)
   * CMS write operation
   */
  async save(program: Program): Promise<Program> {
    return this.typeOrmRepository.save(program);
  }

  /**
   * Soft delete a program (marks as deleted without removing from DB)
   * CMS write operation
   */
  async softDelete(id: string): Promise<void> {
    const program = await this.findById(id);
    if (!program) {
      throw new NotFoundException("Program not found");
    }
    program.deleted_at = new Date();
    await this.typeOrmRepository.save(program);
  }
}
