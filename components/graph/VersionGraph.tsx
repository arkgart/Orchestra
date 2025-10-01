'use client';

import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, Position } from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import { TournamentSnapshot, VersionNode } from '@/lib/types';

interface Props {
  snapshot: TournamentSnapshot | null;
  onSelectNode: (nodeId: string) => void;
}

function mapNodes(nodes: VersionNode[]): Node[] {
  return nodes.map((node) => ({
    id: node.id,
    data: { label: `${node.summary}\n(${node.status})` },
    position: { x: Math.random() * 400, y: Math.random() * 200 },
    style: {
      background:
        node.status === 'passed'
          ? '#16a34a'
          : node.status === 'failed'
          ? '#dc2626'
          : node.status === 'running'
          ? '#2563eb'
          : '#334155',
      color: 'white',
      padding: 12,
      borderRadius: 8,
      fontSize: 12,
      width: 220
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  }));
}

function mapEdges(edges: { id: string; source: string; target: string }[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: { stroke: '#94a3b8' }
  }));
}

export function VersionGraph({ snapshot, onSelectNode }: Props) {
  const nodes = useMemo(() => (snapshot ? mapNodes(snapshot.nodes) : []), [snapshot]);
  const edges = useMemo(() => (snapshot ? mapEdges(snapshot.edges) : []), [snapshot]);

  return (
    <div className="h-[500px] rounded-lg border border-slate-800 bg-slate-900/60">
      <ReactFlow nodes={nodes} edges={edges} onNodeClick={(_, node) => onSelectNode(node.id)}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
