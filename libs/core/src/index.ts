// Core Module
export * from "./core.module";

// Entities & DTOs
export * from "./entities/program.entity";
export * from "./dto/program.dto";
export * from "./enums/program.enums";

// Constants
export * from "./constants";

// Query Builders
export * from "./query-builders";

// Interfaces (SOLID compliant - segregated)
export * from "./interfaces";

// Repositories (SOLID compliant - Separated by responsibility)
export * from "./repositories/base-programs.repository";
export * from "./repositories/cms.repository";
export * from "./repositories/discovery.repository";
export * from "./repositories/programs.repository"; // Backward compatibility

// Services (SOLID compliant)
export * from "./services/cache.service";
export * from "./services/external-provider.service.new";

// Utilities
export * from "./utils/slug-generator.util";

// Providers (Strategy Pattern)
export * from "./providers";
