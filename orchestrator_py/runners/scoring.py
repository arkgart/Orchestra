"""Scoring utilities for orchestrator variants."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from ..models import VersionGraph, VersionNode


@dataclass
class ScoreBreakdown:
    node_id: str
    total_score: float
    components: dict[str, float]


class ScoreEvaluator:
    """Aggregates metrics into a leaderboard ranking."""

    def evaluate(self, graph: VersionGraph) -> List[ScoreBreakdown]:
        breakdowns: List[ScoreBreakdown] = []
        for node in graph.nodes:
            base = node.score
            coverage = node.metrics.get('coverage', 0.0)
            security = 1.0 - node.metrics.get('semgrep_findings', 0) * 0.1
            performance = max(0.0, 1.0 - node.metrics.get('latency_ms', 500) / 1000)
            total = round(base * 0.5 + coverage * 0.2 + security * 0.2 + performance * 0.1, 4)
            breakdowns.append(
                ScoreBreakdown(
                    node_id=node.id,
                    total_score=total,
                    components={
                        'base': base,
                        'coverage': coverage,
                        'security': security,
                        'performance': performance,
                    },
                )
            )
        breakdowns.sort(key=lambda item: item.total_score, reverse=True)
        return breakdowns
