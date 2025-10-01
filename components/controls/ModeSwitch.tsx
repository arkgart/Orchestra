'use client';

import { OrchestratorMode } from '@/lib/types';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import clsx from 'clsx';

interface Props {
  mode: OrchestratorMode;
  onChange: (mode: OrchestratorMode) => void;
}

const options: OrchestratorMode[] = ['SAFE', 'GUARDED', 'POWER'];

export function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-200">Mode</p>
      <ToggleGroup.Root
        type="single"
        value={mode}
        onValueChange={(value) => value && onChange(value as OrchestratorMode)}
        className="inline-flex rounded-md border border-slate-700 bg-slate-900"
      >
        {options.map((option) => (
          <ToggleGroup.Item
            key={option}
            value={option}
            className={clsx(
              'px-4 py-2 text-sm font-semibold transition-colors data-[state=on]:bg-primary data-[state=on]:text-white',
              'data-[state=off]:text-slate-300'
            )}
          >
            {option}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className="mt-2 text-xs text-slate-400">
        SAFE = read-only, GUARDED = moderated, POWER = full autonomy.
      </p>
    </div>
  );
}
