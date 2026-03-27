import { useState, useMemo, useCallback } from 'react';
import { Actor, StateCodes, StateLabels } from '@/core/actor';
import { Simulation } from '@/core/simulation';

// Color map keyed by state code — light-mode palette with solid fills and visible outlines
const STATE_COLORS: Record<number, { bg: string; color: string; border?: string }> = {
  // Patient states
  [StateCodes.PATIENT_BEFORE_ARRIVAL]: { bg: 'transparent', color: 'transparent' },
  [StateCodes.PATIENT_CHECKING_IN]: { bg: '#b0bec5', color: '#fff' },
  [StateCodes.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM]: {
    bg: '#fff8e1', color: '#f9a825',
    border: 'inset 0 0 0 1.5px #f9a825',
  },
  [StateCodes.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM]: {
    bg: '#ffebee', color: '#e53935',
    border: 'inset 0 0 0 1.5px #e53935',
  },
  [StateCodes.PATIENT_CLINICAL_TEAM_MEETING]: { bg: '#2e7d32', color: '#fff' },
  [StateCodes.PATIENT_WAITING_FOR_ATTENDING]: {
    bg: '#fff3e0', color: '#ef6c00',
    border: 'inset 0 0 0 1.5px #ef6c00',
  },
  [StateCodes.PATIENT_ATTENDING_MEETING]: { bg: '#1565c0', color: '#fff' },
  [StateCodes.PATIENT_CHECKING_OUT]: { bg: '#b0bec5', color: '#fff' },
  [StateCodes.PATIENT_FINISHED]: { bg: 'transparent', color: 'transparent' },
  // ClinicalTeam states
  [StateCodes.CLINICAL_TEAM_GROUP_HUDDLE]: { bg: '#b0bec5', color: '#fff' },
  [StateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT]: {
    bg: '#fff3e0', color: '#ef6c00',
    border: 'inset 0 0 0 1.5px #ef6c00',
  },
  [StateCodes.CLINICAL_TEAM_WAITING_FOR_PREFERRED_ATTENDING]: {
    bg: '#fff8e1', color: '#f9a825',
    border: 'inset 0 0 0 1.5px #f9a825',
  },
  [StateCodes.CLINICAL_TEAM_WAITING_FOR_ANY_ATTENDING]: {
    bg: '#ffebee', color: '#e53935',
    border: 'inset 0 0 0 1.5px #e53935',
  },
  [StateCodes.CLINICAL_TEAM_ATTENDING_MEETING]: { bg: '#00796b', color: '#fff' },
  [StateCodes.CLINICAL_TEAM_WAITING_FOR_PATIENT_ATTENDING_MEETING]: {
    bg: '#fff3e0', color: '#ef6c00',
    border: 'inset 0 0 0 1.5px #ef6c00',
  },
  // Attending states
  [StateCodes.ATTENDING_WAITING_FOR_FIRST_CLINICAL_TEAM]: { bg: 'transparent', color: 'transparent' },
  [StateCodes.ATTENDING_WAITING_FOR_CLINICAL_TEAM]: {
    bg: '#fff3e0', color: '#ef6c00',
    border: 'inset 0 0 0 1.5px #ef6c00',
  },
  [StateCodes.ATTENDING_WAITING_FOR_PATIENT_ATTENDING_MEETING]: {
    bg: '#fff3e0', color: '#ef6c00',
    border: 'inset 0 0 0 1.5px #ef6c00',
  },
};

const SCALE = 5; // px per minute, matching legacy
const TOTAL_TICKS = 13; // 0 to 180 min in 15-min increments

interface TimelineProps {
  actors: Actor[];
  message?: string;
}

export function Timeline({ actors, message }: TimelineProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group actors by type, preserving simulation order
  const { attendings, clinicalTeams, patients } = useMemo(() => {
    const att: Actor[] = [];
    const ct: Actor[] = [];
    const pt: Actor[] = [];
    for (const a of actors) {
      if (a.type === 'Attending') att.push(a);
      else if (a.type === 'ClinicalTeam') ct.push(a);
      else if (a.type === 'Patient') pt.push(a);
    }
    return { attendings: att, clinicalTeams: ct, patients: pt };
  }, [actors]);

  // Build highlight set: which actor IDs should be visible when hovering
  const highlightSet = useMemo(() => {
    if (!hoveredId) return null;
    const set = new Set<string>();
    set.add(hoveredId);

    const actor = actors.find((a) => a.id === hoveredId);
    if (!actor) return set;

    if (actor.type === 'Patient') {
      if (actor.clinicalTeam) set.add(actor.clinicalTeam.id);
      if (actor.attending) set.add(actor.attending.id);
    } else if (actor.type === 'ClinicalTeam') {
      for (const p of actor.patientsSeen ?? []) {
        set.add(p.id);
        if (p.attending) set.add(p.attending.id);
      }
    } else if (actor.type === 'Attending') {
      for (const p of actor.patientsSeen ?? []) {
        set.add(p.id);
        if (p.clinicalTeam) set.add(p.clinicalTeam.id);
      }
    }
    return set;
  }, [hoveredId, actors]);

  const handleMouseEnter = useCallback((id: string) => setHoveredId(id), []);
  const handleMouseLeave = useCallback(() => setHoveredId(null), []);

  const timelineWidth = TOTAL_TICKS * 15 * SCALE;

  return (
    <div className="bg-gray-50 rounded-lg p-6 text-gray-500 text-sm border border-gray-200" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      {message && (
        <div className="mb-2 text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: message }} />
      )}
      {/* Time axis top */}
      <TimeRow
        actor={null}
        timelineWidth={timelineWidth}
        highlightSet={null}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isLast={false}
      />
      {/* Attendings */}
      {attendings.map((a, i) => (
        <TimeRow
          key={a.id}
          actor={a}
          timelineWidth={timelineWidth}
          highlightSet={highlightSet}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          isLast={i === attendings.length - 1}
        />
      ))}
      {/* Clinical Teams */}
      {clinicalTeams.map((a, i) => (
        <TimeRow
          key={a.id}
          actor={a}
          timelineWidth={timelineWidth}
          highlightSet={highlightSet}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          isLast={i === clinicalTeams.length - 1}
        />
      ))}
      {/* Patients */}
      {patients.map((a, i) => (
        <TimeRow
          key={a.id}
          actor={a}
          timelineWidth={timelineWidth}
          highlightSet={highlightSet}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          isLast={i === patients.length - 1}
        />
      ))}
      {/* Time axis bottom */}
      <TimeRow
        actor={null}
        timelineWidth={timelineWidth}
        highlightSet={null}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isLast={false}
      />
      {/* Color legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-3 border-t border-gray-200 text-[11px]">
        <LegendItem color="#2e7d32" label="CT Meeting" />
        <LegendItem color="#00796b" label="CT-Attending Meeting" />
        <LegendItem color="#1565c0" label="Attending Meeting" />
        <LegendItem color="#b0bec5" label="Check-in / Check-out" />
        <LegendItem color="#f9a825" label="Wait (preferred)" border />
        <LegendItem color="#ef6c00" label="Wait (attending)" border />
        <LegendItem color="#e53935" label="Wait (any available)" border />
      </div>
    </div>
  );
}

interface TimeRowProps {
  actor: Actor | null; // null = time axis row
  timelineWidth: number;
  highlightSet: Set<string> | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  isLast: boolean;
}

function LegendItem({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-gray-500">
      <span
        className="w-3 h-3 rounded-sm inline-block shrink-0"
        style={border
          ? { background: 'transparent', boxShadow: `inset 0 0 0 2px ${color}` }
          : { background: color }
        }
      />
      {label}
    </span>
  );
}

function TimeRow({ actor, timelineWidth, highlightSet, onMouseEnter, onMouseLeave, isLast }: TimeRowProps) {
  const isTimeAxis = actor === null;
  const dimmed = highlightSet !== null && actor !== null && !highlightSet.has(actor.id);

  return (
    <div
      className="flex items-center transition-opacity duration-200"
      style={{
        height: '1.6em',
        lineHeight: '1.6em',
        marginBottom: isLast ? '2em' : '1px',
        opacity: dimmed ? 0.25 : 1,
      }}
    >
      {/* Label */}
      <div
        className="shrink-0 overflow-hidden cursor-pointer select-none text-ellipsis whitespace-nowrap text-gray-600"
        style={{ width: '10em' }}
        onMouseEnter={actor ? () => onMouseEnter(actor.id) : undefined}
        onMouseLeave={actor ? onMouseLeave : undefined}
      >
        {actor?.id?.replace('ClinicalTeam', 'CT') ?? ''}
      </div>
      {/* Events track */}
      <div className="relative" style={{ width: timelineWidth, height: '1.6em' }}>
        {/* Tick marks */}
        {Array.from({ length: TOTAL_TICKS }, (_, i) => {
          const time = i * 15;
          const isHour = i % 4 === 0;
          return (
            <div
              key={`tick-${i}`}
              className="absolute top-0"
              style={{
                left: time * SCALE,
                width: 15 * SCALE,
                height: '1.6em',
                borderLeft: '1px solid #e0e0e0',
                color: isTimeAxis ? '#9e9e9e' : 'transparent',
                textAlign: 'left',
                paddingLeft: '0.5em',
                fontSize: '85%',
                lineHeight: '1.6em',
              }}
            >
              {isTimeAxis ? Simulation.formatTime(time) : ''}
            </div>
          );
        })}
        {/* State bars */}
        {actor?.timeline.map((event, i) => {
          const end = event.end ?? 0;
          const duration = end - event.start;
          if (duration <= 0) return null;
          const style = STATE_COLORS[event.stateCode] ?? { bg: '#90a4ae', color: '#fff' };
          if (style.bg === 'transparent') return null;
          const label = Math.round(duration);
          return (
            <div
              key={i}
              className="absolute top-0 text-center"
              style={{
                left: event.start * SCALE,
                width: duration * SCALE,
                height: '1.6em',
                lineHeight: '1.6em',
                background: style.bg,
                color: style.color,
                boxShadow: style.border ?? 'none',
                borderLeft: '1px solid #f5f5f5',
                borderRadius: '1px',
                fontSize: duration * SCALE < 20 ? '0' : '11px',
                fontWeight: 600,
                overflow: 'hidden',
              }}
              title={`${StateLabels[event.stateCode]} (${duration.toFixed(1)} min)`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
