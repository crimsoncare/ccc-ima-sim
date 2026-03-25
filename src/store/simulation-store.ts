/**
 * Simulation state management with Zustand.
 */
import { create } from 'zustand';
import { Simulation, type SimulationParams } from '@/core/simulation';
import { Scheduler } from '@/core/scheduler';
import { Actor } from '@/core/actor';
import { extractEventLog } from '@/mining/event-log';
import { computeDFG } from '@/mining/dfg';
import { extractVariants } from '@/mining/variants';
import { computeHappyPath, getHappyPathElements } from '@/mining/happy-path';
import { useMiningStore } from './mining-store';
import exampleParams from '../../example.json';

export interface SimulationResult {
  actors: Actor[];
  time: number;
  params: SimulationParams;
}

interface SimulationStore {
  params: SimulationParams;
  lastSimulation: SimulationResult | null;
  isRunning: boolean;
  setParams: (params: SimulationParams) => void;
  runSimulation: (params?: SimulationParams) => void;
  runMultipleSimulations: (count: number, params?: SimulationParams) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  params: exampleParams as SimulationParams,
  lastSimulation: null,
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

        // Update mining store
        const eventLog = extractEventLog(sim);
        const dfg = computeDFG(eventLog);
        const variants = extractVariants(eventLog);
        const happyPath = computeHappyPath(eventLog);

        const miningStore = useMiningStore.getState();
        miningStore.setEventLog(eventLog);
        miningStore.setDFG(dfg);
        miningStore.setVariants(variants);
        miningStore.setHappyPath(happyPath);

        // Initialize visible nodes/edges from happy path
        if (happyPath) {
          const elements = getHappyPathElements(happyPath);
          miningStore.setVisibleNodes(elements.activities);
          miningStore.setVisibleEdges(elements.edges);
        }
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
}));
