import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface UseCachedFetchOptions {
  cacheTime?: number; // Time in milliseconds to keep the cache valid
  dedupingInterval?: number; // Minimum time between actual API calls
  disableCache?: boolean; // Option to bypass cache
}

interface CachedFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: number | null;
}

const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_DEDUPING_INTERVAL = 10 * 1000; // 10 seconds

// In-memory cache store
const cacheStore: Record<string, CacheItem<any>> = {};

/**
 * A custom hook for data fetching with caching to reduce API calls
 * @param fetchFn - The function to fetch data (returns a promise)
 * @param deps - Dependency array that determines when to refetch
 * @param options - Caching options
 */
function useCachedFetch<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseCachedFetchOptions = {}
): [CachedFetchState<T>, () => Promise<T>] {
  const {
    cacheTime = DEFAULT_CACHE_TIME,
    dedupingInterval = DEFAULT_DEDUPING_INTERVAL,
    disableCache = false,
  } = options;

  // Generate a cache key based on the function and dependencies
  const cacheKey = useRef(
    `cachedFetch_${fetchFn.toString()}_${JSON.stringify(deps)}`
  ).current;

  // State to track fetch status
  const [state, setState] = useState<CachedFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // Reference to track last fetch time
  const lastFetchTime = useRef<number>(0);

  // Function to perform the fetch
  const doFetch = useCallback(async (): Promise<T> => {
    const now = Date.now();
    
    // Check if we should dedupe this request (if it was called very recently)
    if (now - lastFetchTime.current < dedupingInterval) {
      // If we have data, return it without fetching again
      if (state.data) {
        return state.data;
      }
    }

    // Update the fetch timestamp
    lastFetchTime.current = now;
    
    // Check if we have a valid cached value
    const cached = cacheStore[cacheKey];
    if (
      !disableCache &&
      cached &&
      now - cached.timestamp < cacheTime
    ) {
      // Use cached data if available and not expired
      setState({
        data: cached.data,
        isLoading: false,
        error: null,
        lastUpdated: cached.timestamp,
      });
      return cached.data;
    }

    // Otherwise, fetch fresh data
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const data = await fetchFn();
      
      // Update cache
      if (!disableCache) {
        cacheStore[cacheKey] = {
          data,
          timestamp: Date.now(),
          key: cacheKey,
        };
      }
      
      setState({
        data,
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
      });
      
      return data;
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
        lastUpdated: null,
      });
      throw error;
    }
  }, [fetchFn, cacheKey, cacheTime, dedupingInterval, disableCache, state.data]);

  // Run the fetch when dependencies change
  useEffect(() => {
    doFetch().catch(error => {
      console.error('Error in useCachedFetch:', error);
    });
  }, [...deps, disableCache]);

  return [state, doFetch];
}

/**
 * Clear all data in the cache
 */
export function clearCache(): void {
  Object.keys(cacheStore).forEach(key => {
    delete cacheStore[key];
  });
}

/**
 * Clear a specific item from the cache
 * @param key - The cache key to clear
 */
export function clearCacheItem(key: string): void {
  if (cacheStore[key]) {
    delete cacheStore[key];
  }
}

/**
 * Get statistics about the current cache
 */
export function getCacheStats() {
  const keys = Object.keys(cacheStore);
  const size = keys.length;
  const items = keys.map(key => ({
    key,
    age: Date.now() - cacheStore[key].timestamp
  }));
  
  return {
    size,
    items,
    totalAgeMs: items.reduce((sum, item) => sum + item.age, 0),
    averageAgeMs: size > 0 ? items.reduce((sum, item) => sum + item.age, 0) / size : 0
  };
}

export default useCachedFetch; 