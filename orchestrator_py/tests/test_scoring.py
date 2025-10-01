"""Property-based checks for scoring evaluator."""

from orchestrator_py.models import VersionGraph, VersionNode
from orchestrator_py.runners.scoring import ScoreEvaluator
from datetime import datetime


def test_score_evaluator_orders_by_total() -> None:
    graph = VersionGraph()
    node_a = VersionNode(
        id="a",
        parent_id=None,
        title="A",
        summary="",
        status="succeeded",
        score=0.9,
        cost_usd=1.0,
        createdAt=datetime.utcnow(),
        metrics={"coverage": 0.95, "latency_ms": 200},
    )
    node_b = VersionNode(
        id="b",
        parent_id=None,
        title="B",
        summary="",
        status="succeeded",
        score=0.4,
        cost_usd=1.0,
        createdAt=datetime.utcnow(),
        metrics={"coverage": 0.5, "latency_ms": 600},
    )
    graph.add_node(node_a)
    graph.add_node(node_b)

    evaluator = ScoreEvaluator()
    leaderboard = evaluator.evaluate(graph)

    assert leaderboard[0].node_id == "a"
