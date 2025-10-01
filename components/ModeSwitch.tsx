'use client';

import { useCallback, useState } from 'react';
import { policyCheck } from '@/lib/api';
import { useOrchestratorStore } from '@/lib/store';
import type { OrchestrationMode } from '@/lib/types';
import { toast } from 'sonner';

const modes: { value: OrchestrationMode; description: string }[] = [
  { value: 'SAFE', description: 'Read-mostly, human confirmation for sensitive actions.' },
  { value: 'GUARDED', description: 'Balanced development with guard rails.' },
  { value: 'POWER', description: 'Full autonomy with high concurrency and tool access.' }
];

export function ModeSwitch() {
  const mode = useOrchestratorStore((state) => state.mode);
  const setMode = useOrchestratorStore((state) => state.setMode);
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = useCallback(
    async (newMode: OrchestrationMode) => {
      if (isChecking || newMode === mode) return;
      try {
        setIsChecking(true);
        const result = await policyCheck(newMode);
        if (result.allowed) {
          setMode(newMode);
          if (result.warnings?.length) {
            toast.warning(result.warnings.join('\n'));
          } else {
            toast.success(`Mode switched to ${newMode}.`);
          }
        } else {
          toast.error(result.reason ?? 'Mode switch denied by policy guard.');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to validate mode switch.');
      } finally {
        setIsChecking(false);
      }
    },
    [isChecking, mode, setMode]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Mode</span>
        {isChecking && <span className="text-xs text-muted-foreground">Checking…</span>}
      </div>
      <div className="grid gap-2">
        {modes.map((item) => (
          <button
            key={item.value}
            onClick={() => handleChange(item.value)}
            className={`rounded border px-3 py-2 text-left transition hover:border-primary ${
              item.value === mode ? 'border-primary bg-primary/10' : 'border-border'
            }`}
            disabled={isChecking}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.value}</span>
              {item.value === mode && <span className="text-xs text-primary">Active</span>}
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
