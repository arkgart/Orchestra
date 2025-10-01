"""Base classes for orchestrator agents."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Protocol

from ..config import Mode, OrchestrationConfig
from ..models import VersionGraph, VersionNode


class Agent(Protocol):
    """Protocol representing an agent that can act on the orchestration graph."""

    name: str

    def run(self, graph: VersionGraph, context: Dict[str, object]) -> List[VersionNode]:
        """Perform the agent's work and return newly created nodes."""


@dataclass
class AgentBase:
    """Concrete base class for agents with helper utilities."""

    name: str
    config: OrchestrationConfig
    mode: Mode
    tags: List[str] = field(default_factory=list)

    def log_header(self) -> str:
        return f"[{self.name}]"
