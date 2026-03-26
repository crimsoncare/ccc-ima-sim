import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { SimulationParams, Distribution, PatientConfig } from '@/core/simulation';

interface ParameterModalProps {
  params: SimulationParams;
  onSave: (params: SimulationParams) => void;
  onClose: () => void;
}

export function ParameterModal({ params, onSave, onClose }: ParameterModalProps) {
  const [draft, setDraft] = useState<SimulationParams>(() => structuredClone(params));
  const [showConfirm, setShowConfirm] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Track whether actor counts changed
  const countsChanged =
    draft.numAttendings !== params.actors.attendings.length ||
    draft.numClinicalTeams !== params.actors.clinicalTeams.length ||
    draft.numPatients !== params.actors.patients.length;

  useEffect(() => {
    setShowConfirm(countsChanged);
  }, [countsChanged]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const setGlobal = (key: keyof SimulationParams, value: number) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const setPatientField = (idx: number, key: keyof PatientConfig, value: string | number) => {
    setDraft((d) => {
      const patients = [...d.actors.patients];
      patients[idx] = { ...patients[idx], [key]: value };
      return { ...d, actors: { ...d.actors, patients } };
    });
  };

  const setDistField = (distKey: string, field: keyof Distribution, value: number) => {
    setDraft((d) => {
      const distributions = { ...d.distributions };
      distributions[distKey] = { ...distributions[distKey], [field]: value };
      return { ...d, distributions };
    });
  };

  const confirmCounts = useCallback(() => {
    setDraft((d) => {
      const newAttendings = Array.from({ length: d.numAttendings }, (_, i) => ({
        id: `Attending-${i + 1}`,
      }));
      const newCTs = Array.from({ length: d.numClinicalTeams }, (_, i) => ({
        id: `ClinicalTeam-${i + 1}`,
      }));
      const newPatients: PatientConfig[] = Array.from({ length: d.numPatients }, (_, i) => ({
        id: `Patient-${i + 1}`,
        preferredAttending: 'None',
        preferredClinicalTeam: 'None',
        caseType: 'uc',
        maxWaitTimeAttending: 15,
        maxWaitTimeClinicalTeam: 15,
        appointmentTime: 0,
      }));
      return {
        ...d,
        actors: { attendings: newAttendings, clinicalTeams: newCTs, patients: newPatients },
      };
    });
    setShowConfirm(false);
  }, []);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const attendingOptions = draft.actors.attendings.map((a) => a.id);
  const ctOptions = draft.actors.clinicalTeams.map((c) => c.id);

  const distNames: Record<string, string> = {
    pt_checkin: 'Patient check in',
    pt_checkout: 'Patient check out',
    pt_arrival_delay: 'Patient arrival (relative to appointment)',
    pt_ct_meeting_btc_new: 'Patient-ClinicalTeam meeting (BTC New)',
    pt_ct_meeting_btc_fu: 'Patient-ClinicalTeam meeting (BTC F/U)',
    pt_ct_meeting_uc: 'Patient-ClinicalTeam meeting (UC)',
    ct_atp_meeting: 'ClinicalTeam-Attending meeting',
    pt_ct_atp_meeting_btc_new: 'Patient-Attending meeting (BTC New)',
    pt_ct_atp_meeting_btc_fu: 'Patient-Attending meeting (BTC F/U)',
    pt_ct_atp_meeting_uc: 'Patient-Attending meeting (UC)',
  };

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-auto py-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#2e6da4] text-white rounded-t-lg">
          <h2 className="text-lg font-bold">Parameters</h2>
          <button onClick={onClose} className="text-2xl leading-none hover:opacity-70">&times;</button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-auto text-sm">
          {/* Global params */}
          <table className="w-full border-collapse">
            <tbody>
              {([
                ['numAttendings', 'Number of Attendings'],
                ['numClinicalTeams', 'Number of Clinical Teams'],
                ['numPatients', 'Number of Patients'],
                ['targetTime', 'Target clinic end time (minutes)'],
                ['hurryThreshold', 'Hurry threshold (minutes)'],
                ['hurryFactor', 'Hurry factor (multiplicative)'],
              ] as [keyof SimulationParams, string][]).map(([key, label]) => (
                <tr key={key} className="border-b border-gray-200">
                  <td className="py-2 pr-4"><label>{label}</label></td>
                  <td className="py-2">
                    <input
                      type="number"
                      step={key === 'hurryFactor' ? 0.05 : 1}
                      className="w-24 border border-gray-300 rounded px-2 py-1 bg-[#fffaee]"
                      value={draft[key] as number}
                      onChange={(e) => setGlobal(key, parseFloat(e.target.value) || 0)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Confirm counts button */}
          {showConfirm && (
            <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
              <button
                className="bg-[#eea236] text-white px-4 py-2 rounded hover:opacity-90"
                onClick={confirmCounts}
              >
                Confirm changes
              </button>
              <span className="ml-2 text-gray-600">(this will reset the patient/team lists below)</span>
            </div>
          )}

          {/* Patient table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">ID</th>
                  <th className="border border-gray-300 px-2 py-1">Scheduled (offset)</th>
                  <th className="border border-gray-300 px-2 py-1">Case type</th>
                  <th className="border border-gray-300 px-2 py-1">Preferred attending</th>
                  <th className="border border-gray-300 px-2 py-1">Max wait attending</th>
                  <th className="border border-gray-300 px-2 py-1">Preferred CT</th>
                  <th className="border border-gray-300 px-2 py-1">Max wait CT</th>
                </tr>
              </thead>
              <tbody>
                {draft.actors.patients.map((p, i) => (
                  <tr key={p.id}>
                    <td className="border border-gray-300 px-2 py-1 font-medium">{p.id}</td>
                    <td className="border border-gray-300 px-1 py-0">
                      <input
                        type="number"
                        className="w-16 px-1 py-1 bg-[#fffaee] border-0 w-full"
                        value={p.appointmentTime}
                        onChange={(e) => setPatientField(i, 'appointmentTime', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-0">
                      <select
                        className="w-full px-1 py-1 bg-[#fffaee] border-0"
                        value={p.caseType}
                        onChange={(e) => setPatientField(i, 'caseType', e.target.value)}
                      >
                        <option value="uc">uc</option>
                        <option value="btc_new">btc_new</option>
                        <option value="btc_fu">btc_fu</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-1 py-0">
                      <select
                        className="w-full px-1 py-1 bg-[#fffaee] border-0"
                        value={p.preferredAttending}
                        onChange={(e) => setPatientField(i, 'preferredAttending', e.target.value)}
                      >
                        <option value="None">None</option>
                        {attendingOptions.map((id) => (
                          <option key={id} value={id}>{id}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-1 py-0">
                      <input
                        type="number"
                        className="w-16 px-1 py-1 bg-[#fffaee] border-0 w-full"
                        value={p.maxWaitTimeAttending}
                        onChange={(e) => setPatientField(i, 'maxWaitTimeAttending', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="border border-gray-300 px-1 py-0">
                      <select
                        className="w-full px-1 py-1 bg-[#fffaee] border-0"
                        value={p.preferredClinicalTeam}
                        onChange={(e) => setPatientField(i, 'preferredClinicalTeam', e.target.value)}
                      >
                        <option value="None">None</option>
                        {ctOptions.map((id) => (
                          <option key={id} value={id}>{id}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-1 py-0">
                      <input
                        type="number"
                        className="w-16 px-1 py-1 bg-[#fffaee] border-0 w-full"
                        value={p.maxWaitTimeClinicalTeam}
                        onChange={(e) => setPatientField(i, 'maxWaitTimeClinicalTeam', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Distribution table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">Distribution</th>
                  <th className="border border-gray-300 px-2 py-1">Mean</th>
                  <th className="border border-gray-300 px-2 py-1">Min</th>
                  <th className="border border-gray-300 px-2 py-1">Max</th>
                  <th className="border border-gray-300 px-2 py-1">Stdev</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(draft.distributions).map((key) => {
                  const dist = draft.distributions[key];
                  return (
                    <tr key={key}>
                      <td className="border border-gray-300 px-2 py-1 font-medium">
                        {distNames[key] ?? key}
                      </td>
                      {(['mean', 'min', 'max', 'stdev'] as (keyof Distribution)[]).map((field) => (
                        <td key={field} className="border border-gray-300 px-1 py-0">
                          <input
                            type="number"
                            className="w-16 px-1 py-1 bg-[#fffaee] border-0 w-full"
                            value={dist[field] as number}
                            onChange={(e) => setDistField(key, field, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              className="bg-[#2e6da4] text-white px-6 py-2 rounded hover:opacity-90"
              onClick={handleSave}
            >
              Save Parameters
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// JSON import/export modal
interface JSONModalProps {
  params: SimulationParams;
  onImport: (params: SimulationParams) => void;
  onClose: () => void;
}

export function JSONModal({ params, onImport, onClose }: JSONModalProps) {
  const [importText, setImportText] = useState(JSON.stringify(params, null, 2));
  const [exportText, setExportText] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText) as SimulationParams;
      onImport(parsed);
      onClose();
    } catch (e) {
      alert('Invalid JSON: ' + (e as Error).message);
    }
  };

  const handleExport = () => {
    setExportText(JSON.stringify(params, null, 2));
  };

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-auto py-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b bg-[#2e6da4] text-white rounded-t-lg">
          <h2 className="text-lg font-bold">JSON import/export</h2>
          <button onClick={onClose} className="text-2xl leading-none hover:opacity-70">&times;</button>
        </div>
        <div className="p-6 text-sm">
          <p className="mb-4 text-gray-600">Import and export simulation parameters using JSON</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                className="w-full font-mono text-xs border border-gray-300 rounded p-2 mb-2"
                rows={20}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <button
                className="bg-[#eea236] text-white px-4 py-2 rounded hover:opacity-90"
                onClick={handleImport}
              >
                Import JSON
              </button>
            </div>
            <div className="flex-1">
              <textarea
                className="w-full font-mono text-xs border border-gray-300 rounded p-2 mb-2"
                rows={20}
                value={exportText}
                readOnly
              />
              <button
                className="bg-[#2e6da4] text-white px-4 py-2 rounded hover:opacity-90"
                onClick={handleExport}
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
