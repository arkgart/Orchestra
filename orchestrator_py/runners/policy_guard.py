"""Runtime policy enforcement for SAFE/GUARDED/POWER modes."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

from ..config import Mode


SAFE_DENIED_TOOLS = {"browserless", "playwright", "snowflake", "bigquery"}
GUARDED_WARN_TOOLS = {"modal:python", "browserless"}


@dataclass
class PolicyDecision:
    allowed: bool
    reason: str | None = None
    warnings: List[str] | None = None


class PolicyGuard:
    """Enforces operational policies based on the orchestrator mode."""

    def __init__(self) -> None:
        self._mode_tool_matrix: Dict[Mode, Tuple[set[str], set[str]]] = {
            Mode.SAFE: (SAFE_DENIED_TOOLS, set()),
            Mode.GUARDED: (set(), GUARDED_WARN_TOOLS),
            Mode.POWER: (set(), set()),
        }

    def evaluate(self, mode: Mode, requested_tools: List[str]) -> PolicyDecision:
        denied, warned = self._mode_tool_matrix.get(mode, (set(), set()))
        denied_tools = sorted(tool for tool in requested_tools if tool in denied)
        if denied_tools:
            return PolicyDecision(
                allowed=False,
                reason=f"Denied by policy guard: {', '.join(denied_tools)}",
            )
        warnings = sorted(tool for tool in requested_tools if tool in warned)
        return PolicyDecision(allowed=True, warnings=[f"Use of {tool} monitored" for tool in warnings])
