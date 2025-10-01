"""Implementation agents that generate code variants."""

from __future__ import annotations

import random
from datetime import datetime
from typing import Dict, List

from ..config import Mode, OrchestrationConfig
from ..models import TestResult, VersionGraph, VersionNode
from .base import AgentBase


LANGUAGE_TARGETS = [
    "TypeScript frontend",
    "Python orchestrator",
    "Infrastructure IaC",
    "CI pipeline",
]


class CoderAgent(AgentBase):
    """Produces code implementations for a given architecture."""

    def __init__(self, config: OrchestrationConfig, mode: Mode, variant_index: int) -> None:
        super().__init__(name=f"Coder Variant {variant_index + 1}", config=config, mode=mode)
        self._rng = random.Random(config.seed or 0 + variant_index)
        self.variant_index = variant_index

    def run(self, graph: VersionGraph, context: Dict[str, object]) -> List[VersionNode]:
        architecture_id: str = context.get("architecture_id")
        language_target = LANGUAGE_TARGETS[self.variant_index % len(LANGUAGE_TARGETS)]
        summary = (
            f"Implements {language_target} with focus on quality gates.\n"
            f"- Tests-first scaffolding\n- Streaming updates via SSE\n- Policy guard integration"
        )
        score = 0.72 + self._rng.random() * 0.25
        tests = [
            TestResult(
                name="unit::orchestrator::planner",
                passed=True,
                duration_ms=420 + self._rng.random() * 40,
                logs="Planner tests validated for milestone decomposition.",
                coverage=0.88,
            ),
            TestResult(
                name="property::tournament::score_ordering",
                passed=True,
                duration_ms=390 + self._rng.random() * 50,
                logs="Hypothesis validated score ordering stability.",
            ),
        ]
        node = VersionNode(
            id=context["id_factory"].new_id(prefix="code"),
            parent_id=architecture_id,
            title=f"Implementation Variant {self.variant_index + 1}",
            summary=summary,
            status="running",
            score=round(score, 3),
            cost_usd=4.20,
            createdAt=datetime.utcnow(),
            metrics={
                "test_pass_rate": 0.95,
                "loc": 3200 + self._rng.randint(-200, 200),
                "latency_ms": 280 + self._rng.randint(-30, 30),
            },
            tests=tests,
            variant=self.variant_index + 1,
        )
        return [node]
