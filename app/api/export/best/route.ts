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
    const graphEvents = history.filter((event) => event.type === 'graph-update');
    const lastGraph = graphEvents.length
      ? (graphEvents[graphEvents.length - 1].payload as { nodes: Array<Record<string, unknown>> })
      : { nodes: [] };
    const metricEvents = history.filter((event) => event.type === 'metric-update');
    const scores = new Map<string, number>();
    for (const event of metricEvents) {
      const payload = event.payload as { versionId: string; metrics: Record<string, number> };
      scores.set(payload.versionId, payload.metrics.compositeScore ?? payload.metrics.base ?? 0);
    }
    let bestNode: Record<string, unknown> | undefined;
    let bestScore = -Infinity;
    for (const node of lastGraph.nodes) {
      const score = scores.get(node.id as string) ?? (node.score as number);
      if (score > bestScore) {
        bestScore = score;
        bestNode = node;
      }
    }
    if (!bestNode) {
      return NextResponse.json({ message: 'No versions found' }, { status: 404 });
    }
    const blob = JSON.stringify({
      metadata: {
        sessionId,
        exportedAt: new Date().toISOString(),
        score: bestScore,
      },
      node: bestNode,
    });
    return new Response(blob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${sessionId}-best-version.json"`,
      },
    });
  } catch (error) {
    console.error('Best version export failed', error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
