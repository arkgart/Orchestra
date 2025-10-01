'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useOrchestratorStore } from '@/lib/store';
import { LogsTerminal } from './LogsTerminal';
import { VersionMetrics } from './VersionMetrics';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export function VersionInspector() {
  const activeVersion = useOrchestratorStore((state) => state.activeVersion);
  const logs = useOrchestratorStore((state) => state.logs);

  const value = useMemo(() => activeVersion?.summary ?? 'Select a version to inspect.', [activeVersion]);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-hidden">
      <div className="rounded-lg border bg-background">
        <div className="border-b px-4 py-2">
          <h3 className="text-sm font-semibold">Version Summary</h3>
        </div>
        <div className="min-h-[200px]">
          <MonacoEditor
            height="200px"
            language="markdown"
            theme="vs-dark"
            options={{ readOnly: true, minimap: { enabled: false }, wordWrap: 'on' }}
            value={value}
          />
        </div>
      </div>
      <VersionMetrics />
      <LogsTerminal logLines={activeVersion ? logs[activeVersion.id] ?? [] : []} />
    </div>
  );
}
