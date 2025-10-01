'use client';

import { useState } from 'react';
import { startOrchestration } from '@/lib/api';
import { useOrchestratorStore } from '@/lib/store';
import type { OrchestrationRequest } from '@/lib/types';
import { useStream } from '@/hooks/useStream';
import { toast } from 'sonner';

export function ControlPanel() {
  const [sessionId, setSessionId] = useState<string>();
  const [error, setError] = useState<string>();
  const mode = useOrchestratorStore((state) => state.mode);
  const task = useOrchestratorStore((state) => state.task);
  const setTask = useOrchestratorStore((state) => state.setTask);
  const orchestrationConfig = useOrchestratorStore((state) => state.orchestrationConfig);
  const updateConfig = useOrchestratorStore((state) => state.updateOrchestrationConfig);
  const setGraph = useOrchestratorStore((state) => state.setGraph);
  const setIsRunning = useOrchestratorStore((state) => state.setIsRunning);
  const isRunning = useOrchestratorStore((state) => state.isRunning);

  useStream(sessionId);

  const handleStart = async () => {
    if (!task.trim()) {
      toast.error('Task description is required.');
      return;
    }

    const body: OrchestrationRequest = {
      task,
      mode,
      variantCount: orchestrationConfig.variantCount,
      maxDepth: orchestrationConfig.maxDepth,
      temperature: orchestrationConfig.temperature,
      tournamentSize: orchestrationConfig.tournamentSize
    };

    try {
      setIsRunning(true);
      setError(undefined);
      const response = await startOrchestration(body);
      setSessionId(response.sessionId);
      sessionStorage.setItem('megamind-session', response.sessionId);
      setGraph(response.initialGraph);
      toast.success('Orchestration started.');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold">Task</label>
        <textarea
          className="mt-1 w-full rounded border bg-background p-2 text-sm"
          rows={6}
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="Describe the problem MEGAMIND ULTRA should solve."
        />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <label className="space-y-1">
          <span className="font-medium">Variants</span>
          <input
            type="number"
            min={1}
            max={20}
            value={orchestrationConfig.variantCount}
            onChange={(event) => updateConfig({ variantCount: Number(event.target.value) })}
            className="w-full rounded border bg-background p-2"
          />
        </label>
        <label className="space-y-1">
          <span className="font-medium">Max depth</span>
          <input
            type="number"
            min={1}
            max={20}
            value={orchestrationConfig.maxDepth}
            onChange={(event) => updateConfig({ maxDepth: Number(event.target.value) })}
            className="w-full rounded border bg-background p-2"
          />
        </label>
        <label className="space-y-1">
          <span className="font-medium">Temperature</span>
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={orchestrationConfig.temperature}
            onChange={(event) => updateConfig({ temperature: Number(event.target.value) })}
            className="w-full rounded border bg-background p-2"
          />
        </label>
        <label className="space-y-1">
          <span className="font-medium">Tournament size</span>
          <input
            type="number"
            min={1}
            max={10}
            value={orchestrationConfig.tournamentSize}
            onChange={(event) => updateConfig({ tournamentSize: Number(event.target.value) })}
            className="w-full rounded border bg-background p-2"
          />
        </label>
      </div>
      <button
        className="w-full rounded bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
        onClick={handleStart}
        disabled={isRunning}
      >
        {isRunning ? 'Starting…' : 'Generate Variants'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {sessionId && (
        <p className="text-xs text-muted-foreground">
          Session: <code>{sessionId}</code>
        </p>
      )}
    </div>
  );
}
