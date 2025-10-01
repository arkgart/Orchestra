import { NextResponse } from 'next/server';

import { sessionManager } from '@/lib/server/sessionManager';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ message: 'sessionId is required' }, { status: 400 });
  }

  try {
    const stream = new ReadableStream({
      start(controller) {
        const send = (event: unknown) => {
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
        };
        for (const event of sessionManager.getHistory(sessionId)) {
          send(event);
        }
        const unsubscribe = sessionManager.subscribe(sessionId, send);
        controller.enqueue('event: ready\n\n');
        controller.oncancel = () => {
          unsubscribe();
        };
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Failed to create stream', error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
