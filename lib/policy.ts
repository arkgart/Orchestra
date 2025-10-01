import { OrchestratorMode, PolicyGuardResponse } from './types';

interface GuardOptions {
  mode: OrchestratorMode;
  tool: string;
  costEstimateUsd?: number;
}

const SAFE_DENY = new Set(['browserless', 'playwright', 'modal', 'snowflake', 'bigquery']);
const GUARDED_LIMITED = new Map<string, number>([
  ['modal', 5],
  ['playwright', 3],
  ['browserless', 3]
]);

export function evaluatePolicy({ mode, tool, costEstimateUsd }: GuardOptions): PolicyGuardResponse {
  if (mode === 'SAFE') {
    if (SAFE_DENY.has(tool)) {
      return { allowed: false, reason: `Tool ${tool} is not permitted in SAFE mode.` };
    }
    if (costEstimateUsd && costEstimateUsd > 1) {
      return {
        allowed: false,
        reason: `Cost estimate $${costEstimateUsd.toFixed(2)} exceeds SAFE mode budget.`
      };
    }
    return { allowed: true };
  }

  if (mode === 'GUARDED') {
    if (costEstimateUsd && costEstimateUsd > 25) {
      return {
        allowed: false,
        reason: `Cost estimate $${costEstimateUsd.toFixed(2)} requires POWER mode.`
      };
    }
    if (GUARDED_LIMITED.has(tool)) {
      const limit = GUARDED_LIMITED.get(tool)!;
      return { allowed: true, reason: `Max concurrency ${limit} enforced.` };
    }
    return { allowed: true };
  }

  return { allowed: true };
}
