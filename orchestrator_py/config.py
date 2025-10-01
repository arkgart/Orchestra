"""Configuration models for the orchestrator."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class Mode(str, Enum):
    """Execution policy modes."""

    SAFE = "SAFE"
    GUARDED = "GUARDED"
    POWER = "POWER"


@dataclass
class OrchestrationConfig:
    """User-provided orchestration parameters."""

    task: str
    mode: Mode
    variant_count: int = 5
    max_depth: int = 5
    temperature: float = 0.6
    tournament_size: int = 4
    seed: Optional[int] = None


@dataclass
class EnvironmentConfig:
    """Configuration for external services and credentials."""

    openai_api_key: Optional[str] = None
    modal_token: Optional[str] = None
    wolfram_app_id: Optional[str] = None
    pinecone_api_key: Optional[str] = None
    pinecone_environment: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    supabase_service_role: Optional[str] = None
    browserless_token: Optional[str] = None
    redis_url: Optional[str] = None
    redis_token: Optional[str] = None
    snowflake_account: Optional[str] = None
    bigquery_project: Optional[str] = None
    langfuse_host: Optional[str] = None
    langfuse_public_key: Optional[str] = None
    langfuse_secret_key: Optional[str] = None
    snyk_token: Optional[str] = None
    semgrep_token: Optional[str] = None
    upstash_redis_rest_url: Optional[str] = None
    upstash_redis_rest_token: Optional[str] = None
    additional: Dict[str, str] = field(default_factory=dict)


DEFAULT_TOOLS: List[str] = [
    "openai:gpt-5-codex",
    "modal:python",
    "wolfram",
    "pinecone",
    "supabase",
    "redis",
    "browserless",
]
