import type { OrchestrationMode } from '@/lib/types';

type PolicyDecision = {
  allowed: boolean;
  reason?: string;
  warnings?: string[];
};

const SAFE_DENIED = new Set(['browserless', 'playwright', 'snowflake', 'bigquery']);
const GUARDED_WARN = new Set(['modal:python', 'browserless']);

export function evaluatePolicy(mode: OrchestrationMode, tools: string[]): PolicyDecision {
  if (mode === 'SAFE') {
    const denied = tools.filter((tool) => SAFE_DENIED.has(tool));
    if (denied.length) {
      return { allowed: false, reason: `Denied in SAFE mode: ${denied.join(', ')}` };
    }
  }
  if (mode === 'GUARDED') {
    const warnings = tools.filter((tool) => GUARDED_WARN.has(tool));
    if (warnings.length) {
      return {
        allowed: true,
        warnings: warnings.map((tool) => `Use of ${tool} monitored under Guarded mode.`),
      };
    }
  }
  return { allowed: true };
}
