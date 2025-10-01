import { NextResponse } from 'next/server';

import { sessionManager } from '@/lib/server/sessionManager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, versionId } = body as { sessionId?: string; versionId?: string };
    if (!sessionId || !versionId) {
      return NextResponse.json({ message: 'sessionId and versionId are required' }, { status: 400 });
    }
    sessionManager.emit(sessionId, {
      type: 'log',
      payload: { versionId, content: 'Execution triggered from UI.' },
    });
    sessionManager.emit(sessionId, {
      type: 'metric-update',
      payload: { versionId, metrics: { runCount: Math.random() * 5 } },
    });
    return NextResponse.json({ status: 'queued' });
  } catch (error) {
    console.error('Run endpoint error', error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
