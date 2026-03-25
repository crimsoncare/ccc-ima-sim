import { VariantList } from '@/components/variant-panel/VariantList';
import { VariantHistogram } from '@/components/variant-panel/VariantHistogram';
import { ProcessGraph } from '@/components/process-graph/ProcessGraph';
import { useMiningStore } from '@/store/mining-store';
import { useSimulationStore } from '@/store/simulation-store';
import { useEnsureSimulation } from '@/hooks/useEnsureSimulation';

export function VariantExplorerPage() {
  useEnsureSimulation();
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

  const totalCases = variants?.reduce((sum, v) => sum + v.frequency, 0) ?? 0;
  const selectedCases = variants
    ?.filter((v) => selectedVariantIds.has(v.id))
    .reduce((sum, v) => sum + v.frequency, 0) ?? 0;
  const coveragePct = totalCases > 0 ? ((selectedCases / totalCases) * 100).toFixed(0) : '0';

  return (
    <div className="flex h-full">
      {/* Process graph for selected variants */}
      <div className="flex-1 relative">
        <ProcessGraph mode="variant" />
      </div>

      {/* Variant panel on the right */}
      <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <h2 className="font-semibold text-base">Variant Explorer</h2>
          <p className="text-[11px] text-gray-500 mt-1 leading-snug">
            A variant is an end-to-end trace through the clinic process. Each patient follows exactly one variant per visit.
          </p>
          <div className="flex gap-3 mt-2">
            <div className="bg-gray-50 rounded px-2 py-1 text-center flex-1">
              <div className="text-sm font-bold text-gray-800">{variants?.length ?? 0}</div>
              <div className="text-[10px] text-gray-500">variants</div>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1 text-center flex-1">
              <div className="text-sm font-bold text-gray-800">{selectedVariantIds.size}</div>
              <div className="text-[10px] text-gray-500">selected</div>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1 text-center flex-1">
              <div className="text-sm font-bold text-[#0091ea]">{coveragePct}%</div>
              <div className="text-[10px] text-gray-500">coverage</div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <VariantHistogram />
          <VariantList />
        </div>
      </div>
    </div>
  );
}
