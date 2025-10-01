import { NextRequest } from 'next/server';
import { RunRequest } from '@/lib/types';
import { evaluatePolicy } from '@/lib/policy';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RunRequest;
  const policy = evaluatePolicy({ mode: 'GUARDED', tool: 'modal', costEstimateUsd: 0.25 });
  if (!policy.allowed) {
    return Response.json({ status: 'denied', reason: policy.reason }, { status: 403 });
  }

  return Response.json({
    versionId: body.versionId,
    action: body.action,
    result: 'success',
    logs: ['Executed mock runner', `Version ${body.versionId} ${body.action} completed.`]
  });
}
