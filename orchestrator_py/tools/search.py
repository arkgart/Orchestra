"""External search adapter using Bing or Google CSE."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str


class SearchClient:
    def __init__(self, api_key: str | None, endpoint: str | None = None) -> None:
        self.api_key = api_key
        self.endpoint = endpoint

    async def search(self, query: str, *, count: int = 5) -> List[SearchResult]:
        if not self.api_key:
            raise RuntimeError("Search API key is not configured")
        return [
            SearchResult(
                title=f"Stub result for {query}",
                url="https://example.com",
                snippet="Replace with live web search when configured.",
            )
        ][:count]
