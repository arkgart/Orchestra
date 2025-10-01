"""Session runner entry point for MEGAMIND ULTRA."""

from __future__ import annotations

import json
import os
import sys
import time
from typing import Any, Dict, List

from .config import Mode, OrchestrationConfig
from .runners.policy_guard import PolicyGuard
from .runners.scoring import ScoreEvaluator
from .runners.tournament import TournamentRunner


def _emit(event: Dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(event) + "\n")
    sys.stdout.flush()


def _parse_config(payload: Dict[str, Any]) -> OrchestrationConfig:
    return OrchestrationConfig(
        task=payload["task"],
        mode=Mode(payload.get("mode", "GUARDED")),
        variant_count=int(payload.get("variantCount", 5)),
        max_depth=int(payload.get("maxDepth", 5)),
        temperature=float(payload.get("temperature", 0.6)),
        tournament_size=int(payload.get("tournamentSize", 4)),
        seed=int(payload.get("seed", 1234)),
    )


def main() -> None:
    raw = os.environ.get("ORCHESTRATION_REQUEST")
    if not raw:
        raw = sys.stdin.read()
    if not raw:
        raise SystemExit("No orchestration payload provided")

    payload: Dict[str, Any] = json.loads(raw)
    config = _parse_config(payload)

    guard = PolicyGuard()
    decision = guard.evaluate(config.mode, payload.get("requestedTools", []))
    _emit(
        {
            "type": "policy",
            "payload": {
                "allowed": decision.allowed,
                "reason": decision.reason,
                "warnings": decision.warnings,
            },
        }
    )
    if not decision.allowed:
        return

    runner = TournamentRunner(config, config.mode)
    result = runner.run()

    for event in result.events:
        _emit(event)
        time.sleep(0.05)

    evaluator = ScoreEvaluator()
    leaderboard = evaluator.evaluate(result.graph)
    for breakdown in leaderboard:
        _emit(
            {
                "type": "metric-update",
                "payload": {
                    "versionId": breakdown.node_id,
                    "metrics": {
                        "compositeScore": breakdown.total_score,
                        **breakdown.components,
                    },
                },
            }
        )

    _emit({"type": "complete", "payload": {"bestVersionId": leaderboard[0].node_id if leaderboard else None}})


if __name__ == "__main__":
    main()
