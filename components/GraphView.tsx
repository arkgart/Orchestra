'use client';

import React, { useMemo } from 'react';
import 'react-flow-renderer/dist/style.css';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Edge,
  type Node
} from 'react-flow-renderer';
import { useOrchestratorStore } from '@/lib/store';
import type { VersionGraph } from '@/lib/types';

interface GraphViewProps {
  onSelectNode?: (id: string) => void;
}

function GraphViewInner({ onSelectNode }: GraphViewProps) {
  const graph = useOrchestratorStore((state) => state.graph);
  const activeVersion = useOrchestratorStore((state) => state.activeVersion);
  const setActiveVersion = useOrchestratorStore((state) => state.setActiveVersion);

  const nodes = useMemo<Node[]>(
    () =>
      graph.nodes.map((node) => ({
        id: node.id,
        data: {
          label: (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{node.title}</span>
                <span className="text-xs text-muted-foreground">#{node.variant}</span>
              </div>
              <p className="text-xs leading-snug text-muted-foreground">{node.summary}</p>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${getStatusColor(node.status)}`}>{node.status}</span>
                <span>${node.costUsd.toFixed(2)}</span>
              </div>
            </div>
          )
        },
        position: { x: node.variant * 240, y: graph.nodes.indexOf(node) * 160 },
        className: `rounded border bg-background/80 p-3 shadow ${
          activeVersion?.id === node.id ? 'border-primary shadow-lg' : 'border-border'
        }`
      })),
    [graph.nodes, activeVersion?.id]
  );

  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true
      })),
    [graph.edges]
  );

  return (
    <ReactFlow nodes={nodes} edges={edges} onNodeClick={(_, node) => {
      const selected = graph.nodes.find((item) => item.id === node.id);
      if (selected) {
        setActiveVersion(selected);
        onSelectNode?.(selected.id);
      }
    }} fitView className="rounded-lg border bg-background">
      <MiniMap pannable zoomable />
      <Controls />
      <Background gap={12} size={1} />
    </ReactFlow>
  );
}

function getStatusColor(status: VersionGraph['nodes'][number]['status']) {
  switch (status) {
    case 'pending':
      return 'text-yellow-500';
    case 'running':
      return 'text-blue-500';
    case 'succeeded':
      return 'text-green-500';
    case 'failed':
      return 'text-red-500';
    default:
      return '';
  }
}

export function GraphView(props: GraphViewProps) {
  return (
    <ReactFlowProvider>
      <GraphViewInner {...props} />
    </ReactFlowProvider>
  );
}
