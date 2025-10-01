'use client';

import { useMemo } from 'react';
import { CodeInspector } from './CodeInspector';
import { LogTerminal } from './LogTerminal';
import dynamic from 'next/dynamic';
import { VersionNode } from '@/lib/types';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

interface Props {
  selectedVersion: VersionNode | null;
  latestLogLines: string[];
}

export function VersionInspector({ selectedVersion, latestLogLines }: Props) {
  const code = useMemo(() => selectedVersion?.summary ?? '// select a node to inspect', [selectedVersion]);
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-lg font-semibold text-slate-100">Inspector</h3>
        <p className="text-sm text-slate-400">Review generated code, metadata, and telemetry.</p>
      </section>
      <CodeInspector code={code} language="markdown" />
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
        <h4 className="text-sm font-semibold text-slate-200">Metadata</h4>
        <div className="mt-2 text-xs text-slate-300">
          <ReactJson
            src={selectedVersion ?? { message: 'Select a version to view details' }}
            theme="ocean"
            collapsed={1}
            enableClipboard={false}
          />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-200">Logs</h4>
        <LogTerminal lines={latestLogLines} />
      </div>
    </div>
  );
}
