"""Tournament runner orchestrating multi-agent exploration."""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Dict, List

from ..config import Mode, OrchestrationConfig
from ..models import VersionEdge, VersionGraph, VersionNode
from ..utils import IdFactory
from ..agents.architect import ArchitectAgent
from ..agents.coder import CoderAgent
from ..agents.doc_writer import DocumentationAgent
from ..agents.planner import PlannerAgent
from ..agents.security import SecurityAgent
from ..agents.tester import TesterAgent


@dataclass
class TournamentResult:
    graph: VersionGraph
    events: List[Dict[str, object]]


class TournamentRunner:
    """Coordinates agents to produce tournament variants."""

    def __init__(self, config: OrchestrationConfig, mode: Mode) -> None:
        self.config = config
        self.mode = mode
        self.id_factory = IdFactory.with_prefix('node')
        self._rng = random.Random(config.seed or 1234)

    def run(self) -> TournamentResult:
        graph = VersionGraph()
        events: List[Dict[str, object]] = []

        planner = PlannerAgent(self.config, self.mode)
        plan_nodes = planner.run(graph, {'id_factory': self.id_factory})
        for node in plan_nodes:
            graph.add_node(node)
            events.append(self._log(node.id, f'Planner produced {node.title}'))
        events.append(self._graph_event(graph))

        plan_node_id = plan_nodes[0].id if plan_nodes else None
        architect_agents = [
            ArchitectAgent(self.config, self.mode, strategy_seed=i)
            for i in range(min(3, self.config.variant_count))
        ]
        architecture_nodes: List[VersionNode] = []
        for agent in architect_agents:
            nodes = agent.run(graph, {'id_factory': self.id_factory, 'plan_node_id': plan_node_id})
            for node in nodes:
                graph.add_node(node)
                if plan_node_id:
                    graph.add_edge(self._edge(plan_node_id, node.id))
                architecture_nodes.append(node)
                events.append(self._log(node.id, f'Architect strategy: {node.title}'))
            events.append(self._graph_event(graph))

        coder_agents = [
            CoderAgent(self.config, self.mode, variant_index=i)
            for i in range(self.config.variant_count)
        ]
        tester = TesterAgent(self.config, self.mode)
        security = SecurityAgent(self.config, self.mode)
        docs = DocumentationAgent(self.config, self.mode)

        for agent in coder_agents:
            architecture = self._rng.choice(architecture_nodes) if architecture_nodes else None
            context = {
                'id_factory': self.id_factory,
                'architecture_id': architecture.id if architecture else None,
            }
            nodes = agent.run(graph, context)
            for node in nodes:
                graph.add_node(node)
                if architecture:
                    graph.add_edge(self._edge(architecture.id, node.id))
                events.append(self._log(node.id, f'Coder variant {node.variant} executing tests'))
                tester.run(graph, {'version_id': node.id})
                security.run(graph, {'version_id': node.id})
                doc_nodes = docs.run(graph, {'version_id': node.id})
                for doc_node in doc_nodes:
                    graph.add_node(doc_node)
                    graph.add_edge(self._edge(node.id, doc_node.id))
                    events.append(self._log(doc_node.id, 'Documentation emitted.'))
            events.append(self._graph_event(graph))

        return TournamentResult(graph=graph, events=events)

    def _log(self, version_id: str, message: str) -> Dict[str, object]:
        return {'type': 'log', 'payload': {'versionId': version_id, 'content': message}}

    def _graph_event(self, graph: VersionGraph) -> Dict[str, object]:
        return {'type': 'graph-update', 'payload': graph.to_dict()}

    def _edge(self, source: str, target: str) -> VersionEdge:
        return VersionEdge(id=self.id_factory.new_id(prefix='edge'), source=source, target=target)
