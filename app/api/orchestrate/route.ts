import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { createSession, setMetrics, setSnapshot, appendLog, updateSession } from '@/lib/sessionStore';
import { emitSessionEvent } from '@/lib/eventBus';
import { OrchestrateRequest, StreamEvent, TournamentSnapshot } from '@/lib/types';
import { evaluatePolicy } from '@/lib/policy';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OrchestrateRequest;
  const sessionId = randomUUID();

  const policyCheck = evaluatePolicy({ mode: body.mode, tool: 'openai', costEstimateUsd: body.variants * 0.5 });
  if (!policyCheck.allowed) {
    return new Response(JSON.stringify({ error: policyCheck.reason }), { status: 403 });
  }

  createSession(sessionId);

  const scriptPath = path.join(process.cwd(), 'orchestrator_py', 'runner_entry.py');
  const python = spawn('python', [scriptPath], {
    env: { ...process.env, SESSION_ID: sessionId },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  python.stdin.write(JSON.stringify(body));
  python.stdin.end();

  python.stdout.on('data', (chunk: Buffer) => {
    const lines = chunk.toString().split('\n').filter(Boolean);
    lines.forEach((line) => {
      try {
        const event = JSON.parse(line) as StreamEvent;
        if (event.type === 'graph') {
          const snapshot = event.payload as TournamentSnapshot;
          setSnapshot(sessionId, snapshot);
        }
        if (event.type === 'metric') {
          setMetrics(sessionId, event.payload as { name: string; value: number; unit?: string }[]);
        }
        if (event.type === 'log') {
          appendLog(sessionId, String(event.payload));
        }
        if (event.type === 'complete') {
          updateSession(sessionId, { status: 'complete' });
        }
        emitSessionEvent(sessionId, event);
      } catch (error) {
        console.error('Failed to parse orchestrator event', error);
      }
    });
  });

  python.stderr.on('data', (chunk: Buffer) => {
    const message = chunk.toString();
    appendLog(sessionId, message);
    const event: StreamEvent = { type: 'log', payload: message };
    emitSessionEvent(sessionId, event);
  });

  python.on('exit', (code) => {
    if (code !== 0) {
      const message = `Orchestrator exited with code ${code}`;
      updateSession(sessionId, { status: 'error', errorMessage: message });
      const event: StreamEvent = { type: 'error', payload: message };
      emitSessionEvent(sessionId, event);
    }
  });

  return Response.json({ sessionId });
}
