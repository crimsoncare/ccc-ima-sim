import { VariantList } from '@/components/variant-panel/VariantList';
import { VariantHistogram } from '@/components/variant-panel/VariantHistogram';
import { ProcessGraph } from '@/components/process-graph/ProcessGraph';
import { useMiningStore } from '@/store/mining-store';
import { useSimulationStore } from '@/store/simulation-store';

export function VariantExplorerPage() {
  const { variants, selectedVariantIds } = useMiningStore();
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
      {/* Process graph for selected variants */}
      <div className="flex-1 relative">
        <ProcessGraph mode="variant" />
      </div>

      {/* Variant panel on the right */}
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <h2 className="font-semibold">Variants</h2>
          <p className="text-xs text-gray-500 mt-1">
            {selectedVariantIds.size} of {variants?.length ?? 0} variants selected
          </p>
        </div>
        <div className="flex-1 overflow-auto">
          <VariantHistogram />
          <VariantList />
        </div>
      </div>
    </div>
  );
}
