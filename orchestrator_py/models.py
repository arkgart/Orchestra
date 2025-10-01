"""Core data models used across the orchestrator."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional


@dataclass
class TestResult:
    """Represents a single test execution outcome."""

    name: str
    passed: bool
    duration_ms: float
    logs: str
    coverage: Optional[float] = None

    def to_dict(self) -> Dict[str, object]:
        return {
            "name": self.name,
            "passed": self.passed,
            "durationMs": self.duration_ms,
            "logs": self.logs,
            "coverage": self.coverage,
        }


@dataclass
class VersionNode:
    """Represents a version of the solution within the exploration graph."""

    id: str
    parent_id: Optional[str]
    title: str
    summary: str
    status: str
    score: float
    cost_usd: float
    createdAt: datetime
    metrics: Dict[str, float] = field(default_factory=dict)
    tests: List[TestResult] = field(default_factory=list)
    variant: int = 0

    def to_dict(self) -> Dict[str, object]:
        return {
            "id": self.id,
            "parentId": self.parent_id,
            "title": self.title,
            "summary": self.summary,
            "status": self.status,
            "score": self.score,
            "costUsd": self.cost_usd,
            "createdAt": self.createdAt.isoformat(),
            "metrics": self.metrics,
            "tests": [test.to_dict() for test in self.tests],
            "variant": self.variant,
        }


@dataclass
class VersionEdge:
    """Directed edge between versions."""

    id: str
    source: str
    target: str

    def to_dict(self) -> Dict[str, str]:
        return {"id": self.id, "source": self.source, "target": self.target}


@dataclass
class VersionGraph:
    """Graph of explored versions."""

    nodes: List[VersionNode] = field(default_factory=list)
    edges: List[VersionEdge] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return {
            "nodes": [node.to_dict() for node in self.nodes],
            "edges": [edge.to_dict() for edge in self.edges],
        }

    def add_node(self, node: VersionNode) -> None:
        self.nodes.append(node)

    def add_edge(self, edge: VersionEdge) -> None:
        self.edges.append(edge)

    def get_node(self, node_id: str) -> Optional[VersionNode]:
        for node in self.nodes:
            if node.id == node_id:
                return node
        return None
