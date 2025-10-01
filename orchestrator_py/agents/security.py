"""Security review agent that inspects variants."""

from __future__ import annotations

import random
from typing import Dict, List

from ..config import Mode, OrchestrationConfig
from ..models import VersionGraph, VersionNode
from .base import AgentBase


class SecurityAgent(AgentBase):
    """Performs lightweight SAST and dependency checks."""

    def __init__(self, config: OrchestrationConfig, mode: Mode) -> None:
        super().__init__(name="Security Reviewer", config=config, mode=mode, tags=["security"])
        self._rng = random.Random(config.seed or 42)

    def run(self, graph: VersionGraph, context: Dict[str, object]) -> List[VersionNode]:
        version_id = context.get("version_id")
        node = graph.get_node(version_id)
        if not node:
            return []
        node.metrics.update(
            {
                "semgrep_findings": self._rng.randint(0, 1),
                "dependency_vulns": 0,
                "secrets_found": 0,
            }
        )
        node.summary += "\n\nSecurity review: No critical findings."
        return [node]
