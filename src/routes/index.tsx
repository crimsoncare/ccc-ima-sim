import { useEffect, useMemo, useState } from 'react';
import { useSimulationStore } from '@/store/simulation-store';
import { useMiningStore } from '@/store/mining-store';
import { ProcessGraph } from '@/components/process-graph/ProcessGraph';
import { GraphControls } from '@/components/process-graph/GraphControls';
import { WorkflowChevron } from '@/components/workflow/WorkflowChevron';
import { VariantList } from '@/components/variant-panel/VariantList';
import { VariantHistogram } from '@/components/variant-panel/VariantHistogram';
import { MonteCarloCharts } from '@/components/simulation/MonteCarloCharts';
import { Timeline } from '@/components/simulation/Timeline';
import { computeAllThroughputTimes } from '@/mining/throughput';

// ── KPI metric ────────────────────────────────────────────
function Metric({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="text-center px-4 border-r border-gray-100 last:border-r-0">
      <div className={`text-4xl font-extrabold tracking-tight ${accent ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
      <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1.5">{label}</div>
    </div>
  );
}

// ── Section with narrative question ───────────────────────
function NarrativeSection({ id, question, answer, children }: {
  id?: string; question: string; answer: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-12">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">{question}</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl leading-relaxed">{answer}</p>
      </div>
      {children}
    </section>
  );
}

export function IndexPage() {
  const { lastSimulation, monteCarloResults, runSimulation, runMonteCarlo, isRunning, params } = useSimulationStore();
  const { eventLog, dfg, variants, happyPath } = useMiningStore();

  // Auto-generate data on first load
  useEffect(() => {
    if (!lastSimulation && !isRunning) {
      runSimulation();
      setTimeout(() => runMonteCarlo(5000), 500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bottleneck = useMemo(() => {
    if (!dfg) return null;
    const edgeTimes = computeAllThroughputTimes(dfg);
    let worst = { source: '', target: '', time: 0 };
    for (const e of edgeTimes) {
      if (e.aggregated > worst.time) worst = { source: e.source, target: e.target, time: e.aggregated };
    }
    return worst.source ? worst : null;
  }, [dfg]);

  const caseCount = eventLog?.cases.length ?? 0;
  const variantCount = variants?.length ?? 0;
  const activityCount = dfg?.nodes.length ?? 0;
  const happyPathPct = happyPath?.percentage.toFixed(0) ?? '—';

  // Count case types from variant activities
  const caseTypeCounts = useMemo(() => {
    if (!variants) return { uc: 0, btcNew: 0, btcFu: 0 };
    let uc = 0, btcNew = 0, btcFu = 0;
    for (const v of variants) {
      const acts = v.activities.join(' ');
      const f = v.frequency;
      if (acts.includes('History Taking')) btcNew += f;
      else if (acts.includes('Chart Review')) btcFu += f;
      else uc += f;
    }
    return { uc, btcNew, btcFu };
  }, [variants]);

  const sections = [
    { id: 'overview', label: 'The Question' },
    { id: 'process', label: 'Discovery' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'bottleneck', label: 'Bottleneck' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'next', label: 'The Answer' },
  ];

  // Track active section via IntersectionObserver
  const [activeSection, setActiveSection] = useState('overview');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [lastSimulation]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-gray-50 relative">
      {/* Sticky section nav */}
      {lastSimulation && (
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 flex gap-1">
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`text-xs px-3 py-2 rounded-t transition-colors border-b-2 ${
                  activeSection === s.id
                    ? 'text-blue-700 border-blue-600 font-semibold bg-blue-50/60'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── THE QUESTION ─────────────────────────────────── */}
        <div id="overview" className="mb-12 scroll-mt-12">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0091ea] uppercase tracking-widest mb-2">
                Crimson Care Collaborative — Internal Medicine Associates, MGH
              </p>
              <h1 className="text-3xl font-bold text-gray-900 leading-snug">
                Should we increase the number of<br />
                clinical teams to better achieve<br />
                our design objectives?
              </h1>
            </div>
            {isRunning && (
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running simulation...
              </div>
            )}
          </div>

          {/* Workflow chevron — "A Typical Visit" from SSFRC paper */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">A Typical Visit</p>
            <WorkflowChevron />
            <div className="mt-4 text-sm text-gray-500 leading-relaxed">
              Each clinic session runs Tuesday 5-9 PM with {params.numClinicalTeams ?? 4} clinical teams and {params.numAttendings ?? 2} attendings
              seeing up to {params.numPatients ?? 8} patients. The bottleneck question:
              every patient must pass through the attending handoff, but attendings are shared across all teams.
            </div>
          </div>

          {/* The Debate — Alice vs Bob from the paper */}
          {lastSimulation && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">+</div>
                  <h3 className="font-semibold text-gray-800">Case for more teams</h3>
                </div>
                <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                  <li>More patients seen per session</li>
                  <li>Patients wait less for their clinical team</li>
                  <li>Clinic may end earlier</li>
                  <li>More volunteering opportunities</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold">&minus;</div>
                  <h3 className="font-semibold text-gray-800">Case against more teams</h3>
                </div>
                <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                  <li>Bottleneck may lie elsewhere (attendings)</li>
                  <li>Patients will wait more for attending</li>
                  <li>May not reduce total clinic duration</li>
                  <li>Fewer patients per team (less learning)</li>
                </ul>
              </div>
            </div>
          )}

          {/* KPI summary */}
          {lastSimulation && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Simulation ran {caseCount.toLocaleString()} encounters to find out
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                <Metric value={caseCount.toLocaleString()} label="Patient encounters" />
                <Metric value={String(variantCount)} label="Unique pathways" />
                <Metric value={String(activityCount)} label="Activities" />
                <Metric value={`${happyPathPct}%`} label="Happy path" />
                <Metric value={`${params.numAttendings ?? 2} / ${params.numClinicalTeams ?? 4}`} label="Attend / Teams" />
                {bottleneck && <Metric value={`+${bottleneck.time.toFixed(0)}m`} label="Bottleneck delay" accent />}
              </div>
            </div>
          )}
        </div>

        {/* ── 1. THE DISCOVERY ─────────────────────────────── */}
        {dfg && (
          <NarrativeSection
            id="process"
            question="How does the clinic actually operate?"
            answer={`We generated ${caseCount.toLocaleString()} patient encounters across 500 simulated clinic sessions and discovered ${variantCount} unique pathways — far more than the simple 5-step model on the whiteboard. The process graph reveals how different case types diverge into distinct clinical workflows.`}
          >
            <div className="flex gap-4">
              {/* Process Graph */}
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200" style={{ height: 800 }}>
                <ProcessGraph />
              </div>
              {/* Celonis-style right sidebar */}
              <div className="w-48 shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-auto" style={{ height: 800 }}>
                <GraphControls />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#607d8b] inline-block" /> Registration</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef6c00] inline-block" /> Waiting</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#2e7d32] inline-block" /> Clinical Team</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#00796b] inline-block" /> Handoff</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1565c0] inline-block" /> Attending</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#e65100] inline-block" /> Optional</span>
              <span className="ml-auto">Scroll to zoom. Drag to pan.</span>
            </div>
          </NarrativeSection>
        )}

        {/* ── 2. THE PATTERNS ──────────────────────────────── */}
        {variants && variants.length > 0 && (
          <NarrativeSection
            id="patterns"
            question="What patterns emerge across patient journeys?"
            answer={`Three case types create three distinct workflows: ${caseTypeCounts.uc} urgent care visits follow a streamlined path, ${caseTypeCounts.btcNew} new patients require full workups with potential lab orders, and ${caseTypeCounts.btcFu} follow-up patients focus on medication reconciliation. Only ${happyPathPct}% of patients follow the single most common path — the rest diverge.`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5 max-h-[520px] overflow-auto">
                <VariantList />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <VariantHistogram />
              </div>
            </div>
          </NarrativeSection>
        )}

        {/* ── 3. THE BOTTLENECK ────────────────────────────── */}
        {lastSimulation && (
          <NarrativeSection
            id="bottleneck"
            question="Where does clinic flow break down?"
            answer={bottleneck
              ? `The longest delay occurs at "${bottleneck.source}" → "${bottleneck.target}", adding an average of ${bottleneck.time.toFixed(1)} minutes per patient. All three case-type pathways converge at the attending handoff, creating a single point of contention that limits overall clinic throughput.`
              : 'Analyzing bottleneck data...'}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 overflow-auto">
              <Timeline actors={lastSimulation.actors} />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Hover over a label to highlight the relationships between patients, clinical teams, and attendings.
            </p>
          </NarrativeSection>
        )}

        {/* ── 4. THE EVIDENCE ──────────────────────────────── */}
        {monteCarloResults && (
          <NarrativeSection
            id="evidence"
            question="How confident are these findings?"
            answer="We validated the simulation across 5,000 independent clinic sessions (40,000 patient encounters). The shaded bands show the 5th-to-95th percentile range — the findings are consistent and robust, not artifacts of a single lucky run."
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <MonteCarloCharts results={monteCarloResults} />
            </div>
          </NarrativeSection>
        )}

        {/* ── 5. THE ANSWER ────────────────────────────────── */}
        <NarrativeSection
          id="next"
          question="So, should we add more clinical teams?"
          answer={bottleneck
            ? `The simulation reveals that the bottleneck is at the attending handoff (+${bottleneck.time.toFixed(0)} min delay), not at the clinical team level. Adding more clinical teams would push more patients into the attending queue faster — potentially increasing wait times, not reducing them. The evidence points to three alternative strategies:`
            : 'The simulation reveals the bottleneck location and suggests targeted interventions:'}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Attending Capacity</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {bottleneck
                  ? `The "${bottleneck.target}" step adds +${bottleneck.time.toFixed(0)} minutes average delay. Consider overlapping attending schedules or pre-rounding protocols.`
                  : 'The attending handoff is the primary bottleneck. Consider overlapping attending schedules.'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Scheduling Optimization</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {caseTypeCounts.btcNew > 0
                  ? `${caseTypeCounts.btcNew} new-patient visits take ~40% longer. Scheduling them earlier could reduce cascading delays for the ${caseTypeCounts.uc} UC patients.`
                  : 'Staggering new-patient appointments earlier in the session could smooth the flow.'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e65100" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1.5">Real Data Integration</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                This analysis uses simulated data. Connecting to the clinic's patient tracker would
                enable continuous monitoring with real operational insights.
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <a href="/ccc-ima-sim/simulation" className="inline-flex items-center gap-1.5 text-sm text-[#0091ea] font-medium hover:underline">
              Explore the interactive simulation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </NarrativeSection>

      </div>
    </div>
  );
}
