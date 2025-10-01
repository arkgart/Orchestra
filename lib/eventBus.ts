import { EventEmitter } from 'node:events';
import { StreamEvent } from './types';

const emitter = new EventEmitter();

export function emitSessionEvent(sessionId: string, event: StreamEvent) {
  emitter.emit(sessionId, event);
}

export function subscribeToSession(sessionId: string, handler: (event: StreamEvent) => void) {
  emitter.on(sessionId, handler);
  return () => emitter.off(sessionId, handler);
}
