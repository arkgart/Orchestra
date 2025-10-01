"""Upstash Redis cache adapter."""

from __future__ import annotations

from typing import Any, Dict


class RedisCache:
    def __init__(self, url: str | None, token: str | None) -> None:
        self.url = url
        self.token = token
        self._store: Dict[str, Any] = {}

    async def get(self, key: str) -> Any:
        return self._store.get(key)

    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        if not self.url or not self.token:
            raise RuntimeError("Redis credentials not configured")
        self._store[key] = value
