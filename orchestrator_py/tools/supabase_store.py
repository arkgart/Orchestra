"""Supabase Postgres + storage helper."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass
class SupabaseRecord:
    table: str
    data: Dict[str, Any]


class SupabaseStore:
    def __init__(self, url: str | None, anon_key: str | None) -> None:
        self.url = url
        self.anon_key = anon_key
        self._tables: Dict[str, List[Dict[str, Any]]] = {}

    async def insert(self, record: SupabaseRecord) -> None:
        if not self.url or not self.anon_key:
            raise RuntimeError("Supabase credentials not configured")
        self._tables.setdefault(record.table, []).append(record.data)

    async def list(self, table: str) -> List[Dict[str, Any]]:
        return list(self._tables.get(table, []))
