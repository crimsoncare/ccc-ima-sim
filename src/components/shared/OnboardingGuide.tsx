import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ccc-ima-guide-dismissed';

const PAGE_HELP: Record<string, string> = {
  dashboard: 'Overview of simulation results and navigation.',
  'process-explorer':
    "The process graph shows all observed paths through the clinic. Larger nodes = more cases. Click 'Show all activities' to see the full picture.",
  'variant-explorer':
    'Each variant is a unique patient journey. The top variants cover the most cases. Compare paths to find bottlenecks.',
  'throughput-time':
    'How long do patients spend between activities? Select an edge to see the distribution.',
  'activity-search':
    'Which activities do patients flow through? Use metrics to filter by start/end/flow.',
  simulation:
    'Run single simulations or Monte Carlo (5000 runs) to generate statistical data.',
};

// --- Welcome Modal ---

export function OnboardingGuide() {
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    if (dontShow) localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }, [dontShow]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl max-w-[600px] w-full mx-4 p-6">
        <h2 className="text-xl font-bold mb-1">
          Welcome to the Clinical Process Mining Explorer
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Analyze clinic workflows using process mining techniques
        </p>
        <p className="text-sm text-gray-700 mb-4">
          This tool combines discrete event simulation with process mining to
          analyze patient flow through a student-run clinic. Run simulations to
          generate clinical data, then explore the process graph, analyze
          variants, and identify bottlenecks.
        </p>

        <div className="space-y-2 mb-5">
          {([
            ['Process', 'The complete map of all observed paths patients take through the clinic — from registration through discharge.'],
            ['Variant', 'A specific end-to-end path through the process. Each patient follows exactly one variant per visit. More variants = more process complexity.'],
            ['Happy Path', 'The most common variant — the typical patient journey.'],
          ] as const).map(([term, desc]) => (
            <div
              key={term}
              className="border-l-4 border-[#0091ea] bg-blue-50 rounded-r-lg px-3 py-2"
            >
              <span className="font-semibold text-sm">{term}:</span>{' '}
              <span className="text-sm text-gray-700">{desc}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="rounded"
            />
            Don't show again
          </label>
          <button
            onClick={dismiss}
            className="bg-[#0091ea] text-white px-5 py-2 rounded-lg hover:bg-[#0077c2] font-medium text-sm"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Contextual Help Tooltip ---

export function PageHelp({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  const text = PAGE_HELP[page];
  if (!text) return null;

  return (
    <div className="fixed top-14 right-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-full bg-[#1a1a2e] text-white text-sm font-bold flex items-center justify-center shadow hover:bg-[#0091ea] transition-colors"
        aria-label="Page help"
      >
        ?
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-sm text-gray-700">
          {text}
        </div>
      )}
    </div>
  );
}
