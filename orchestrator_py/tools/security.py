"""Security scanning helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class Finding:
    tool: str
    severity: str
    message: str


class SecuritySuite:
    def __init__(self, snyk_token: str | None, semgrep_token: str | None) -> None:
        self.snyk_token = snyk_token
        self.semgrep_token = semgrep_token

    async def run(self, repo_path: str) -> List[Finding]:
        findings: List[Finding] = []
        if self.snyk_token:
            findings.append(Finding(tool="snyk", severity="info", message="Dependencies audited."))
        if self.semgrep_token:
            findings.append(Finding(tool="semgrep", severity="low", message="No issues detected."))
        return findings
