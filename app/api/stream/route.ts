import { NextRequest } from 'next/server';
import { subscribeToSession } from '@/lib/eventBus';
import { getSession } from '@/lib/sessionStore';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('sessionId required', { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const existing = getSession(sessionId);
      if (existing?.snapshot) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'graph', payload: existing.snapshot })}\n\n`));
      }
      if (existing?.logs.length) {
        existing.logs.forEach((line) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', payload: line })}\n\n`))
        );
      }
      if (existing?.metrics.length) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'metric', payload: existing.metrics })}\n\n`));
      }

      const unsubscribe = subscribeToSession(sessionId, (event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        if (event.type === 'complete' || event.type === 'error') {
          unsubscribe();
          controller.close();
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive'
    }
  });
}
