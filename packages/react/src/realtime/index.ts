/**
 * @sf-protocol/react - Real-time Module
 */

export {
  EventEmitter,
  createEventEmitter,
  globalEventEmitter
} from './event-emitter';
export type { EventConfig, RealtimeConfig } from './event-emitter';

export {
  WebSocketManager,
  createWebSocketManager
} from './websocket';
export type { ConnectionState, WebSocketManagerConfig } from './websocket';
