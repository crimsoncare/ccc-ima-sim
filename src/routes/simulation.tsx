import { useState, useCallback } from 'react';
import { useSimulationStore } from '@/store/simulation-store';
import type { SimulationParams } from '@/core/simulation';
import { Timeline } from '@/components/simulation/Timeline';
import { MonteCarloCharts } from '@/components/simulation/MonteCarloCharts';
import { ParameterModal, JSONModal } from '@/components/simulation/ParameterModal';

export function SimulationPage() {
  const { params, setParams, runSimulation, runMonteCarlo, isRunning, lastSimulation, monteCarloResults } =
    useSimulationStore();

  const [showParams, setShowParams] = useState(false);
  const [showJSON, setShowJSON] = useState(false);

  const handleRunSingle = useCallback(() => {
    runSimulation();
  }, [runSimulation]);

  const handleRunMonteCarlo = useCallback(() => {
    runMonteCarlo(100);
  }, [runMonteCarlo]);

  const handleSaveParams = useCallback(
    (newParams: SimulationParams) => {
      setParams(newParams);
    },
    [setParams],
  );

  const handleImportJSON = useCallback(
    (newParams: SimulationParams) => {
      setParams(newParams);
    },
    [setParams],
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-[#333] px-3 py-2 flex items-center gap-2 shrink-0">
        <button
          className="bg-[#2e6da4] text-white px-4 py-1.5 rounded text-sm hover:opacity-90 transition-opacity"
          onClick={() => setShowParams(true)}
        >
          Parameters
        </button>
        <button
          className="bg-[#2e6da4] text-white px-4 py-1.5 rounded text-sm hover:opacity-90 transition-opacity"
          onClick={() => setShowJSON(true)}
        >
          JSON
        </button>
        <button
          className="bg-[#2e6da4] text-white px-4 py-1.5 rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          onClick={handleRunSingle}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
        <button
          className="bg-[#2e6da4] text-white px-4 py-1.5 rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          onClick={handleRunMonteCarlo}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Monte Carlo'}
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        {lastSimulation ? (
          <>
            <Timeline
              actors={lastSimulation.actors}
              message="<p><strong>Hint:</strong> hover over the timeline labels to highlight relationships</p>"
            />
            {monteCarloResults && <MonteCarloCharts results={monteCarloResults} />}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Run a simulation to see the timeline
          </div>
        )}
      </div>

      {/* Modals */}
      {showParams && (
        <ParameterModal
          params={params}
          onSave={handleSaveParams}
          onClose={() => setShowParams(false)}
        />
      )}
      {showJSON && (
        <JSONModal
          params={params}
          onImport={handleImportJSON}
          onClose={() => setShowJSON(false)}
        />
      )}
    </div>
  );
}
