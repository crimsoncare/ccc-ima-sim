/**
 * Process mining state management with Zustand.
 */
import { create } from 'zustand';
import type {
  EventLog,
  DirectlyFollowsGraph,
  Variant,
  KpiType,
  AggregationMethod,
  TimeUnit,
  ActivityMetric,
} from '@/mining/types';
import type { HappyPath } from '@/mining/happy-path';

interface MiningStore {
  // Data
  eventLog: EventLog | null;
  dfg: DirectlyFollowsGraph | null;
  variants: Variant[] | null;
  happyPath: HappyPath | null;

  // Visibility
  visibleNodes: Set<string>;
  visibleEdges: Set<string>;
  selectedVariantIds: Set<string>;
  selectedCaseIds: Set<string> | null;

  // UI state
  kpiType: KpiType;
  aggregationMethod: AggregationMethod;
  timeUnit: TimeUnit;
  activityMetric: ActivityMetric;
  selectedActivity: string | null;
  selectedEdge: { source: string; target: string } | null;

  // Animation
  isAnimating: boolean;
  animationSpeed: number;
  animationMode: 'day' | 'hour' | 'individual';

  // Setters
  setEventLog: (log: EventLog) => void;
  setDFG: (dfg: DirectlyFollowsGraph) => void;
  setVariants: (variants: Variant[]) => void;
  setHappyPath: (path: HappyPath | null) => void;
  setVisibleNodes: (nodes: Set<string>) => void;
  setVisibleEdges: (edges: Set<string>) => void;
  toggleNode: (activity: string) => void;
  toggleEdge: (edgeKey: string) => void;
  addAllNodes: () => void;
  setKpiType: (kpi: KpiType) => void;
  setAggregationMethod: (method: AggregationMethod) => void;
  setTimeUnit: (unit: TimeUnit) => void;
  setActivityMetric: (metric: ActivityMetric) => void;
  setSelectedActivity: (activity: string | null) => void;
  setSelectedEdge: (edge: { source: string; target: string } | null) => void;
  setSelectedVariantIds: (ids: Set<string>) => void;
  setSelectedCaseIds: (ids: Set<string> | null) => void;
  toggleVariant: (variantId: string) => void;
  setIsAnimating: (val: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setAnimationMode: (mode: 'day' | 'hour' | 'individual') => void;
}

export const useMiningStore = create<MiningStore>((set, get) => ({
  eventLog: null,
  dfg: null,
  variants: null,
  happyPath: null,
  visibleNodes: new Set(),
  visibleEdges: new Set(),
  selectedVariantIds: new Set(),
  selectedCaseIds: null,
  kpiType: 'throughput_time',
  aggregationMethod: 'median',
  timeUnit: 'minutes',
  activityMetric: 'flow_through',
  selectedActivity: null,
  selectedEdge: null,
  isAnimating: false,
  animationSpeed: 1,
  animationMode: 'individual',

  setEventLog: (eventLog) => set({ eventLog }),
  setDFG: (dfg) => set({ dfg }),
  setVariants: (variants) => {
    const ids = new Set(variants.map((v) => v.id));
    set({ variants, selectedVariantIds: ids });
  },
  setHappyPath: (happyPath) => set({ happyPath }),
  setVisibleNodes: (visibleNodes) => set({ visibleNodes }),
  setVisibleEdges: (visibleEdges) => set({ visibleEdges }),

  toggleNode: (activity) => {
    const nodes = new Set(get().visibleNodes);
    if (nodes.has(activity)) {
      nodes.delete(activity);
    } else {
      nodes.add(activity);
    }
    set({ visibleNodes: nodes });
  },

  toggleEdge: (edgeKey) => {
    const edges = new Set(get().visibleEdges);
    if (edges.has(edgeKey)) {
      edges.delete(edgeKey);
    } else {
      edges.add(edgeKey);
    }
    set({ visibleEdges: edges });
  },

  addAllNodes: () => {
    const dfg = get().dfg;
    if (!dfg) return;
    const nodes = new Set(dfg.nodes.map((n) => n.activity));
    const edges = new Set(dfg.edges.map((e) => `${e.source}->${e.target}`));
    set({ visibleNodes: nodes, visibleEdges: edges });
  },

  setKpiType: (kpiType) => set({ kpiType }),
  setAggregationMethod: (aggregationMethod) => set({ aggregationMethod }),
  setTimeUnit: (timeUnit) => set({ timeUnit }),
  setActivityMetric: (activityMetric) => set({ activityMetric }),
  setSelectedActivity: (selectedActivity) => set({ selectedActivity }),
  setSelectedEdge: (selectedEdge) => set({ selectedEdge }),
  setSelectedVariantIds: (selectedVariantIds) => set({ selectedVariantIds }),
  setSelectedCaseIds: (selectedCaseIds) => set({ selectedCaseIds }),

  toggleVariant: (variantId) => {
    const ids = new Set(get().selectedVariantIds);
    if (ids.has(variantId)) {
      ids.delete(variantId);
    } else {
      ids.add(variantId);
    }
    set({ selectedVariantIds: ids });
  },

  setIsAnimating: (isAnimating) => set({ isAnimating }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setAnimationMode: (animationMode) => set({ animationMode }),
}));
