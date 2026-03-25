import { useSimulationStore } from '@/store/simulation-store';

export function SimulationPage() {
  const { runSimulation, isRunning, lastSimulation } = useSimulationStore();

  return (
    <div className="p-6 overflow-auto h-full">
      <h1 className="text-xl font-bold mb-4">Simulation</h1>
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => runSimulation()}
          disabled={isRunning}
          className="bg-[#0091ea] text-white px-4 py-2 rounded hover:bg-[#0077c2] disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      {lastSimulation && (
        <div className="bg-[#1a1a2e] rounded-lg p-4 text-white">
          <p className="text-sm mb-2 text-white/70">
            Simulation completed in {lastSimulation.time.toFixed(1)} minutes
          </p>
          <div className="space-y-px">
            {lastSimulation.actors
              .filter((a) => a.type === 'Patient')
              .map((actor) => (
                <div key={actor.id} className="flex items-center gap-2 text-xs">
                  <span className="w-24 text-white/60">{actor.id}</span>
                  <div className="flex-1 h-5 relative bg-white/5 rounded overflow-hidden">
                    {actor.timeline.map((event, i) => {
                      const duration = (event.end ?? 0) - event.start;
                      if (duration <= 0) return null;
                      const left = (event.start / lastSimulation.time) * 100;
                      const width = (duration / lastSimulation.time) * 100;
                      return (
                        <div
                          key={i}
                          className="absolute top-0 h-full opacity-80"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: getStateColor(event.stateCode),
                          }}
                          title={`${getStateLabel(event.stateCode)} (${duration.toFixed(1)} min)`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getStateColor(code: number): string {
  const colors: Record<number, string> = {
    101: 'transparent',
    102: '#888',
    103: 'rgba(224,192,0,0.6)',
    104: 'rgba(255,0,0,0.6)',
    105: '#339966',
    107: 'rgba(255,96,0,0.6)',
    108: '#336699',
    109: '#888',
    110: 'transparent',
  };
  return colors[code] ?? '#555';
}

function getStateLabel(code: number): string {
  const labels: Record<number, string> = {
    101: 'Before Arrival',
    102: 'Checking In',
    103: 'Wait (Preferred CT)',
    104: 'Wait (Any CT)',
    105: 'CT Meeting',
    107: 'Wait (Attending)',
    108: 'Attending Meeting',
    109: 'Checking Out',
    110: 'Finished',
  };
  return labels[code] ?? `State ${code}`;
}
