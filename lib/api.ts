import { OrchestrateRequest, RunRequest, StreamEvent } from './types';

export async function startOrchestration(body: OrchestrateRequest) {
  const response = await fetch('/api/orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Failed to start orchestration: ${response.statusText}`);
  }
  return response.json();
}

export function streamSession(sessionId: string, onEvent: (event: StreamEvent) => void) {
  const eventSource = new EventSource(`/api/stream?sessionId=${sessionId}`);
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data) as StreamEvent;
    onEvent(data);
    if (data.type === 'complete' || data.type === 'error') {
      eventSource.close();
    }
  };
  eventSource.onerror = () => {
    eventSource.close();
  };
  return () => eventSource.close();
}

export async function runVersion(body: RunRequest) {
  const response = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`Run failed: ${response.statusText}`);
  }
  return response.json();
}
