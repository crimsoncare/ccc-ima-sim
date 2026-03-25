import { ActivityCoverage } from '@/components/activity/ActivityCoverage';
import { ActivityControls } from '@/components/activity/ActivityControls';
import { useSimulationStore } from '@/store/simulation-store';

export function ActivitySearchPage() {
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
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Activity Search</h1>
        <ActivityControls />
        <ActivityCoverage />
      </div>
    </div>
  );
}
