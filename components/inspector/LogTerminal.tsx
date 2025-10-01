'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

interface Props {
  lines: string[];
}

export function LogTerminal({ lines }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Terminal>();

  useEffect(() => {
    if (!instanceRef.current && terminalRef.current) {
      instanceRef.current = new Terminal({
        theme: {
          background: '#020617',
          foreground: '#e2e8f0'
        },
        fontSize: 12,
        convertEol: true
      });
      instanceRef.current.open(terminalRef.current);
    }
  }, []);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.clear();
      lines.forEach((line) => instanceRef.current?.writeln(line));
    }
  }, [lines]);

  return <div ref={terminalRef} className="h-64 w-full overflow-hidden rounded-lg border border-slate-800" />;
}
