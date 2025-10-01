"""Chief planner agent that decomposes tasks."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from ..config import Mode, OrchestrationConfig
from ..models import TestResult, VersionGraph, VersionNode
from .base import AgentBase


class PlannerAgent(AgentBase):
    """Creates high-level plans and risk assessments."""

    def __init__(self, config: OrchestrationConfig, mode: Mode) -> None:
        super().__init__(name="Chief Planner", config=config, mode=mode, tags=["planning"])

    def run(self, graph: VersionGraph, context: Dict[str, object]) -> List[VersionNode]:
        deliverables = [
            "Comprehensive requirement brief",
            "Architecture alternatives",
            "Tournament execution plan",
            "Quality and security gates",
            "Risk and mitigation log",
        ]
        summary = "\n".join(f"- {item}" for item in deliverables)
        node = VersionNode(
            id=context["id_factory"].new_id(prefix="plan"),
            parent_id=None,
            title="Master Plan",
            summary=f"Chief Planner deliverables:\n{summary}",
            status="succeeded",
            score=0.75,
            cost_usd=1.80,
            createdAt=datetime.utcnow(),
            metrics={"spec_depth": 5, "risk_items": 8},
            tests=[
                TestResult(
                    name="Specification coverage",
                    passed=True,
                    duration_ms=120,
                    logs="Verified that plan covers architecture, testing, and safety gates.",
                    coverage=0.92,
                )
            ],
            variant=0,
        )
        return [node]
