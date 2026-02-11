import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { DiscoveryModule as DiscoveryLibModule } from "@app/discovery";
import { Program } from "@app/core";
import { DiscoveryController } from "./discovery.controller";

/**
 * Discovery Module: Handles public read operations
 * Imports CoreModule which provides all dependencies via DI
 * Depends on abstractions (IDiscoveryOperations) for SOLID compliance
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600000, // 1 hour in milliseconds
      max: 100, // Maximum number of items in cache
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per 60 seconds per IP
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
    DiscoveryLibModule,
  ],
  controllers: [DiscoveryController],
})
export class DiscoveryModule {}
