import { NextResponse } from 'next/server';

import { sessionManager } from '@/lib/server/sessionManager';
import type { OrchestrationRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrchestrationRequest;
    if (!body.task) {
      return NextResponse.json({ message: 'Task is required' }, { status: 400 });
    }
    const result = await sessionManager.startSession(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to start session', error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
