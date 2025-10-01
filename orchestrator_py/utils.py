"""Utility helpers for orchestrator."""

from __future__ import annotations

import itertools
from dataclasses import dataclass
from typing import Iterator


@dataclass
class IdFactory:
    """Generates deterministic identifiers for nodes and edges."""

    prefix: str
    counter: Iterator[int]

    @classmethod
    def with_prefix(cls, prefix: str) -> 'IdFactory':
        return cls(prefix=prefix, counter=iter(itertools.count(1)))

    def new_id(self, prefix: str | None = None) -> str:
        base = prefix or self.prefix
        value = next(self.counter)
        return f"{base}-{value}"
