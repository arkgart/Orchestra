'use client';

import { VersionNode } from '@/lib/types';

interface Props {
  leaderboard: VersionNode[];
}

export function Leaderboard({ leaderboard }: Props) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="text-lg font-semibold text-slate-100">Leaderboard</h3>
      <p className="text-sm text-slate-400">Top candidates ranked by evaluator composite score.</p>
      <div className="mt-4 space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-semibold text-slate-100">
                {index + 1}. {entry.summary}
              </p>
              <p className="text-xs text-slate-400">Correctness: {entry.score.correctness.toFixed(2)} · Cost: ${entry.costUsd.toFixed(2)}</p>
            </div>
            <span
              className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase text-slate-300"
              title={`Status: ${entry.status}`}
            >
              {entry.status}
            </span>
          </div>
        ))}
        {leaderboard.length === 0 && (
          <p className="text-sm text-slate-400">No results yet. Launch a tournament to populate the leaderboard.</p>
        )}
      </div>
    </div>
  );
}
