
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live in milliseconds
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache entry has expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Cleanup expired entries periodically
  startCleanup(intervalMinutes: number = 10): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        const age = now - entry.timestamp;
        if (age > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export const cache = new InMemoryCache();

// Start automatic cleanup every 10 minutes
cache.startCleanup(10);

// Cache key builders
export const CacheKeys = {
  expertAnalysis: (handle: string) => `expert:analysis:${handle.toLowerCase()}`,
  expertContact: (handle: string) => `expert:contact:${handle.toLowerCase()}`,
  instagramProfile: (handle: string) => `instagram:profile:${handle.toLowerCase()}`,
};

// Cache TTL configurations (in minutes)
export const CacheTTL = {
  EXPERT_ANALYSIS: 1440, // 24 hours
  EXPERT_CONTACT: 1440, // 24 hours
  INSTAGRAM_PROFILE: 360, // 6 hours
};
