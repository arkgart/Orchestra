'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

interface LogsTerminalProps {
  logLines: string[];
}

export function LogsTerminal({ logLines }: LogsTerminalProps) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Terminal>();

  useEffect(() => {
    if (!terminalRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = new Terminal({
        convertEol: true,
        disableStdin: true,
        fontFamily: 'JetBrains Mono, Menlo, monospace',
        fontSize: 12
      });
      instanceRef.current.open(terminalRef.current);
    }
    instanceRef.current.clear();
    for (const line of logLines) {
      instanceRef.current.writeln(line);
    }
  }, [logLines]);

  return <div className="h-64 overflow-hidden rounded border" ref={terminalRef} />;
}
