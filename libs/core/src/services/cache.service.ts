import { Injectable } from "@nestjs/common";
import {
  ICacheService,
  CacheStats,
} from "../interfaces/cache.service.interface";
import { CACHE_LIMITS } from "../constants";

export { CacheKeyBuilder } from "./cache-key.builder";

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Single Responsibility: Cache management only
 * Previously embedded in ExternalProvidersService
 */
@Injectable()
export class CacheService implements ICacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = CACHE_LIMITS.DEFAULT_TTL;
  private readonly MAX_CACHE_SIZE = CACHE_LIMITS.MAX_CACHE_SIZE;

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, value: T, ttlMs: number = this.DEFAULT_TTL): void {
    // Simple LRU: remove oldest if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  getStats(): CacheStats {
    return {
      size: this.cache.size,
      ttl: this.DEFAULT_TTL,
    };
  }
}
