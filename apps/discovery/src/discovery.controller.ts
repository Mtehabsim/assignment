import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
  Inject,
  Logger,
  Header,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { IDiscoveryOperations, PAGINATION } from "@app/core";

/**
 * Discovery Controller: Handles public read operations only
 * Depends on abstraction (IDiscoveryOperations) not concrete service
 * Single Responsibility: Discovery read operations
 * Protected by ThrottlerGuard: 100 requests per 60 seconds per IP
 */
@UseGuards(ThrottlerGuard)
@Controller("programs")
export class DiscoveryController {
  private readonly logger = new Logger(DiscoveryController.name);

  constructor(
    @Inject("IDiscoveryOperations")
    private readonly discoveryOperations: IDiscoveryOperations,
  ) {}

  /**
   * Health check endpoint for monitoring and load balancing
   */
  @Get("health")
  checkHealth() {
    return {
      status: "ok",
      service: "discovery",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get("search")
  @Header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  async search(
    @Query("q") query: string,
    @Query("lang") lang: string = "ar-SA",
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    // Validate pagination limits
    if (limit > PAGINATION.MAX_PAGE_SIZE) {
      throw new BadRequestException(
        `Limit cannot exceed ${PAGINATION.MAX_PAGE_SIZE}`,
      );
    }
    if (limit < PAGINATION.MIN_PAGE_SIZE) {
      throw new BadRequestException(
        `Limit must be at least ${PAGINATION.MIN_PAGE_SIZE}`,
      );
    }
    return this.discoveryOperations.search(query, lang as any, limit, offset);
  }

  @Get()
  @Header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  async findHomeFeed(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("sort") sort: string = "newest",
    @Query("lang") lang: string = "ar-SA",
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    // Validate pagination limits
    if (limit > PAGINATION.MAX_PAGE_SIZE) {
      throw new BadRequestException(
        `Limit cannot exceed ${PAGINATION.MAX_PAGE_SIZE}`,
      );
    }
    if (limit < PAGINATION.MIN_PAGE_SIZE) {
      throw new BadRequestException(
        `Limit must be at least ${PAGINATION.MIN_PAGE_SIZE}`,
      );
    }
    if (page < PAGINATION.MIN_PAGE) {
      throw new BadRequestException(
        `Page must be at least ${PAGINATION.MIN_PAGE}`,
      );
    }
    return this.discoveryOperations.findHomeFeed(
      page,
      sort,
      lang as any,
      limit,
    );
  }

  @Get("filters")
  @Header("Cache-Control", "public, max-age=3600, stale-while-revalidate=7200")
  async getFilters(@Query("lang") lang: string = "ar-SA") {
    return this.discoveryOperations.getFilters(lang as any);
  }

  @Get(":id/related")
  @Header("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
  async getRelated(
    @Param("id") id: string,
    @Query("limit", new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    // Validate pagination limits
    if (limit > PAGINATION.MAX_RELATED_LIMIT) {
      throw new BadRequestException(
        `Limit cannot exceed ${PAGINATION.MAX_RELATED_LIMIT}`,
      );
    }
    if (limit < PAGINATION.MIN_PAGE_SIZE) {
      throw new BadRequestException(
        `Limit must be at least ${PAGINATION.MIN_PAGE_SIZE}`,
      );
    }
    const programs = await this.discoveryOperations.getRelated(id, limit);
    return { data: programs, total: programs.length };
  }

  @Get(":id")
  @Header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  async findById(@Param("id") id: string) {
    const program = await this.discoveryOperations.findById(id);
    if (!program) {
      throw new NotFoundException("Program not found");
    }

    return program;
  }
}
