import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import readline from 'readline';

import type { OrchestrationRequest, VersionGraph } from '@/lib/types';

interface SessionEvent {
  type: string;
  payload?: unknown;
  message?: string;
}

interface OrchestratorSession {
  id: string;
  process: ChildProcessWithoutNullStreams;
  emitter: EventEmitter;
  history: SessionEvent[];
  initialGraph?: VersionGraph;
  policyDenied?: boolean;
}

class SessionManager {
  private sessions = new Map<string, OrchestratorSession>();

  async startSession(request: OrchestrationRequest): Promise<{ sessionId: string; initialGraph: VersionGraph }> {
    const sessionId = randomUUID();
    const emitter = new EventEmitter();
    const pythonPath = process.env.ORCHESTRATOR_PYTHON || 'python';
    const payload = {
      task: request.task,
      mode: request.mode,
      variantCount: request.variantCount,
      maxDepth: request.maxDepth,
      temperature: request.temperature,
      tournamentSize: request.tournamentSize,
      seed: Math.floor(Date.now() % 10000),
      requestedTools: request.mode === 'POWER'
        ? ['openai:gpt-5-codex', 'modal:python', 'browserless']
        : ['openai:gpt-5-codex', 'modal:python'],
    };

    const processEnv = { ...process.env, ORCHESTRATION_REQUEST: JSON.stringify(payload) };

    const child = spawn(pythonPath, ['-m', 'orchestrator_py.session_runner'], {
      env: processEnv,
      cwd: process.cwd(),
    });

    const session: OrchestratorSession = {
      id: sessionId,
      process: child,
      emitter,
      history: [],
    };

    this.sessions.set(sessionId, session);

    const rl = readline.createInterface({ input: child.stdout });

    child.stderr?.on('data', (chunk: Buffer) => {
      const message = chunk.toString();
      emitter.emit('event', { type: 'log', payload: { versionId: 'system', content: message } });
      session.history.push({ type: 'log', payload: { versionId: 'system', content: message } });
    });

    child.on('exit', () => {
      emitter.emit('close');
      rl.close();
    });

    let initialGraph: VersionGraph | undefined;

    rl.on('line', (line) => {
      try {
        const event = JSON.parse(line) as SessionEvent;
        if (event.type === 'graph-update') {
          session.initialGraph = event.payload as VersionGraph;
          if (!initialGraph) {
            initialGraph = session.initialGraph;
          }
        }
        if (event.type === 'policy' && event.payload && typeof event.payload === 'object') {
          const payloadObj = event.payload as { allowed: boolean; reason?: string };
          if (!payloadObj.allowed) {
            session.policyDenied = true;
          }
        }
        session.history.push(event);
        emitter.emit('event', event);
      } catch (error) {
        console.error('Failed to parse orchestrator event', error, line);
      }
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timed out waiting for initial graph'));
      }, 5000);
      const checkInitial = () => {
        if (session.policyDenied) {
          clearTimeout(timeout);
          reject(new Error('Policy guard denied orchestration'));
          return;
        }
        if (session.initialGraph) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkInitial, 50);
        }
      };
      checkInitial();
    });

    if (!session.initialGraph) {
      throw new Error('Failed to obtain initial graph');
    }

    return { sessionId, initialGraph: session.initialGraph };
  }

  subscribe(sessionId: string, listener: (event: SessionEvent) => void): () => void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    const handler = (event: SessionEvent) => listener(event);
    session.emitter.on('event', handler);
    return () => session.emitter.off('event', handler);
  }

  emit(sessionId: string, event: SessionEvent) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    session.history.push(event);
    session.emitter.emit('event', event);
  }

  getHistory(sessionId: string): SessionEvent[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session.history;
  }
}

export const sessionManager = new SessionManager();
