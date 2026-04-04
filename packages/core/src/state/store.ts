/**
 * Global state management for SDK
 */

export type StateListener<T> = (state: T, prevState: T) => void;
export type StateSelector<T, R> = (state: T) => R;

export interface StoreOptions<T> {
  initialState: T;
  persist?: boolean;
  storageKey?: string;
}

export class Store<T extends Record<string, any>> {
  private state: T;
  private listeners = new Set<StateListener<T>>();
  private options: StoreOptions<T>;

  constructor(options: StoreOptions<T>) {
    this.options = options;
    this.state = options.initialState;
  }

  getState(): T {
    return { ...this.state };
  }

  setState(partial: Partial<T> | ((state: T) => Partial<T>)): void {
    const prevState = this.state;
    const updates = typeof partial === 'function' ? partial(prevState) : partial;
    this.state = { ...prevState, ...updates };
    this.listeners.forEach(listener => listener(this.state, prevState));
  }

  subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  select<R>(selector: StateSelector<T, R>): R {
    return selector(this.state);
  }

  reset(): void {
    this.setState(this.options.initialState);
  }
}

export interface SDKState {
  initialized: boolean;
  network: 'mainnet' | 'testnet';
  connectedAddress: string | null;
  proposals: any[];
  loading: boolean;
  error: string | null;
}

const defaultSDKState: SDKState = {
  initialized: false,
  network: 'mainnet',
  connectedAddress: null,
  proposals: [],
  loading: false,
  error: null,
};

const globalStore = new Store<SDKState>({ initialState: defaultSDKState });

export function getStore(): Store<SDKState> { return globalStore; }
export function createStore<T extends Record<string, any>>(options: StoreOptions<T>): Store<T> {
  return new Store(options);
}
export { globalStore };
