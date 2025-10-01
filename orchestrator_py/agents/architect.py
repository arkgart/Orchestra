"""Solution architect agents that propose designs."""

from __future__ import annotations

import random
from datetime import datetime
from typing import Dict, List

from ..config import Mode, OrchestrationConfig
from ..models import VersionGraph, VersionNode
from .base import AgentBase


ARCHITECT_STRATEGIES = [
    "Modal-first compute + Pinecone memory",
    "Edge orchestration with Supabase streaming",
    "GPU-accelerated tournament on Modal",
    "Hybrid offline/online evaluation",
]


class ArchitectAgent(AgentBase):
    """Produces alternative solution architectures."""

    def __init__(self, config: OrchestrationConfig, mode: Mode, strategy_seed: int) -> None:
        super().__init__(
            name=f"Architect #{strategy_seed + 1}", config=config, mode=mode, tags=["architecture"]
        )
        self._rng = random.Random(strategy_seed)

    def run(self, graph: VersionGraph, context: Dict[str, object]) -> List[VersionNode]:
        plan_node_id: str = context.get("plan_node_id")
        strategy = self._rng.choice(ARCHITECT_STRATEGIES)
        score = 0.65 + self._rng.random() * 0.2
        node = VersionNode(
            id=context["id_factory"].new_id(prefix="arch"),
            parent_id=plan_node_id,
            title=f"Architecture: {strategy.split()[0]}",
            summary=(
                f"Strategy: {strategy}.\n"
                f"Key components:\n"
                f"- Orchestrator in Python with async event fabric\n"
                f"- Next.js UI with React Flow graphs\n"
                f"- Tournament search with {self.config.variant_count} variants"
            ),
            status="succeeded",
            score=round(score, 3),
            cost_usd=2.40,
            createdAt=datetime.utcnow(),
            metrics={"design_risk": self._rng.uniform(0.1, 0.3), "latency_budget_ms": 400},
            tests=[],
            variant=self._rng.randint(1, 3),
        )
        return [node]
