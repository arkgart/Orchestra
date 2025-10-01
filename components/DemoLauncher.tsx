'use client';

import { useOrchestratorStore } from '@/lib/store';
import demos from '@/data/demos.json';

export function DemoLauncher() {
  const setTask = useOrchestratorStore((state) => state.setTask);

  return (
    <div className="rounded-lg border bg-background">
      <div className="border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Demo Flows</h3>
        <p className="text-xs text-muted-foreground">
          Load curated prompts covering web apps, debugging, analytics, physics, and PR flows.
        </p>
      </div>
      <div className="divide-y text-sm">
        {demos.map((demo) => (
          <button
            key={demo.id}
            className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-muted"
            onClick={() => setTask(demo.prompt)}
          >
            <span className="font-medium">{demo.title}</span>
            <span className="text-xs text-muted-foreground">{demo.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
