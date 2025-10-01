"""Core orchestration loop for MEGAMIND ULTRA."""

from __future__ import annotations

import json
import random
import time
from dataclasses import dataclass
from typing import Iterable, List

from .config import Mode, OrchestrateSpec, Settings
from .evaluation.scoring import ScoreVector
from .util.events import EventEmitter


@dataclass
class VersionCandidate:
    identifier: str
    parent_ids: List[str]
    summary: str
    score: ScoreVector
    cost_usd: float
    status: str


class TournamentOrchestrator:
    def __init__(self, spec: OrchestrateSpec, settings: Settings) -> None:
        self.spec = spec
        self.settings = settings
        self.emitter = EventEmitter(session_id=spec.session_id)
        self.random = random.Random(spec.seed)

    def run(self) -> None:
        self.emitter.emit_log(f"Bootstrapping tournament for task: {self.spec.task}")
        population = self._initial_population()
        self._emit_graph(population)
        self._emit_metrics(population)

        for iteration in range(1, min(5, self.spec.variants) + 1):
            time.sleep(0.2)
            self.emitter.emit_log(f"Iteration {iteration}: evaluating candidates")
            population = self._mutate(population)
            self._emit_graph(population)
            self._emit_metrics(population)

        self.emitter.emit_log("Tournament complete")
        self.emitter.emit_complete()

    def _initial_population(self) -> List[VersionCandidate]:
        candidates: List[VersionCandidate] = []
        for index in range(self.spec.variants):
            candidate = VersionCandidate(
                identifier=f"v{index+1}",
                parent_ids=[],
                summary=f"Variant {index+1}: baseline design",
                score=ScoreVector.random(self.random),
                cost_usd=round(self.random.uniform(0.5, 5.0), 2),
                status="pending",
            )
            candidates.append(candidate)
        return candidates

    def _mutate(self, population: List[VersionCandidate]) -> List[VersionCandidate]:
        for candidate in population:
            delta = self.random.uniform(-0.2, 0.4)
            candidate.score.correctness = min(1.0, max(0.0, candidate.score.correctness + delta))
            candidate.score.performance = min(1.0, max(0.0, candidate.score.performance + delta / 2))
            candidate.cost_usd = round(max(0.1, candidate.cost_usd * (1 + self.random.uniform(-0.1, 0.1))), 2)
            candidate.status = "passed" if candidate.score.correctness > 0.7 else "running"
        population.sort(key=lambda c: c.score.composite, reverse=True)
        return population

    def _emit_graph(self, population: Iterable[VersionCandidate]) -> None:
        nodes = []
        edges = []
        for candidate in population:
            nodes.append(
                {
                    "id": candidate.identifier,
                    "parentIds": candidate.parent_ids,
                    "summary": candidate.summary,
                    "status": candidate.status,
                    "score": candidate.score.to_dict(),
                    "costUsd": candidate.cost_usd,
                    "mode": self.spec.mode.value,
                    "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                }
            )
            for parent_id in candidate.parent_ids:
                edges.append({
                    "id": f"{parent_id}->{candidate.identifier}",
                    "source": parent_id,
                    "target": candidate.identifier,
                })
        leaderboard = sorted(nodes, key=lambda node: node["score"]["correctness"], reverse=True)[:5]
        snapshot = {
            "nodes": nodes,
            "edges": edges,
            "leaderboard": leaderboard,
            "metrics": self._summary_metrics(population),
        }
        self.emitter.emit_graph(snapshot)

    def _emit_metrics(self, population: Iterable[VersionCandidate]) -> None:
        metrics = self._summary_metrics(population)
        self.emitter.emit_metrics(metrics)

    def _summary_metrics(self, population: Iterable[VersionCandidate]):
        population = list(population)
        if not population:
            return []
        avg_correctness = sum(candidate.score.correctness for candidate in population) / len(population)
        avg_cost = sum(candidate.cost_usd for candidate in population) / len(population)
        return [
            {"name": "avg_correctness", "value": avg_correctness},
            {"name": "avg_cost", "value": avg_cost, "unit": "USD"},
            {"name": "population", "value": float(len(population))},
        ]


def run_from_payload(payload: str, session_id: str) -> None:
    data = json.loads(payload)
    settings = Settings.from_env()
    spec = OrchestrateSpec.from_request(data, session_id=session_id)
    orchestrator = TournamentOrchestrator(spec=spec, settings=settings)
    orchestrator.run()
