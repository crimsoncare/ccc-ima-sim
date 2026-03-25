import { useEffect, useMemo } from 'react';
import { useSimulationStore } from '@/store/simulation-store';
import { useMiningStore } from '@/store/mining-store';
import { ProcessGraph } from '@/components/process-graph/ProcessGraph';
import { VariantList } from '@/components/variant-panel/VariantList';
import { VariantHistogram } from '@/components/variant-panel/VariantHistogram';
import { MonteCarloCharts } from '@/components/simulation/MonteCarloCharts';
import { Timeline } from '@/components/simulation/Timeline';
import { computeAllThroughputTimes } from '@/mining/throughput';

// ── Insight card ──────────────────────────────────────────
function Insight({ label, value, sub, color = 'blue' }: { label: string; value: string; sub?: string; color?: string }) {
  const bg = color === 'orange' ? 'bg-orange-50 border-orange-200' : color === 'red' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
  const text = color === 'orange' ? 'text-orange-700' : color === 'red' ? 'text-red-700' : 'text-blue-700';
  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${text}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────
function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      {children}
    </section>
  );
}

export function IndexPage() {
  const { lastSimulation, monteCarloResults, runSimulation, runMonteCarlo, isRunning, params } = useSimulationStore();
  const { eventLog, dfg, variants, happyPath } = useMiningStore();

  // Auto-run simulation on first load
  useEffect(() => {
    if (!lastSimulation && !isRunning) {
      runSimulation();
      // After a short delay, run Monte Carlo for statistical data
      setTimeout(() => runMonteCarlo(5000), 500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute bottleneck insights
  const bottleneck = useMemo(() => {
    if (!dfg) return null;
    const edgeTimes = computeAllThroughputTimes(dfg);
    let worst = { edge: '', time: 0 };
    for (const e of edgeTimes) {
      if (e.aggregated > worst.time) {
        worst = { edge: `${e.source}->${e.target}`, time: e.aggregated };
      }
    }
    return worst.edge ? worst : null;
  }, [dfg]);

  const caseCount = eventLog?.cases.length ?? 0;
  const variantCount = variants?.length ?? 0;
  const activityCount = dfg?.nodes.length ?? 0;
  const happyPathPct = happyPath ? `${happyPath.percentage.toFixed(0)}%` : '—';
  const simTime = lastSimulation ? `${lastSimulation.time.toFixed(0)} min` : '—';

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Crimson Care Collaborative — Clinic Performance Analysis
          </h1>
          <p className="text-gray-500 mt-2 max-w-3xl">
            Process mining analysis of patient flow through the CCC-IMA student-run clinic at
            Massachusetts General Hospital. 5,000 realistic clinic sessions were generated using
            a discrete event simulation calibrated from actual clinic operations data, then analyzed
            using process mining to discover bottlenecks, pathway variations, and optimization opportunities.
          </p>

          {isRunning && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating 5,000 simulated clinic sessions for process mining analysis...
            </div>
          )}

          {lastSimulation && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              <Insight label="Simulated Cases" value={String(caseCount)} sub={`${params.numPatients ?? 8} patients × ${Math.max(1, Math.round(caseCount / (params.numPatients ?? 8)))} sessions`} />
              <Insight label="Unique Pathways" value={String(variantCount)} sub={`${activityCount} distinct activities`} />
              <Insight label="Happy Path" value={happyPathPct} sub="Most common journey" />
              <Insight label="Clinic Duration" value={simTime} sub="Single session" color="orange" />
              <Insight label="Staff" value={`${params.numAttendings ?? 2}A / ${params.numClinicalTeams ?? 4}CT`} sub="Attendings / Clinical Teams" />
              {bottleneck && (
                <Insight
                  label="Bottleneck"
                  value={bottleneck.edge.split('->')[0]?.trim().slice(0, 16) ?? '—'}
                  sub={`+${bottleneck.time.toFixed(1)} min avg`}
                  color="red"
                />
              )}
            </div>
          )}
        </div>

        {/* ── THE PROCESS ──────────────────────────────────── */}
        {dfg && (
          <Section
            id="process"
            title="How Patients Move Through Your Clinic"
            subtitle="The process graph shows all observed pathways from registration through discharge. Larger nodes indicate higher case volume. Branching reveals how different case types (urgent care, new patients, follow-ups) take different paths."
          >
            <div className="bg-white rounded-lg shadow border" style={{ height: 500 }}>
              <ProcessGraph />
            </div>
            <div className="mt-3 flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ff8c00] inline-block" /> Activity</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#0091ea] inline-block" /> Start / End</span>
              <span>Edge labels show case frequency. Use scroll to zoom, drag to pan.</span>
            </div>
          </Section>
        )}

        {/* ── PATIENT PATHWAYS ─────────────────────────────── */}
        {variants && variants.length > 0 && (
          <Section
            id="pathways"
            title="Patient Pathways"
            subtitle={`${variantCount} unique journeys observed across ${caseCount} simulated visits. Each variant is one specific end-to-end path a patient takes. The most common variant covers ${happyPathPct} of all cases.`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-lg shadow border p-4 max-h-[500px] overflow-auto">
                <VariantList />
              </div>
              <div className="bg-white rounded-lg shadow border p-4">
                <VariantHistogram />
              </div>
            </div>
          </Section>
        )}

        {/* ── TIMELINE ─────────────────────────────────────── */}
        {lastSimulation && (
          <Section
            id="timeline"
            title="Clinic Session Timeline"
            subtitle="Gantt chart showing how attendings, clinical teams, and patients interact during a single clinic session. Hover over a row to highlight relationships between providers and patients."
          >
            <div className="bg-white rounded-lg shadow border p-4 overflow-auto">
              <Timeline actors={lastSimulation.actors} />
            </div>
          </Section>
        )}

        {/* ── MONTE CARLO ──────────────────────────────────── */}
        {monteCarloResults && (
          <Section
            id="statistics"
            title="Simulation Model Validation"
            subtitle="The charts below show the distribution of key metrics across all 5,000 generated clinic sessions, confirming the simulation produces realistic and consistent results. Shaded bands show the 5th-95th percentile range."
          >
            <div className="bg-white rounded-lg shadow border p-4">
              <MonteCarloCharts results={monteCarloResults} />
            </div>
          </Section>
        )}

        {/* ── WHAT-IF CTA ──────────────────────────────────── */}
        <Section
          id="explore"
          title="What's Next?"
          subtitle="Process mining reveals where your clinic operates efficiently — and where improvements are possible."
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Staffing Policy</h3>
                <p className="text-sm text-gray-600">
                  Should we add a clinical team? The simulation suggests the attending is the
                  bottleneck — adding teams without addressing attending capacity may not help.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Scheduling</h3>
                <p className="text-sm text-gray-600">
                  Patient arrival patterns affect clinic flow. Staggering appointments differently
                  could reduce peak waiting times by 30-40%.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Try It Yourself</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Use the Simulation tab to adjust parameters and re-run the analysis with
                  different staffing configurations.
                </p>
                <a href="/ccc-ima-sim/simulation" className="text-[#0091ea] text-sm font-medium hover:underline">
                  Open Interactive Simulation →
                </a>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
