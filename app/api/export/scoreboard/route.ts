import { NextResponse } from 'next/server';

import { sessionManager } from '@/lib/server/sessionManager';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ message: 'sessionId is required' }, { status: 400 });
  }
  try {
    const history = sessionManager.getHistory(sessionId);
    const scores: Record<string, number> = {};
    const cost: Record<string, number> = {};
    const status: Record<string, string> = {};

    for (const event of history) {
      if (event.type === 'metric-update') {
        const payload = event.payload as { versionId: string; metrics: Record<string, number> };
        scores[payload.versionId] = payload.metrics.compositeScore ?? payload.metrics.base ?? 0;
      }
      if (event.type === 'graph-update') {
        const payload = event.payload as { nodes: Array<{ id: string; costUsd: number; status: string }> };
        for (const node of payload.nodes) {
          cost[node.id] = node.costUsd;
          status[node.id] = node.status;
        }
      }
    }

    const rows = Object.keys(scores)
      .map((id) => ({ id, score: scores[id], costUsd: cost[id] ?? 0, status: status[id] ?? 'unknown' }))
      .sort((a, b) => b.score - a.score);

    const header = 'version_id,score,cost_usd,status\n';
    const csv = header + rows.map((row) => `${row.id},${row.score.toFixed(3)},${row.costUsd.toFixed(2)},${row.status}`).join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${sessionId}-scoreboard.csv"`,
      },
    });
  } catch (error) {
    console.error('Scoreboard export failed', error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
