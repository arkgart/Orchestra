"""Emit structured events as JSON lines for the Node.js API to stream."""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from typing import Any, Iterable


@dataclass
class EventEmitter:
    session_id: str

    def _write(self, event: str, payload: Any) -> None:
        record = {"type": event, "payload": payload, "sessionId": self.session_id}
        sys.stdout.write(json.dumps(record) + "\n")
        sys.stdout.flush()

    def emit_graph(self, snapshot: Any) -> None:
        self._write("graph", snapshot)

    def emit_log(self, message: str) -> None:
        self._write("log", message)

    def emit_metrics(self, metrics: Iterable[Any]) -> None:
        self._write("metric", list(metrics))

    def emit_complete(self) -> None:
        self._write("complete", {"status": "done"})
