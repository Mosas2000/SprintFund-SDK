/**
 * React hooks for batch operations
 */

import { useState, useCallback } from 'react';
import { BatchProcessor, BatchResult, BatchOptions } from '@sf-protocol/core';

export function useBatch<T, R>(options?: BatchOptions) {
  const [results, setResults] = useState<BatchResult<R>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      items: T[],
      executor: (item: T) => Promise<R>
    ): Promise<BatchResult<R>[]> => {
      setLoading(true);
      setError(null);

      try {
        const processor = new BatchProcessor<T, R>(options);
        const operations = items.map((item, i) => ({
          id: `batch-${i}`,
          data: item,
          execute: executor,
        }));

        const batchResults = await processor.process(operations);
        setResults(batchResults);
        return batchResults;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  return {
    execute,
    results,
    loading,
    error,
    reset,
    successCount,
    failureCount,
  };
}

export function useQuery<T extends Record<string, any>>(data: T[]) {
  const [filtered, setFiltered] = useState<T[]>(data);

  const filter = useCallback(
    (predicate: (item: T) => boolean) => {
      setFiltered(data.filter(predicate));
    },
    [data]
  );

  const sort = useCallback(
    (field: keyof T, direction: 'asc' | 'desc' = 'asc') => {
      const sorted = [...filtered].sort((a, b) => {
        const cmp = a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
        return direction === 'asc' ? cmp : -cmp;
      });
      setFiltered(sorted);
    },
    [filtered]
  );

  const reset = useCallback(() => {
    setFiltered(data);
  }, [data]);

  return { data: filtered, filter, sort, reset };
}
