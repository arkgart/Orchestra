export type OrchestratorMode = 'SAFE' | 'GUARDED' | 'POWER';

export interface AgentMetric {
  name: string;
  value: number;
  unit?: string;
}

export interface VersionScoreVector {
  correctness: number;
  tests: number;
  performance: number;
  memory: number;
  readability: number;
  security: number;
  cost: number;
}

export interface VersionNode {
  id: string;
  parentIds: string[];
  summary: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  score: VersionScoreVector;
  costUsd: number;
  mode: OrchestratorMode;
  createdAt: string;
}

export interface TournamentSnapshot {
  nodes: VersionNode[];
  edges: { id: string; source: string; target: string }[];
  leaderboard: VersionNode[];
  metrics: AgentMetric[];
}

export interface OrchestrateRequest {
  task: string;
  mode: OrchestratorMode;
  variants: number;
  seed?: number;
}

export interface StreamEvent {
  type: 'graph' | 'log' | 'metric' | 'complete' | 'error';
  payload: unknown;
}

export interface RunRequest {
  versionId: string;
  action: 'run' | 'test';
}

export interface PolicyGuardResponse {
  allowed: boolean;
  reason?: string;
}
