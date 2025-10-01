'use client';

import { useMemo } from 'react';
import { useOrchestratorStore } from '@/lib/store';

export function Leaderboard() {
  const graph = useOrchestratorStore((state) => state.graph);

  const rows = useMemo(
    () =>
      [...graph.nodes]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((node) => ({
          id: node.id,
          title: node.title,
          score: node.score,
          status: node.status,
          costUsd: node.costUsd
        })),
    [graph.nodes]
  );

  if (!rows.length) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        Leaderboard will populate once variants are generated.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Leaderboard (Top 10)</h3>
      </div>
      <div className="divide-y text-sm">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between px-4 py-2">
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-muted-foreground">{row.status}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Score {row.score.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Cost ${row.costUsd.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
