"""Pinecone vector store integration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class VectorRecord:
    id: str
    values: List[float]
    metadata: dict


class PineconeStore:
    def __init__(self, api_key: str | None, environment: str | None, index_name: str) -> None:
        self.api_key = api_key
        self.environment = environment
        self.index_name = index_name
        self._records: dict[str, VectorRecord] = {}

    async def upsert(self, record: VectorRecord) -> None:
        if not self.api_key:
            raise RuntimeError("Pinecone API key missing")
        self._records[record.id] = record

    async def query(self, vector: List[float], top_k: int = 5) -> List[Tuple[str, float]]:
        if not self.api_key:
            raise RuntimeError("Pinecone API key missing")
        # Simple cosine similarity placeholder
        results: List[Tuple[str, float]] = []
        for record in self._records.values():
            score = sum(a * b for a, b in zip(vector, record.values))
            results.append((record.id, score))
        return sorted(results, key=lambda item: item[1], reverse=True)[:top_k]
