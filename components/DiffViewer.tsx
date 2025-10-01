'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useOrchestratorStore } from '@/lib/store';

const MonacoDiffEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.DiffEditor), {
  ssr: false
});

export function DiffViewer() {
  const activeVersion = useOrchestratorStore((state) => state.activeVersion);
  const graph = useOrchestratorStore((state) => state.graph);

  const parent = useMemo(() => {
    if (!activeVersion?.parentId) return undefined;
    return graph.nodes.find((node) => node.id === activeVersion.parentId);
  }, [activeVersion, graph.nodes]);

  if (!activeVersion) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        Select a version to view diffs.
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        No parent version available. This is likely the root plan or initial variant.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Diff vs Parent</h3>
      </div>
      <MonacoDiffEditor
        original={parent.summary}
        modified={activeVersion.summary}
        language="markdown"
        theme="vs-dark"
        height="240px"
        options={{ readOnly: true, renderSideBySide: false }}
      />
    </div>
  );
}
