import { create } from 'zustand';
import type {
  OrchestrationMode,
  VersionGraph,
  VersionNode,
  OrchestrationRequest
} from './types';

type StreamMessage = string;

interface OrchestratorState {
  mode: OrchestrationMode;
  setMode: (mode: OrchestrationMode) => void;
  task: string;
  setTask: (task: string) => void;
  graph: VersionGraph;
  setGraph: (graph: VersionGraph | ((prev: VersionGraph) => VersionGraph)) => void;
  activeVersion?: VersionNode;
  setActiveVersion: (node?: VersionNode) => void;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  logs: Record<string, StreamMessage[]>;
  appendLog: (id: string, message: StreamMessage) => void;
  lastEvent?: string;
  setLastEvent: (event: string | undefined) => void;
  orchestrationConfig: Pick<OrchestrationRequest, 'variantCount' | 'maxDepth' | 'temperature' | 'tournamentSize'>;
  updateOrchestrationConfig: (cfg: Partial<OrchestratorState['orchestrationConfig']>) => void;
}

const emptyGraph: VersionGraph = {
  nodes: [],
  edges: []
};

export const useOrchestratorStore = create<OrchestratorState>((set, get) => ({
  mode: 'GUARDED',
  setMode: (mode) => set({ mode }),
  task: '',
  setTask: (task) => set({ task }),
  graph: emptyGraph,
  setGraph: (graph) => set({ graph }),
  activeVersion: undefined,
  setActiveVersion: (node) => set({ activeVersion: node }),
  isRunning: false,
  setIsRunning: (value) => set({ isRunning: value }),
  logs: {},
  appendLog: (id, message) => {
    const current = get().logs[id] ?? [];
    set({ logs: { ...get().logs, [id]: [...current, message] } });
  },
  lastEvent: undefined,
  setLastEvent: (event) => set({ lastEvent: event }),
  orchestrationConfig: {
    variantCount: 5,
    maxDepth: 5,
    temperature: 0.6,
    tournamentSize: 4
  },
  updateOrchestrationConfig: (cfg) =>
    set({ orchestrationConfig: { ...get().orchestrationConfig, ...cfg } })
}));
