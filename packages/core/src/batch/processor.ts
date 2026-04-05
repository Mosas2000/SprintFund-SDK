/**
 * Batch operations for efficient bulk processing
 */

export interface BatchOperation<T, R> {
  id: string;
  data: T;
  execute: (data: T) => Promise<R>;
}

export interface BatchResult<R> {
  id: string;
  success: boolean;
  result?: R;
  error?: Error;
}

export interface BatchOptions {
  concurrency?: number;
  stopOnError?: boolean;
  retryFailed?: boolean;
  maxRetries?: number;
}

export class BatchProcessor<T, R> {
  private options: Required<BatchOptions>;

  constructor(options: BatchOptions = {}) {
    this.options = {
      concurrency: options.concurrency ?? 5,
      stopOnError: options.stopOnError ?? false,
      retryFailed: options.retryFailed ?? true,
      maxRetries: options.maxRetries ?? 2,
    };
  }

  async process(operations: BatchOperation<T, R>[]): Promise<BatchResult<R>[]> {
    const results: BatchResult<R>[] = [];
    const queue = [...operations];

    while (queue.length > 0) {
      const batch = queue.splice(0, this.options.concurrency);
      const batchResults = await Promise.all(
        batch.map(op => this.executeOne(op))
      );

      for (const result of batchResults) {
        results.push(result);
        if (!result.success && this.options.stopOnError) {
          return results;
        }
      }
    }

    return results;
  }

  private async executeOne(operation: BatchOperation<T, R>): Promise<BatchResult<R>> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        const result = await operation.execute(operation.data);
        return { id: operation.id, success: true, result };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (!this.options.retryFailed || attempt === this.options.maxRetries) break;
        await this.delay(Math.pow(2, attempt) * 100);
      }
    }

    return { id: operation.id, success: false, error: lastError };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createBatchProcessor<T, R>(options?: BatchOptions): BatchProcessor<T, R> {
  return new BatchProcessor(options);
}

// Convenience functions
export async function batchFetch<T>(
  urls: string[],
  fetcher: (url: string) => Promise<T>,
  options?: BatchOptions
): Promise<BatchResult<T>[]> {
  const processor = new BatchProcessor<string, T>(options);
  const operations = urls.map((url, i) => ({
    id: `fetch-${i}`,
    data: url,
    execute: fetcher,
  }));
  return processor.process(operations);
}

export async function batchExecute<T, R>(
  items: T[],
  executor: (item: T) => Promise<R>,
  options?: BatchOptions
): Promise<BatchResult<R>[]> {
  const processor = new BatchProcessor<T, R>(options);
  const operations = items.map((item, i) => ({
    id: `exec-${i}`,
    data: item,
    execute: executor,
  }));
  return processor.process(operations);
}
