'use client';

import { useEffect, useMemo, useState } from 'react';
import { GenerationControls } from '@/components/controls/GenerationControls';
import { ModeSwitch } from '@/components/controls/ModeSwitch';
import { Leaderboard } from '@/components/graph/Leaderboard';
import { MetricsPanel } from '@/components/graph/MetricsPanel';
import { VersionGraph } from '@/components/graph/VersionGraph';
import { VersionInspector } from '@/components/inspector/VersionInspector';
import { streamSession } from '@/lib/api';
import { AgentMetric, OrchestratorMode, StreamEvent, TournamentSnapshot, VersionNode } from '@/lib/types';
import toast, { Toaster } from 'react-hot-toast';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from 'react-resizable-panels';

export default function Home() {
  const [mode, setMode] = useState<OrchestratorMode>('GUARDED');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<TournamentSnapshot | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const selectedVersion: VersionNode | null = useMemo(() => {
    if (!snapshot || !selectedVersionId) {
      return null;
    }
    return snapshot.nodes.find((node) => node.id === selectedVersionId) ?? null;
  }, [snapshot, selectedVersionId]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    const disconnect = streamSession(sessionId, (event: StreamEvent) => {
      if (event.type === 'graph') {
        setSnapshot(event.payload as TournamentSnapshot);
      } else if (event.type === 'log') {
        setLogLines((lines) => [...lines.slice(-200), String(event.payload)]);
      } else if (event.type === 'metric') {
        setMetrics(event.payload as AgentMetric[]);
      } else if (event.type === 'error') {
        toast.error(String(event.payload));
      } else if (event.type === 'complete') {
        toast.success('Tournament completed');
      }
    });
    return disconnect;
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <Toaster />
      <section className="grid gap-6 md:grid-cols-3">
        <ModeSwitch mode={mode} onChange={setMode} />
        <GenerationControls mode={mode} onSessionStart={setSessionId} />
        <MetricsPanel metrics={metrics} />
      </section>
      <ResizablePanelGroup direction="horizontal" className="gap-4">
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="space-y-4">
            <VersionGraph snapshot={snapshot} onSelectNode={setSelectedVersionId} />
            <Leaderboard leaderboard={snapshot?.leaderboard ?? []} />
          </div>
        </ResizablePanel>
        <ResizableHandle className="w-1 bg-slate-800" />
        <ResizablePanel minSize={30}>
          <VersionInspector selectedVersion={selectedVersion} latestLogLines={logLines} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
