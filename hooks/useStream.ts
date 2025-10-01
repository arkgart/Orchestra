import { useEffect } from 'react';
import { connectToStream, OrchestratorEvent } from '@/lib/sse';
import { useOrchestratorStore } from '@/lib/store';

export function useStream(sessionId?: string) {
  const setGraph = useOrchestratorStore((state) => state.setGraph);
  const appendLog = useOrchestratorStore((state) => state.appendLog);
  const setLastEvent = useOrchestratorStore((state) => state.setLastEvent);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const disconnect = connectToStream(
      sessionId,
      (event: OrchestratorEvent) => {
        switch (event.type) {
          case 'graph-update':
            setGraph(event.payload as any);
            break;
          case 'log':
            appendLog(event.payload.versionId, event.payload.content);
            break;
          case 'policy':
            setLastEvent(`Policy decision: ${JSON.stringify(event.payload)}`);
            break;
          case 'metric-update':
            setGraph((prev) => ({
              ...prev,
              nodes: prev.nodes.map((node) =>
                node.id === event.payload.versionId
                  ? { ...node, metrics: { ...node.metrics, ...(event.payload as any).metrics } }
                  : node
              )
            }));
            break;
          default:
            setLastEvent(`Unhandled event: ${event.type}`);
        }
      },
      (error: Event) => {
        setLastEvent(`Stream error: ${JSON.stringify(error)}`);
      }
    );

    return () => {
      disconnect();
    };
  }, [sessionId, appendLog, setGraph, setLastEvent]);
}
