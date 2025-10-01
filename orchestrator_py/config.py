"""Configuration utilities for the orchestrator."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict


class Mode(str, Enum):
    SAFE = "SAFE"
    GUARDED = "GUARDED"
    POWER = "POWER"


@dataclass
class Settings:
    openai_api_key: str | None
    supabase_url: str | None
    supabase_key: str | None
    pinecone_api_key: str | None
    wolfram_app_id: str | None
    modal_token: str | None
    browserless_token: str | None
    redis_url: str | None
    langfuse_public_key: str | None
    langfuse_secret_key: str | None

    @classmethod
    def from_env(cls) -> "Settings":
        import os

        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            supabase_url=os.getenv("SUPABASE_URL"),
            supabase_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
            pinecone_api_key=os.getenv("PINECONE_API_KEY"),
            wolfram_app_id=os.getenv("WOLFRAM_APP_ID"),
            modal_token=os.getenv("MODAL_TOKEN"),
            browserless_token=os.getenv("BROWSERLESS_TOKEN"),
            redis_url=os.getenv("UPSTASH_REDIS_URL"),
            langfuse_public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            langfuse_secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        )


@dataclass
class OrchestrateSpec:
    task: str
    mode: Mode
    variants: int
    seed: int | None
    session_id: str

    @classmethod
    def from_request(cls, payload: Dict[str, Any], session_id: str) -> "OrchestrateSpec":
        return cls(
            task=payload["task"],
            mode=Mode(payload["mode"]),
            variants=int(payload["variants"]),
            seed=(int(payload["seed"]) if payload.get("seed") is not None else None),
            session_id=session_id,
        )
