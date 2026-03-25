/**
 * Monte Carlo simulation result charts.
 * Renders all 10 chart types using Recharts, matching legacy/index.html showMonteCarloResults().
 */
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import type { Stats } from '@/core/math';
import { Simulation } from '@/core/simulation';
import type {
  MonteCarloResults,
  MCPatientResult,
  MCClinicalTeamResult,
  MCAttendingResult,
} from '@/types/monte-carlo';

// -- Colors ------------------------------------------------------------------

const COLORS = {
  Patient: { rgb: 'rgb(51,102,153)', band: 'rgba(51,102,153,0.15)', solid: '#336699' },
  ClinicalTeam: { rgb: 'rgb(51,153,102)', band: 'rgba(51,153,102,0.15)', solid: '#339966' },
  Attending: { rgb: 'rgb(102,51,153)', band: 'rgba(102,51,153,0.15)', solid: '#663399' },
} as const;

// -- Helpers -----------------------------------------------------------------

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}

/** Build histogram bins from raw samples. */
function buildHistogram(
  samples: ArrayLike<number>,
  min: number,
  max: number,
  nBins: number,
): { bin: number; count: number }[] {
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

// -- Shared: Confidence Band Chart -------------------------------------------

interface ConfidenceBandProps {
  title: string;
  data: { label: string; pct05: number; pct25: number; pct50: number; pct75: number; pct95: number; mean: number }[];
  color: (typeof COLORS)[keyof typeof COLORS];
  yDomain?: [number, number];
  yFormatter?: (v: number) => string;
}

function ConfidenceBandChart({ title, data, color, yDomain, yFormatter = formatDuration }: ConfidenceBandProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={50} />
          <YAxis domain={yDomain} tickFormatter={yFormatter} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => yFormatter(v as number)} />
          {/* 5-95 band */}
          <Area
            dataKey="pct95"
            stroke="none"
            fill={color.band}
            fillOpacity={1}
            isAnimationActive={false}
          />
          <Area
            dataKey="pct05"
            stroke="none"
            fill="#fff"
            fillOpacity={1}
            isAnimationActive={false}
          />
          {/* 25-75 band */}
          <Area
            dataKey="pct75"
            stroke={color.solid}
            strokeWidth={1}
            strokeDasharray="4 4"
            fill={color.band}
            fillOpacity={1}
            isAnimationActive={false}
          />
          <Area
            dataKey="pct25"
            stroke={color.solid}
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="#fff"
            fillOpacity={1}
            isAnimationActive={false}
          />
          {/* Median line */}
          <Area
            dataKey="pct50"
            stroke={color.solid}
            strokeWidth={3}
            fill="none"
            isAnimationActive={false}
          />
          {/* Mean dots */}
          <Area
            dataKey="mean"
            stroke={color.solid}
            strokeWidth={0}
            fill={color.solid}
            fillOpacity={1}
            dot={{ r: 3, fill: color.solid }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
            type="linear"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Extract confidence band data from an array of Stats keyed by label. */
function bandData(labels: string[], stats: (Stats | undefined)[]): ConfidenceBandProps['data'] {
  return labels.map((label, i) => {
    const s = stats[i];
    return {
      label,
      pct05: s?.pct05 ?? 0,
      pct25: s?.pct25 ?? 0,
      pct50: s?.pct50 ?? 0,
      pct75: s?.pct75 ?? 0,
      pct95: s?.pct95 ?? 0,
      mean: s?.mean ?? 0,
    };
  });
}

// -- Chart 1: Clinic End Time Histogram --------------------------------------

function ClinicEndTimeHistogram({ results }: { results: MonteCarloResults }) {
  const { times, params } = results;
  const data = buildHistogram(times.samples, params.targetTime - 120, params.targetTime + 90, 211);
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1 text-gray-700">Clinic End Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="bin"
            tickFormatter={(v: number) => Simulation.formatTime(v)}
            tick={{ fontSize: 11 }}
            type="number"
            domain={[params.targetTime - 60, params.targetTime + 60]}
          />
          <YAxis tick={{ fontSize: 11 }} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: -35 }} />
          <Tooltip labelFormatter={(v) => Simulation.formatTime(v as number)} />
          {/* Percentile shading */}
          <ReferenceArea x1={times.pct05} x2={times.pct95} fill="#000" fillOpacity={0.05} />
          <ReferenceArea x1={times.pct25} x2={times.pct75} fill="#000" fillOpacity={0.05} />
          <ReferenceLine x={times.mean} stroke={COLORS.Patient.solid} strokeWidth={2} />
          <Area
            dataKey="count"
            stroke="none"
            fill={COLORS.Patient.solid}
            fillOpacity={0.5}
            type="stepAfter"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// -- Charts 2-6: Confidence Bands (patients & clinical teams) ----------------

function PatientConfidenceCharts({ results }: { results: MonteCarloResults }) {
  const labels = results.patients.map((p) => p.label);
  const color = COLORS.Patient;
  return (
    <>
      <ConfidenceBandChart
        title="Patient Total Time in Clinic"
        data={bandData(labels, results.patients.map((p) => p.totalTimeInClinic))}
        color={color}
        yDomain={[30, 180]}
      />
      <ConfidenceBandChart
        title="Patient Waiting for Clinical Team"
        data={bandData(labels, results.patients.map((p) => p.waitingForClinicalTeam))}
        color={color}
        yDomain={[0, 60]}
      />
      <ConfidenceBandChart
        title="Patient Waiting for Attending"
        data={bandData(
          labels,
          results.patients.map((p) => p.timeInState['PATIENT_WAITING_FOR_ATTENDING']),
        )}
        color={color}
        yDomain={[0, 60]}
      />
    </>
  );
}

function ClinicalTeamConfidenceCharts({ results }: { results: MonteCarloResults }) {
  const labels = results.clinicalTeams.map((c) => c.label);
  const color = COLORS.ClinicalTeam;
  return (
    <>
      <ConfidenceBandChart
        title="Clinical Team Waiting for Patient"
        data={bandData(
          labels,
          results.clinicalTeams.map((c) => c.timeInState['CLINICAL_TEAM_WAITING_FOR_PATIENT']),
        )}
        color={color}
        yDomain={[0, 60]}
      />
      <ConfidenceBandChart
        title="Clinical Team Waiting for Attending"
        data={bandData(labels, results.clinicalTeams.map((c) => c.waitingForAttending))}
        color={color}
        yDomain={[0, 60]}
      />
    </>
  );
}

// -- Charts 7-8: Patients Seen (stacked bar) ---------------------------------

function PatientsSeenChart({
  title,
  labels,
  statsArr,
  color,
}: {
  title: string;
  labels: string[];
  statsArr: Stats[];
  color: string;
}) {
  // Find global min/max across all actors
  let globalMin = Infinity;
  let globalMax = -Infinity;
  for (const s of statsArr) {
    if (s.min < globalMin) globalMin = s.min;
    if (s.max > globalMax) globalMax = s.max;
  }

  // For each count value, compute % of simulations per actor
  const countValues: number[] = [];
  for (let i = globalMin; i <= globalMax; i++) countValues.push(i);

  const data = labels.map((label, actorIdx) => {
    const row: Record<string, string | number> = { label };
    const samples = statsArr[actorIdx].samples;
    for (const count of countValues) {
      let n = 0;
      for (let j = 0; j < samples.length; j++) {
        if (samples[j] === count) n++;
      }
      row[`c${count}`] = (n / samples.length) * 100;
    }
    return row;
  });

  // Distinct color palette instead of opacity stacking
  const [r, g, b] = color.split(',').map(Number);
  const palette = countValues.map((_, idx) => {
    const t = countValues.length > 1 ? idx / (countValues.length - 1) : 0.5;
    // Interpolate from light to dark
    const lr = Math.round(r + (255 - r) * (1 - t) * 0.6);
    const lg = Math.round(g + (255 - g) * (1 - t) * 0.6);
    const lb = Math.round(b + (255 - b) * (1 - t) * 0.6);
    return `rgb(${lr},${lg},${lb})`;
  });

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1 text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${(v as number).toFixed(1)}%`} />
          {countValues.map((count, idx) => (
            <Bar
              key={count}
              dataKey={`c${count}`}
              name={`${count} patients`}
              stackId="a"
              fill={palette[idx]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// -- Chart 9: Seen by Preferred Provider -------------------------------------

function SeenByPreferredChart({ results }: { results: MonteCarloResults }) {
  const data = results.patients.map((p) => ({
    label: p.label,
    clinicalTeam: p.seenByPreferredClinicalTeam,
    attending: p.seenByPreferredAttending,
  }));

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1 text-gray-700">Seen by Preferred Provider</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${(v as number).toFixed(1)}%`} />
          <Legend />
          <Line
            dataKey="clinicalTeam"
            name="Clinical Team"
            stroke={COLORS.ClinicalTeam.solid}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
          <Line
            dataKey="attending"
            name="Attending"
            stroke={COLORS.Attending.solid}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// -- Chart 10: Attending Waiting for Clinical Team (overlaid histograms) ------

function AttendingWaitingHistogram({ results }: { results: MonteCarloResults }) {
  const range: [number, number] = [0, 60];
  const nBins = range[1] - range[0] + 1;

  // Build one histogram series per attending
  const allSeries: { bin: number;[key: string]: number }[] = [];
  const binValues: number[] = [];
  for (let i = 0; i < nBins; i++) binValues.push(range[0] + i);

  // Initialize bins
  const combined: Record<string, number>[] = binValues.map((bin) => ({ bin }));

  results.attendings.forEach((att, idx) => {
    const stats = att.timeInState['ATTENDING_WAITING_FOR_CLINICAL_TEAM'];
    if (!stats) return;
    const h = buildHistogram(stats.samples, range[0], range[1], nBins);
    h.forEach((pt, i) => {
      combined[i][`att${idx}`] = pt.count;
    });
  });

  const minOpacity = 0.2;
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1 text-gray-700">Attending Waiting for Clinical Team</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={combined} margin={{ top: 5, right: 20, bottom: 5, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="bin"
            tickFormatter={formatDuration}
            tick={{ fontSize: 11 }}
            type="number"
            domain={range}
          />
          <YAxis tick={{ fontSize: 11 }} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: -35 }} />
          <Tooltip labelFormatter={(v) => formatDuration(v as number)} />
          {results.attendings.map((att, idx) => {
            const opacity = minOpacity + (1 - minOpacity) * (idx + 1) / results.attendings.length;
            return (
              <Area
                key={att.id}
                dataKey={`att${idx}`}
                name={att.label}
                stroke="none"
                fill={COLORS.Attending.solid}
                fillOpacity={opacity}
                type="stepAfter"
                isAnimationActive={false}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// -- Section Header -----------------------------------------------------------

function ChartSectionHeader({ title }: { title: string }) {
  return (
    <div className="col-span-1 lg:col-span-2 mt-4 first:mt-0">
      <h3 className="text-base font-bold text-gray-800 border-l-4 border-[#0091ea] pl-3 py-1">
        {title}
      </h3>
    </div>
  );
}

// -- Main Component ----------------------------------------------------------

export function MonteCarloCharts({ results }: { results: MonteCarloResults }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Patient Experience */}
      <ChartSectionHeader title="Patient Experience" />
      <ClinicEndTimeHistogram results={results} />
      <PatientConfidenceCharts results={results} />

      {/* Staff Utilization */}
      <ChartSectionHeader title="Staff Utilization" />
      <ClinicalTeamConfidenceCharts results={results} />
      <PatientsSeenChart
        title="Patients Seen by Clinical Team"
        labels={results.clinicalTeams.map((c) => c.label)}
        statsArr={results.clinicalTeams.map((c) => c.patientsSeen)}
        color="51,153,102"
      />
      <PatientsSeenChart
        title="Patients Seen by Attending"
        labels={results.attendings.map((a) => a.label)}
        statsArr={results.attendings.map((a) => a.patientsSeen)}
        color="102,51,153"
      />

      {/* System Performance */}
      <ChartSectionHeader title="System Performance" />
      <SeenByPreferredChart results={results} />
      <AttendingWaitingHistogram results={results} />
    </div>
  );
}
