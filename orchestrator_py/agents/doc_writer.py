"""Documentation writer agent."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from ..config import Mode, OrchestrationConfig
from ..models import VersionGraph, VersionNode
from .base import AgentBase


class DocumentationAgent(AgentBase):
    """Produces README and diagrams."""

    def __init__(self, config: OrchestrationConfig, mode: Mode) -> None:
        super().__init__(name="Doc Writer", config=config, mode=mode, tags=["docs"])

    def run(self, graph: VersionGraph, context: Dict[str, object]) -> List[VersionNode]:
        parent_id = context.get("version_id")
        node = VersionNode(
            id=context["id_factory"].new_id(prefix="docs"),
            parent_id=parent_id,
            title="Documentation Suite",
            summary=(
                "Generated README, API docs, and architecture diagrams.\n"
                "Highlights environment setup, policy guard, and tournament evaluation pipeline."
            ),
            status="succeeded",
            score=0.81,
            cost_usd=1.10,
            createdAt=datetime.utcnow(),
            metrics={"doc_completeness": 0.95},
            tests=[],
            variant=0,
        )
        return [node]
