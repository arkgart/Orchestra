import { TournamentSnapshot } from './types';

type SessionData = {
  snapshot: TournamentSnapshot | null;
  logs: string[];
  metrics: { name: string; value: number; unit?: string }[];
  status: 'pending' | 'complete' | 'error';
  errorMessage?: string;
};

const sessions = new Map<string, SessionData>();

export function createSession(sessionId: string) {
  sessions.set(sessionId, {
    snapshot: null,
    logs: [],
    metrics: [],
    status: 'pending'
  });
}

export function updateSession(sessionId: string, patch: Partial<SessionData>) {
  const session = sessions.get(sessionId);
  if (!session) return;
  sessions.set(sessionId, { ...session, ...patch });
}

export function appendLog(sessionId: string, line: string) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.logs.push(line);
}

export function setSnapshot(sessionId: string, snapshot: TournamentSnapshot) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.snapshot = snapshot;
}

export function setMetrics(sessionId: string, metrics: { name: string; value: number; unit?: string }[]) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.metrics = metrics;
}

export function getSession(sessionId: string) {
  return sessions.get(sessionId);
}
