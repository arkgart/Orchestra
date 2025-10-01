export type OrchestrationMode = 'SAFE' | 'GUARDED' | 'POWER';

export interface VersionNode {
  id: string;
  parentId?: string;
  title: string;
  summary: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  score: number;
  costUsd: number;
  createdAt: string;
  metrics: Record<string, number>;
  tests: VersionTestResult[];
  variant: number;
}

export interface VersionEdge {
  id: string;
  source: string;
  target: string;
}

export interface VersionGraph {
  nodes: VersionNode[];
  edges: VersionEdge[];
}

export interface VersionTestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  logs: string;
  coverage?: number;
}

export interface OrchestrationRequest {
  task: string;
  mode: OrchestrationMode;
  variantCount: number;
  maxDepth: number;
  temperature: number;
  tournamentSize: number;
}

export interface StreamEventBase {
  type: string;
  message?: string;
  payload?: unknown;
}

export interface GraphUpdateEvent extends StreamEventBase {
  type: 'graph-update';
  payload: VersionGraph;
}

export interface LogEvent extends StreamEventBase {
  type: 'log';
  payload: {
    versionId: string;
    content: string;
  };
}

export interface MetricEvent extends StreamEventBase {
  type: 'metric-update';
  payload: {
    versionId: string;
    metrics: Record<string, number>;
  };
}

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  warnings?: string[];
}
