import { Link } from '@tanstack/react-router';
import { useSimulationStore } from '@/store/simulation-store';
import { useMiningStore } from '@/store/mining-store';

export function IndexPage() {
  const { lastSimulation, runSimulation, isRunning } = useSimulationStore();
  const { eventLog, dfg, variants } = useMiningStore();

  return (
    <div className="p-6 overflow-auto h-full">
      <h1 className="text-2xl font-bold mb-6">Clinical Process Mining Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Quick Start</h2>
          <button
            onClick={() => runSimulation()}
            disabled={isRunning}
            className="w-full bg-[#0091ea] text-white px-4 py-2 rounded hover:bg-[#0077c2] disabled:opacity-50 mb-2"
          >
            {isRunning ? 'Running...' : 'Run Simulation'}
          </button>
          <p className="text-sm text-gray-500">
            Run a simulation with default parameters to generate process data.
          </p>
        </div>

        {/* Simulation Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Simulation Data</h2>
          {lastSimulation ? (
            <div className="text-sm space-y-1">
              <p>Cases: <span className="font-mono">{eventLog?.cases.length ?? 0}</span></p>
              <p>Activities: <span className="font-mono">{dfg?.nodes.length ?? 0}</span></p>
              <p>Variants: <span className="font-mono">{variants?.length ?? 0}</span></p>
              <p>Sim time: <span className="font-mono">{lastSimulation.time.toFixed(1)} min</span></p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No simulation run yet.</p>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Explore</h2>
          <div className="space-y-2">
            <Link to="/process-explorer" className="block text-[#0091ea] hover:underline text-sm">
              Process Explorer — View the process graph
            </Link>
            <Link to="/variant-explorer" className="block text-[#0091ea] hover:underline text-sm">
              Variant Explorer — Analyze process variants
            </Link>
            <Link to="/throughput-time" className="block text-[#0091ea] hover:underline text-sm">
              Throughput Time — Analyze timing
            </Link>
            <Link to="/activity-search" className="block text-[#0091ea] hover:underline text-sm">
              Activity Search — Activity coverage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
