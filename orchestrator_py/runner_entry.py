"""Entry point for Node API to invoke orchestrator."""

from __future__ import annotations

import os
import sys

from orchestrator_py.orchestrator import run_from_payload


def main() -> None:
    payload = sys.stdin.read()
    session_id = os.environ.get("SESSION_ID", "local")
    run_from_payload(payload, session_id=session_id)


if __name__ == "__main__":
    main()
