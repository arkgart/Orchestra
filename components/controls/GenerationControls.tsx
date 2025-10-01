'use client';

import { useState } from 'react';
import { startOrchestration } from '@/lib/api';
import { OrchestrateRequest, OrchestratorMode } from '@/lib/types';
import toast from 'react-hot-toast';

interface Props {
  mode: OrchestratorMode;
  onSessionStart: (sessionId: string) => void;
}

export function GenerationControls({ mode, onSessionStart }: Props) {
  const [task, setTask] = useState('Design a scalable REST API with caching.');
  const [variants, setVariants] = useState(5);
  const [seed, setSeed] = useState<number | undefined>(42);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    try {
      setLoading(true);
      const body: OrchestrateRequest = { task, mode, variants, seed };
      const { sessionId } = await startOrchestration(body);
      toast.success('Orchestration started');
      onSessionStart(sessionId);
    } catch (error) {
      console.error(error);
      toast.error('Failed to start orchestration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div>
        <label className="block text-sm font-medium text-slate-200">Task</label>
        <textarea
          value={task}
          onChange={(event) => setTask(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-sm text-slate-200 focus:border-primary focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <label className="flex flex-col">
          Variants
          <input
            type="number"
            min={1}
            max={25}
            value={variants}
            onChange={(event) => setVariants(Number(event.target.value))}
            className="mt-1 rounded-md border border-slate-800 bg-slate-950 p-2 text-slate-200"
          />
        </label>
        <label className="flex flex-col">
          Seed (optional)
          <input
            type="number"
            value={seed ?? ''}
            onChange={(event) => setSeed(event.target.value ? Number(event.target.value) : undefined)}
            className="mt-1 rounded-md border border-slate-800 bg-slate-950 p-2 text-slate-200"
          />
        </label>
        <div className="flex items-end">
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Starting…' : 'Generate Variants'}
          </button>
        </div>
      </div>
    </div>
  );
}
