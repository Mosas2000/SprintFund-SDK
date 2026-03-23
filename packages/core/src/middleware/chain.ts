/**
 * Middleware system for request/response interception
 */

export type MiddlewareHandler<Req = any, Res = any> = (
  context: MiddlewareContext<Req, Res>,
  next: () => Promise<void>
) => Promise<void>;

export interface MiddlewareContext<Req = any, Res = any> {
  request: Req;
  response?: Res;
  error?: Error;
  metadata: Record<string, any>;
  phase: 'before' | 'after' | 'error';
}

export class MiddlewareChain<Req = any, Res = any> {
  private middlewares: MiddlewareHandler<Req, Res>[] = [];

  use(middleware: MiddlewareHandler<Req, Res>): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(context: MiddlewareContext<Req, Res>): Promise<MiddlewareContext<Req, Res>> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(context, next);
      }
    };

    try {
      context.phase = 'before';
      await next();
      context.phase = 'after';
    } catch (error) {
      context.phase = 'error';
      context.error = error instanceof Error ? error : new Error(String(error));
      throw error;
    }

    return context;
  }
}

// Built-in middlewares
export function createLoggingMiddleware<Req, Res>(
  logger: { log: (msg: string) => void }
): MiddlewareHandler<Req, Res> {
  return async (context, next) => {
    logger.log(`[${context.phase}] Request: ${JSON.stringify(context.request)}`);
    await next();
    if (context.response) {
      logger.log(`[${context.phase}] Response: ${JSON.stringify(context.response)}`);
    }
  };
}

export function createTimingMiddleware<Req, Res>(): MiddlewareHandler<Req, Res> {
  return async (context, next) => {
    if (context.phase === 'before') {
      context.metadata.startTime = Date.now();
    }
    await next();
    if (context.phase === 'after') {
      context.metadata.duration = Date.now() - context.metadata.startTime;
    }
  };
}

export function createValidationMiddleware<Req extends Record<string, any>, Res>(
  validator: (req: Req) => boolean
): MiddlewareHandler<Req, Res> {
  return async (context, next) => {
    if (context.phase === 'before' && !validator(context.request)) {
      throw new Error('Validation failed');
    }
    await next();
  };
}

export function createRetryMiddleware<Req, Res>(
  maxRetries: number = 3
): MiddlewareHandler<Req, Res> {
  return async (context, next) => {
    let lastError: Error | undefined;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await next();
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
        }
      }
    }
    throw lastError;
  };
}

export function createCacheMiddleware<Req extends { cacheKey?: string }, Res>(
  cache: Map<string, Res>
): MiddlewareHandler<Req, Res> {
  return async (context, next) => {
    const key = context.request.cacheKey;
    if (!key) {
      await next();
      return;
    }

    if (cache.has(key)) {
      context.response = cache.get(key);
      context.metadata.cacheHit = true;
      return;
    }

    await next();
    if (context.response) {
      cache.set(key, context.response);
    }
  };
}

export function createErrorHandlingMiddleware<Req, Res>(
  handler: (error: Error) => void
): MiddlewareHandler<Req, Res> {
  return async (context, next) => {
    try {
      await next();
    } catch (error) {
      handler(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };
}

export function createMiddlewareChain<Req, Res>(): MiddlewareChain<Req, Res> {
  return new MiddlewareChain<Req, Res>();
}
