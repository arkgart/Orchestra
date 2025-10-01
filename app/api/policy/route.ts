import { NextResponse } from 'next/server';

import { evaluatePolicy } from '@/lib/policy';
import type { OrchestrationMode } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') as OrchestrationMode | null;
  if (!mode) {
    return NextResponse.json({ message: 'mode is required' }, { status: 400 });
  }

  const decision = evaluatePolicy(mode, [
    'openai:gpt-5-codex',
    'modal:python',
    'browserless',
  ]);

  return NextResponse.json(decision);
}
