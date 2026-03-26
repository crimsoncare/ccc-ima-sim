/**
 * Enriched event log: generates a clinically-realistic process with
 * branching, optional activities, rework loops, and cross-connections.
 * Creates a Celonis-quality DFG with 15+ activities and complex topology.
 */
import type { Actor } from '@/core/actor';
import { StateCodes } from '@/core/actor';
import type { ProcessEvent, Case, EventLog } from './types';

// Simple hash for deterministic pseudo-random decisions per case
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function chance(caseId: string, salt: string, prob: number): boolean {
  return (hashCode(caseId + salt) % 1000) < prob * 1000;
}

function splitDuration(start: number, end: number, fractions: number[]): number[] {
  const dur = end - start;
  const times = [start];
  let t = start;
  for (let i = 0; i < fractions.length - 1; i++) {
    t += dur * fractions[i];
    times.push(t);
  }
  return times;
}

export function extractEnrichedEventLog(
  sim: { actors: Actor[]; time: number },
): EventLog {
  const events: ProcessEvent[] = [];
  const cases: Case[] = [];
  const patients = sim.actors.filter((a) => a.type === 'Patient');

  for (const patient of patients) {
    const caseEvents: ProcessEvent[] = [];
    const caseType = patient.caseType ?? 'uc';
    const id = patient.id;

    // Collect timeline events by state code for timing
    const tl = patient.timeline.filter(e => e.end !== null);
    const getEvent = (code: number) => tl.find(e => e.stateCode === code);

    const checkin = getEvent(StateCodes.PATIENT_CHECKING_IN);
    const waitPref = getEvent(StateCodes.PATIENT_WAITING_FOR_PREFERRED_CLINICAL_TEAM);
    const waitAny = getEvent(StateCodes.PATIENT_WAITING_FOR_ANY_CLINICAL_TEAM);
    const ctMeeting = getEvent(StateCodes.PATIENT_CLINICAL_TEAM_MEETING);
    const waitAtt = getEvent(StateCodes.PATIENT_WAITING_FOR_ATTENDING);
    const attMeeting = getEvent(StateCodes.PATIENT_ATTENDING_MEETING);
    const checkout = getEvent(StateCodes.PATIENT_CHECKING_OUT);

    const push = (activity: string, timestamp: number) => {
      caseEvents.push({ caseId: id, activity, timestamp, stateCode: 0 });
    };

    // === CHECK-IN PHASE ===
    if (checkin) {
      const ts = splitDuration(checkin.start, checkin.end!, [0.5, 0.5]);
      push('Registration', ts[0]);
      push('Vitals & Triage', ts[1]);
    }

    // === WAITING PHASE ===
    if (waitPref) {
      push('Waiting Room', waitPref.start);
    }
    if (waitAny) {
      push('Queue Reassignment', waitAny.start);
    }

    // === CLINICAL TEAM MEETING PHASE (branches by case type) ===
    if (ctMeeting) {
      const s = ctMeeting.start, e = ctMeeting.end!;
      if (caseType === 'btc_new') {
        const ts = splitDuration(s, e, [0.20, 0.25, 0.25, 0.15, 0.15]);
        push('History Taking', ts[0]);
        push('Physical Examination', ts[1]);
        push('Clinical Assessment', ts[2]);
        push('Care Planning', ts[3]);
        // Optional: lab order for ~60% of new patients
        if (chance(id, 'lab', 0.6)) {
          push('Lab Order', ts[4]);
        }
      } else if (caseType === 'btc_fu') {
        const ts = splitDuration(s, e, [0.30, 0.30, 0.25, 0.15]);
        push('Chart Review', ts[0]);
        push('Medication Reconciliation', ts[1]);
        push('Progress Assessment', ts[2]);
        // Optional: medication change for ~40% of follow-ups
        if (chance(id, 'medchange', 0.4)) {
          push('Medication Adjustment', ts[3]);
        }
      } else {
        // UC
        const ts = splitDuration(s, e, [0.30, 0.35, 0.20, 0.15]);
        push('Chief Complaint', ts[0]);
        push('Focused Examination', ts[1]);
        push('Treatment Plan', ts[2]);
        // Optional: imaging for ~25% of UC
        if (chance(id, 'imaging', 0.25)) {
          push('Imaging Order', ts[3]);
        }
      }
    }

    // === HANDOFF PHASE ===
    if (waitAtt) {
      push('CT-Attending Handoff', waitAtt.start);
      // Optional: case discussion for complex cases ~30%
      if (chance(id, 'discuss', 0.3)) {
        push('Case Discussion', waitAtt.start + (waitAtt.end! - waitAtt.start) * 0.5);
      }
    }

    // === ATTENDING MEETING PHASE (branches by case type) ===
    if (attMeeting) {
      const s = attMeeting.start, e = attMeeting.end!;
      if (caseType === 'btc_new') {
        const ts = splitDuration(s, e, [0.20, 0.25, 0.30, 0.25]);
        push('Case Presentation', ts[0]);
        push('Attending Examination', ts[1]);
        push('Collaborative Planning', ts[2]);
        // Rework loop: ~20% of new patients need re-exam
        if (chance(id, 'reexam', 0.2)) {
          push('Additional Workup', ts[3]);
          push('Re-examination', ts[3] + (e - ts[3]) * 0.5);
        }
      } else if (caseType === 'btc_fu') {
        const ts = splitDuration(s, e, [0.35, 0.35, 0.30]);
        push('Case Update', ts[0]);
        push('Joint Assessment', ts[1]);
        push('Follow-up Plan', ts[2]);
      } else {
        const ts = splitDuration(s, e, [0.40, 0.35, 0.25]);
        push('Quick Review', ts[0]);
        push('Focused Treatment', ts[1]);
        // Optional: specialist referral for ~20% of UC
        if (chance(id, 'referral', 0.2)) {
          push('Specialist Referral', ts[2]);
        }
      }
    }

    // === CHECKOUT PHASE ===
    if (checkout) {
      const ts = splitDuration(checkout.start, checkout.end!, [0.40, 0.30, 0.30]);
      push('Discharge Instructions', ts[0]);
      // Optional: social work for ~15% of patients
      if (chance(id, 'social', 0.15)) {
        push('Social Work Consult', ts[1]);
      }
      push('Follow-up Scheduling', ts[2]);
    }

    events.push(...caseEvents);
    const variant = caseEvents.map((e) => e.activity).join(' -> ');
    cases.push({ id, events: caseEvents, variant });
  }

  events.sort((a, b) => a.timestamp - b.timestamp);
  return { events, cases };
}
