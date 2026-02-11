import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
  Inject,
  SerializeOptions,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ICmsOperations, PAGINATION } from "@app/core";
import {
  CmsUpdateProgramDto,
  SearchExternalDto,
  ImportProgramDto,
} from "@app/cms";

/**
 * CMS Controller: Handles admin operations only
 * Depends on abstraction (ICmsOperations) not concrete service
 * Single Responsibility: CMS write operations
 * Protected by ThrottlerGuard: 1000 requests per 60 seconds per IP
 */
@UseGuards(ThrottlerGuard)
@SerializeOptions({
  groups: ["admin"],
})
@Controller("admin/programs")
export class CmsController {
  constructor(
    @Inject("ICmsOperations") private readonly cmsOperations: ICmsOperations,
  ) {}

  /**
   * Health check endpoint for monitoring and load balancing
   */
  @Get("health")
  checkHealth() {
    return {
      status: "ok",
      service: "cms",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Post("integrations/search")
  async searchExternal(@Body() searchDto: SearchExternalDto) {
    return this.cmsOperations.searchExternal(
      searchDto.provider,
      searchDto.q,
      searchDto.limit || 10,
    );
  }

  @Post("import")
  @HttpCode(HttpStatus.CREATED)
  async importProgram(@Body() importDto: ImportProgramDto) {
    return this.cmsOperations.importProgram(
      importDto.provider,
      importDto.externalId,
    );
  }

  @Get()
  async listDrafts(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("status") status: string = "DRAFT",
  ) {
    // Validate pagination
    if (page < PAGINATION.MIN_PAGE) {
      throw new BadRequestException(
        `Page must be at least ${PAGINATION.MIN_PAGE}`,
      );
    }
    return this.cmsOperations.listDrafts(page, PAGINATION.DEFAULT_PAGE_SIZE);
  }

  @Get(":id")
  async getEditorView(@Param("id") id: string) {
    const program = await this.cmsOperations.getEditorView(id);
    if (!program) throw new NotFoundException("Program not found");
    return program;
  }

  @Patch(":id")
  async updateProgram(
    @Param("id") id: string,
    @Body() updateDto: CmsUpdateProgramDto,
  ) {
    return this.cmsOperations.updateProgram(id, updateDto);
  }

  @Put(":id/publish")
  async publishProgram(@Param("id") id: string) {
    return this.cmsOperations.publishProgram(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async archiveProgram(@Param("id") id: string) {
    return this.cmsOperations.archiveProgram(id);
  }
}
