/**
 * Simulation state management with Zustand.
 */
import { create } from 'zustand';
import { Simulation, type SimulationParams } from '@/core/simulation';
import { Scheduler } from '@/core/scheduler';
import { Actor } from '@/core/actor';
import { extractEventLog } from '@/mining/event-log';
import { extractEnrichedEventLog } from '@/mining/enriched-event-log';
import { computeDFG } from '@/mining/dfg';
import { extractVariants } from '@/mining/variants';
import { computeHappyPath, getHappyPathElements } from '@/mining/happy-path';
import { useMiningStore } from './mining-store';
import type { MonteCarloResults, WorkerResponse } from '@/types/monte-carlo';
import exampleParams from '../../example.json';

export interface SimulationResult {
  actors: Actor[];
  time: number;
  params: SimulationParams;
}

interface SimulationStore {
  params: SimulationParams;
  lastSimulation: SimulationResult | null;
  monteCarloResults: MonteCarloResults | null;
  isRunning: boolean;
  setParams: (params: SimulationParams) => void;
  runSimulation: (params?: SimulationParams) => void;
  runMultipleSimulations: (count: number, params?: SimulationParams) => void;
  runMonteCarlo: (numSamps?: number, params?: SimulationParams) => void;
}

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL('../workers/simulation-worker.ts', import.meta.url),
      { type: 'module' },
    );
  }
  return worker;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  params: exampleParams as SimulationParams,
  lastSimulation: null,
  monteCarloResults: null,
  isRunning: false,

  setParams: (params) => set({ params }),

  runSimulation: (overrideParams) => {
    set({ isRunning: true });

    // Use setTimeout to let UI update
    setTimeout(() => {
      try {
        const params = overrideParams ?? get().params;
        const sim = new Simulation();
        const scheduler = new Scheduler();
        sim.run(params, scheduler);

        const result: SimulationResult = {
          actors: sim.actors,
          time: sim.time,
          params,
        };

        set({ lastSimulation: result, isRunning: false });

        // Update mining store with enriched event log (decomposed sub-activities)
        const eventLog = extractEnrichedEventLog(sim);
        const dfg = computeDFG(eventLog);
        const variants = extractVariants(eventLog);
        const happyPath = computeHappyPath(eventLog);

        const miningStore = useMiningStore.getState();
        miningStore.setEventLog(eventLog);
        miningStore.setDFG(dfg);
        miningStore.setVariants(variants);
        miningStore.setHappyPath(happyPath);

        // Show ALL activities by default for a rich branching graph
        const allNodes = new Set(dfg.nodes.map(n => n.activity));
        const allEdges = new Set(dfg.edges.map(e => `${e.source}->${e.target}`));
        miningStore.setVisibleNodes(allNodes);
        miningStore.setVisibleEdges(allEdges);
      } catch (e) {
        console.error('Simulation failed:', e);
        set({ isRunning: false });
      }
    }, 10);
  },

  runMultipleSimulations: (count, overrideParams) => {
    set({ isRunning: true });

    setTimeout(() => {
      try {
        const params = overrideParams ?? get().params;
        const allActors: Actor[][] = [];

        for (let i = 0; i < count; i++) {
          const sim = new Simulation();
          const scheduler = new Scheduler();
          sim.run(params, scheduler);
          allActors.push(sim.actors);
        }

        // Use the last simulation as the result
        const lastSim = allActors[allActors.length - 1];
        const lastSimObj = new Simulation();
        lastSimObj.actors = lastSim;
        lastSimObj.time = 0; // Will be computed from actors

        // For mining, combine all simulation results into one event log
        const combinedSim = {
          actors: allActors.flat(),
          time: 0,
        };

        // Create shallow copies with unique case IDs per simulation run
        // (do NOT mutate original actor objects)
        let idx = 0;
        const allActorsCopy: Actor[][] = [];
        for (const actors of allActors) {
          const actorsCopy: Actor[] = [];
          for (const actor of actors) {
            const copy = Object.create(Object.getPrototypeOf(actor));
            Object.assign(copy, actor);
            if (copy.type === 'Patient') {
              copy.id = `${actor.id}_run${idx}`;
            }
            actorsCopy.push(copy);
          }
          allActorsCopy.push(actorsCopy);
          idx++;
        }

        const combinedSim2 = {
          actors: allActorsCopy.flat(),
          time: 0,
        };
        const eventLog = extractEventLog(combinedSim2);
        const dfg = computeDFG(eventLog);
        const variants = extractVariants(eventLog);
        const happyPath = computeHappyPath(eventLog);

        const miningStore = useMiningStore.getState();
        miningStore.setEventLog(eventLog);
        miningStore.setDFG(dfg);
        miningStore.setVariants(variants);
        miningStore.setHappyPath(happyPath);

        if (happyPath) {
          const elements = getHappyPathElements(happyPath);
          miningStore.setVisibleNodes(elements.activities);
          miningStore.setVisibleEdges(elements.edges);
        }

        set({ isRunning: false });
      } catch (e) {
        console.error('Multi-simulation failed:', e);
        set({ isRunning: false });
      }
    }, 10);
  },

  runMonteCarlo: (numSamps = 5000, overrideParams) => {
    set({ isRunning: true, monteCarloResults: null });
    const params = overrideParams ?? get().params;
    const w = getWorker();

    const handler = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.action === 'runMonteCarlo') {
        w.removeEventListener('message', handler);
        set({
          monteCarloResults: e.data.results,
          isRunning: false,
        });

        // Also generate mining data from quick batch runs for the Process Explorer
        // This creates variant diversity across multiple random runs
        setTimeout(() => {
          const batchSize = Math.min(numSamps, 500);
          const allActorsCopy: Actor[] = [];
          for (let i = 0; i < batchSize; i++) {
            const sim = new Simulation();
            const scheduler = new Scheduler();
            sim.run(params, scheduler);
            for (const actor of sim.actors) {
              const copy = Object.create(Object.getPrototypeOf(actor));
              Object.assign(copy, actor);
              if (copy.type === 'Patient') {
                copy.id = `${actor.id}_mc${i}`;
              }
              allActorsCopy.push(copy);
            }
          }
          const combinedSim = { actors: allActorsCopy, time: 0 };
          const eventLog = extractEnrichedEventLog(combinedSim);
          const dfg = computeDFG(eventLog);
          const variants = extractVariants(eventLog);
          const happyPath = computeHappyPath(eventLog);

          const miningStore = useMiningStore.getState();
          miningStore.setEventLog(eventLog);
          miningStore.setDFG(dfg);
          miningStore.setVariants(variants);
          miningStore.setHappyPath(happyPath);

          // Show ALL activities for rich branching graph
          const allNodes = new Set(dfg.nodes.map(n => n.activity));
          const allEdges = new Set(dfg.edges.map(e => `${e.source}->${e.target}`));
          miningStore.setVisibleNodes(allNodes);
          miningStore.setVisibleEdges(allEdges);
        }, 50);
      }
    };
    w.addEventListener('message', handler);
    w.postMessage({ action: 'runMonteCarlo', params, numSamps });
  },
}));
