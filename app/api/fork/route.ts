import { NextResponse } from 'next/server';

import { sessionManager } from '@/lib/server/sessionManager';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, versionId, overrides } = body as {
      sessionId?: string;
      versionId?: string;
      overrides?: Record<string, unknown>;
    };
    if (!sessionId || !versionId) {
      return NextResponse.json({ message: 'sessionId and versionId are required' }, { status: 400 });
    }
    sessionManager.emit(sessionId, {
      type: 'log',
      payload: {
        versionId,
        content: `Fork requested with overrides: ${JSON.stringify(overrides ?? {})}`,
      },
    });
    return NextResponse.json({ status: 'forked' });
  } catch (error) {
    console.error('Fork endpoint error', error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
