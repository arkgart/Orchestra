"""High-level orchestration API used by Next.js backend."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

PACKAGE_ROOT = Path(__file__).resolve().parent


def run_session(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    """Run the python session runner as a subprocess and yield events."""

    env = {**dict(**os.environ), "ORCHESTRATION_REQUEST": json.dumps(payload)}
    process = subprocess.Popen(
        [sys.executable, "-m", "orchestrator_py.session_runner"],
        cwd=PACKAGE_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env,
    )
    assert process.stdout is not None
    for line in process.stdout:
        if not line.strip():
            continue
        yield json.loads(line)
    process.wait(timeout=5)
    if process.returncode not in (0, None):
        raise RuntimeError(process.stderr.read())
