import { ProcessGraph } from '@/components/process-graph/ProcessGraph';
import { GraphControls } from '@/components/process-graph/GraphControls';
import { useMiningStore } from '@/store/mining-store';
import { useSimulationStore } from '@/store/simulation-store';

export function ProcessExplorerPage() {
  const { dfg, happyPath, visibleNodes, visibleEdges } = useMiningStore();
  const { lastSimulation, runSimulation, isRunning } = useSimulationStore();

  if (!lastSimulation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No simulation data available.</p>
          <button
            onClick={() => runSimulation()}
            disabled={isRunning}
            className="bg-[#0091ea] text-white px-6 py-2 rounded hover:bg-[#0077c2] disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <ProcessGraph />
        <GraphControls />
      </div>
    </div>
  );
}
