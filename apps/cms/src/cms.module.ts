import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CmsModule as CmsLibModule } from "@app/cms";
import { Program } from "@app/core";
import { CmsController } from "./cms.controller";

/**
 * CMS Module: Handles admin write operations
 * Imports CoreModule which provides all dependencies via DI
 * Depends on abstractions (ICmsOperations) for SOLID compliance
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 1000, // 1000 requests per 60 seconds (higher for internal admin use)
      },
    ]),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "6432"),
      username: process.env.DB_USER || "thamanya",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "thamanya_db",
      entities: [Program],
      synchronize: false,
      logging: process.env.DB_LOGGING === "true",
    }),
    TypeOrmModule.forFeature([Program]),
    CmsLibModule,
  ],
  controllers: [CmsController],
})
export class CmsModule {}
