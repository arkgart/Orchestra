'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useMemo } from 'react';
import { useOrchestratorStore } from '@/lib/store';

export function VersionMetrics() {
  const activeVersion = useOrchestratorStore((state) => state.activeVersion);

  const data = useMemo(() => {
    if (!activeVersion) return [];
    return Object.entries(activeVersion.metrics ?? {}).map(([name, value]) => ({
      name,
      value
    }));
  }, [activeVersion]);

  if (!activeVersion) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        Select a node in the graph to view metrics.
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        No metrics collected yet. Trigger tests or evaluations to populate this section.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background p-4">
      <h3 className="text-sm font-semibold">Metrics</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} dy={10} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip wrapperClassName="text-xs" />
            <Bar dataKey="value" fill="#6366f1" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
