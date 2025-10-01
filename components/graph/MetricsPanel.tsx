'use client';

import { AgentMetric } from '@/lib/types';

interface Props {
  metrics: AgentMetric[];
}

export function MetricsPanel({ metrics }: Props) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="text-lg font-semibold text-slate-100">Live Metrics</h3>
      <p className="text-sm text-slate-400">Instrumentation feed from Langfuse traces and evaluators.</p>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {metrics.map((metric) => (
          <div key={metric.name} className="rounded-md border border-slate-800 bg-slate-950/80 p-3">
            <dt className="text-xs uppercase tracking-wide text-slate-400">{metric.name}</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-100">
              {metric.value.toFixed(2)} {metric.unit ?? ''}
            </dd>
          </div>
        ))}
        {metrics.length === 0 && <p className="text-sm text-slate-400">Awaiting metrics…</p>}
      </dl>
    </div>
  );
}
