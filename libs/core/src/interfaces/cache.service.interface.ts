/**
 * Interface Segregation: CacheService contract
 * Separates cache concerns from business logic
 */
export interface ICacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlMs?: number): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
  getStats(): CacheStats;
}

export interface CacheStats {
  size: number;
  ttl: number;
}
