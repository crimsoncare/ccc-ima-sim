import { useEffect } from 'react';
import { useSimulationStore } from '@/store/simulation-store';

export function useEnsureSimulation() {
  const { lastSimulation, isRunning, runSimulation, runMonteCarlo } = useSimulationStore();
  useEffect(() => {
    if (!lastSimulation && !isRunning) {
      runSimulation();
      setTimeout(() => runMonteCarlo(5000), 500);
    }
  }, [lastSimulation, isRunning, runSimulation, runMonteCarlo]);
}
