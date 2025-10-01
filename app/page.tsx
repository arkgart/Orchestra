'use client';

import { useEffect } from 'react';
import { GraphView } from '@/components/GraphView';
import { ControlPanel } from '@/components/ControlPanel';
import { ModeSwitch } from '@/components/ModeSwitch';
import { VersionInspector } from '@/components/VersionInspector';
import { DiffViewer } from '@/components/DiffViewer';
import { Leaderboard } from '@/components/Leaderboard';
import { DemoLauncher } from '@/components/DemoLauncher';
import { ExportControls } from '@/components/ExportControls';
import { useOrchestratorStore } from '@/lib/store';
import demos from '@/data/demos.json';
import { toast, Toaster } from 'sonner';

export default function Home() {
  const lastEvent = useOrchestratorStore((state) => state.lastEvent);

  useEffect(() => {
    if (lastEvent) {
      toast.message('Event', { description: lastEvent });
    }
  }, [lastEvent]);

  useEffect(() => {
    toast('MEGAMIND ULTRA ready', {
      description: 'Load a demo task or craft your own mission to begin orchestration.'
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="bottom-right" />
      <div className="mx-auto max-w-[1600px] space-y-6 px-6 py-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">MEGAMIND ULTRA</h1>
          <p className="text-sm text-muted-foreground">
            Autonomous multi-agent super-orchestrator with 100-version tournament search, policy-aware
            tool routing, and live observability.
          </p>
        </header>
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-6">
            <ModeSwitch />
            <ControlPanel />
            <DemoLauncher />
            <ExportControls />
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border bg-background p-4">
              <h2 className="mb-3 text-lg font-semibold">Version Graph</h2>
              <div className="h-[420px]">
                <GraphView />
              </div>
            </div>
            <Leaderboard />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <VersionInspector />
              <DiffViewer />
            </div>
          </div>
        </section>
        <section className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Five End-to-End Demo Workflows</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-6">
            {demos.map((demo) => (
              <li key={demo.id}>
                <span className="font-medium text-foreground">{demo.title}:</span> {demo.description}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
