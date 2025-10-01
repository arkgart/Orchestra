"""Unit tests for policy guard."""

from orchestrator_py.config import Mode
from orchestrator_py.runners.policy_guard import PolicyGuard


def test_safe_mode_denies_browserless() -> None:
    guard = PolicyGuard()
    decision = guard.evaluate(Mode.SAFE, ["browserless", "openai:gpt-5-codex"])
    assert not decision.allowed
    assert decision.reason and "browserless" in decision.reason


def test_guarded_mode_warns_modal() -> None:
    guard = PolicyGuard()
    decision = guard.evaluate(Mode.GUARDED, ["modal:python", "openai:gpt-5-codex"])
    assert decision.allowed
    assert decision.warnings and any("modal" in warning for warning in decision.warnings)
