/**
 * Side-by-side comparison of two MC configurations.
 * Matches the SSFRC 2017 paper slides 13-15: 4 CTs vs 6 CTs.
 */
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Simulation } from '@/core/simulation';
import type { MonteCarloResults } from '@/types/monte-carlo';
import type { Stats } from '@/core/math';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function buildHistogram(samples: ArrayLike<number>, min: number, max: number, nBins: number) {
  const width = (max - min) / (nBins - 1);
  const counts = new Array(nBins).fill(0);
  const bins: number[] = [];
  for (let i = 0; i < nBins; i++) bins.push(i * width + min);
  for (let i = 0; i < samples.length; i++) {
    const idx = Math.floor((samples[i] - min) / width);
    if (idx >= 0 && idx < nBins) counts[idx]++;
  }
  return bins.map((bin, i) => ({ bin, count: counts[i] }));
}

function KPI({ label, baseline, comparison, unit, better }: {
  label: string; baseline: string; comparison: string; unit?: string;
  better: 'lower' | 'higher';
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-center justify-center gap-3">
        <span className="text-lg font-bold text-gray-700">{baseline}</span>
        <span className="text-gray-300">vs</span>
        <span className="text-lg font-bold text-blue-600">{comparison}</span>
      </div>
      {unit && <div className="text-[10px] text-gray-400">{unit}</div>}
    </div>
  );
}

function DualHistogram({ title, baseline, comparison, baseLabel, compLabel }: {
  title: string;
  baseline: Stats;
  comparison: Stats;
  baseLabel: string;
  compLabel: string;
}) {
  const min = Math.min(baseline.pct05, comparison.pct05) - 10;
  const max = Math.max(baseline.pct95, comparison.pct95) + 10;
  const baseData = buildHistogram(baseline.samples, min, max, 80);
  const compData = buildHistogram(comparison.samples, min, max, 80);

  // Merge into one dataset
  const merged = baseData.map((d, i) => ({
    bin: d.bin,
    base: d.count,
    comp: compData[i]?.count ?? 0,
  }));

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={merged} margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="bin"
            tickFormatter={formatDuration}
            tick={{ fontSize: 10 }}
            type="number"
            domain={[min + 10, max - 10]}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip labelFormatter={(v) => formatDuration(v as number)} />
          <Area
            dataKey="base"
            name={baseLabel}
            stroke="#64748b"
            fill="#94a3b8"
            fillOpacity={0.4}
            type="stepAfter"
            isAnimationActive={false}
          />
          <Area
            dataKey="comp"
            name={compLabel}
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.4}
            type="stepAfter"
            isAnimationActive={false}
          />
          <ReferenceLine x={baseline.mean} stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />
          <ReferenceLine x={comparison.mean} stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 text-[10px] text-gray-500 mt-1">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gray-400 inline-block" /> {baseLabel} (mean: {formatDuration(baseline.mean)})</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> {compLabel} (mean: {formatDuration(comparison.mean)})</span>
      </div>
    </div>
  );
}

function DualConfidenceBand({ title, baseLabel, compLabel, baseStats, compStats }: {
  title: string;
  baseLabel: string;
  compLabel: string;
  baseStats: (Stats | undefined)[];
  compStats: (Stats | undefined)[];
}) {
  const labels = baseStats.map((_, i) => `PT${i + 1}`);
  const data = labels.map((label, i) => {
    const b = baseStats[i];
    const c = compStats[i];
    return {
      label,
      baseMed: b?.pct50 ?? 0, base25: b?.pct25 ?? 0, base75: b?.pct75 ?? 0,
      compMed: c?.pct50 ?? 0, comp25: c?.pct25 ?? 0, comp75: c?.pct75 ?? 0,
    };
  });

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={formatDuration} tick={{ fontSize: 10 }} domain={[0, 'auto']} />
          <Tooltip formatter={(v) => formatDuration(v as number)} />
          {/* Baseline band */}
          <Area dataKey="base75" stroke="none" fill="#94a3b8" fillOpacity={0.25} isAnimationActive={false} />
          <Area dataKey="base25" stroke="none" fill="#f8f9fa" fillOpacity={1} isAnimationActive={false} />
          <Area dataKey="baseMed" stroke="#64748b" strokeWidth={2.5} fill="none" isAnimationActive={false} />
          {/* Comparison band */}
          <Area dataKey="comp75" stroke="none" fill="#3b82f6" fillOpacity={0.2} isAnimationActive={false} />
          <Area dataKey="comp25" stroke="none" fill="#f8f9fa" fillOpacity={1} isAnimationActive={false} />
          <Area dataKey="compMed" stroke="#2563eb" strokeWidth={2.5} fill="none" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 text-[10px] text-gray-500 mt-1">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gray-400 inline-block" /> {baseLabel}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> {compLabel}</span>
      </div>
    </div>
  );
}

export function ComparisonCharts({ baseline, comparison, baseLabel, compLabel }: {
  baseline: MonteCarloResults;
  comparison: MonteCarloResults;
  baseLabel: string;
  compLabel: string;
}) {
  // Summary KPIs
  const baseEndTime = formatDuration(baseline.times.pct50);
  const compEndTime = formatDuration(comparison.times.pct50);
  const baseWaitCT = baseline.patients.reduce((s, p) => s + (p.waitingForClinicalTeam?.mean ?? 0), 0) / baseline.patients.length;
  const compWaitCT = comparison.patients.reduce((s, p) => s + (p.waitingForClinicalTeam?.mean ?? 0), 0) / comparison.patients.length;
  const baseWaitAtt = baseline.patients.reduce((s, p) => s + (p.waitingForAttending?.mean ?? 0), 0) / baseline.patients.length;
  const compWaitAtt = comparison.patients.reduce((s, p) => s + (p.waitingForAttending?.mean ?? 0), 0) / comparison.patients.length;

  return (
    <div className="space-y-6">
      {/* KPI comparison row */}
      <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
        <KPI label="Median Clinic End" baseline={baseEndTime} comparison={compEndTime} better="lower" />
        <KPI label="Avg Wait for CT" baseline={`${baseWaitCT.toFixed(0)}m`} comparison={`${compWaitCT.toFixed(0)}m`} unit="minutes" better="lower" />
        <KPI label="Avg Wait for Attending" baseline={`${baseWaitAtt.toFixed(0)}m`} comparison={`${compWaitAtt.toFixed(0)}m`} unit="minutes" better="lower" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DualHistogram
          title="Clinic End Time Distribution"
          baseline={baseline.times}
          comparison={comparison.times}
          baseLabel={baseLabel}
          compLabel={compLabel}
        />
        <DualConfidenceBand
          title="Patient Waiting for Clinical Team"
          baseLabel={baseLabel}
          compLabel={compLabel}
          baseStats={baseline.patients.map(p => p.waitingForClinicalTeam)}
          compStats={comparison.patients.map(p => p.waitingForClinicalTeam)}
        />
        <DualConfidenceBand
          title="Patient Waiting for Attending"
          baseLabel={baseLabel}
          compLabel={compLabel}
          baseStats={baseline.patients.map(p => p.timeInState['PATIENT_WAITING_FOR_ATTENDING'])}
          compStats={comparison.patients.map(p => p.timeInState['PATIENT_WAITING_FOR_ATTENDING'])}
        />
        <DualConfidenceBand
          title="Patient Total Time in Clinic"
          baseLabel={baseLabel}
          compLabel={compLabel}
          baseStats={baseline.patients.map(p => p.totalTimeInClinic)}
          compStats={comparison.patients.map(p => p.totalTimeInClinic)}
        />
      </div>
    </div>
  );
}
