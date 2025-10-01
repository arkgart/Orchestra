import type { OrchestrationRequest, OrchestrationMode, VersionGraph, PolicyCheckResult } from './types';

export interface StartOrchestrationResponse {
  sessionId: string;
  initialGraph: VersionGraph;
}

export async function startOrchestration(body: OrchestrationRequest): Promise<StartOrchestrationResponse> {
  const response = await fetch('/api/orchestrate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to start orchestration: ${errorBody.message ?? response.statusText}`);
  }

  return response.json();
}

export async function runVersion(sessionId: string, versionId: string) {
  const response = await fetch('/api/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId, versionId })
  });

  if (!response.ok) {
    throw new Error('Failed to run version');
  }

  return response.json();
}

export async function forkVersion(
  sessionId: string,
  versionId: string,
  overrides: Partial<OrchestrationRequest>
) {
  const response = await fetch('/api/fork', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId, versionId, overrides })
  });

  if (!response.ok) {
    throw new Error('Failed to fork version');
  }

  return response.json();
}

export async function evaluateVersion(sessionId: string, versionId: string) {
  const response = await fetch('/api/eval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId, versionId })
  });

  if (!response.ok) {
    throw new Error('Failed to evaluate version');
  }

  return response.json();
}

export async function policyCheck(mode: OrchestrationMode): Promise<PolicyCheckResult> {
  const response = await fetch(`/api/policy?mode=${mode}`);
  if (!response.ok) {
    throw new Error('Failed to perform policy check');
  }
  return response.json();
}
