import type { GraphUpdateEvent, LogEvent, MetricEvent } from './types';

export type OrchestratorEvent = GraphUpdateEvent | LogEvent | MetricEvent;

export function connectToStream(
  sessionId: string,
  onEvent: (event: OrchestratorEvent) => void,
  onError: (error: Event) => void
) {
  const url = `/api/stream?sessionId=${sessionId}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as OrchestratorEvent;
      onEvent(data);
    } catch (err) {
      console.error('Failed to parse stream event', err);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE error', error);
    onError(error);
  };

  return () => eventSource.close();
}
