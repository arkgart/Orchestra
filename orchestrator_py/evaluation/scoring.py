"""Scoring utilities for tournament candidates."""

from __future__ import annotations

from dataclasses import dataclass
from random import Random


@dataclass
class ScoreVector:
    correctness: float
    tests: float
    performance: float
    memory: float
    readability: float
    security: float
    cost: float

    @property
    def composite(self) -> float:
        return (
            self.correctness * 0.4
            + self.tests * 0.15
            + self.performance * 0.15
            + self.memory * 0.1
            + self.readability * 0.1
            + self.security * 0.1
            - self.cost * 0.05
        )

    def to_dict(self) -> dict[str, float]:
        return {
            "correctness": self.correctness,
            "tests": self.tests,
            "performance": self.performance,
            "memory": self.memory,
            "readability": self.readability,
            "security": self.security,
            "cost": self.cost,
        }

    @classmethod
    def random(cls, rng: Random) -> "ScoreVector":
        return cls(
            correctness=rng.uniform(0.2, 0.8),
            tests=rng.uniform(0.2, 0.9),
            performance=rng.uniform(0.2, 0.9),
            memory=rng.uniform(0.2, 0.9),
            readability=rng.uniform(0.2, 0.9),
            security=rng.uniform(0.2, 0.9),
            cost=rng.uniform(0.2, 0.9),
        )
