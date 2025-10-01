from orchestrator_py.evaluation.scoring import ScoreVector


def test_composite_score_balances_dimensions():
    vector = ScoreVector(
        correctness=0.8,
        tests=0.9,
        performance=0.7,
        memory=0.6,
        readability=0.5,
        security=0.4,
        cost=0.3,
    )
    composite = vector.composite
    assert 0 < composite < 1
