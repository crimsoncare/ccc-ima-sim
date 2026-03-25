/**
 * Chevron workflow diagram — "A Typical Visit" from the SSFRC 2017 paper.
 * Shows the 5-phase patient journey through the clinic.
 */

const STEPS = [
  { label: 'Patient\ncheck-in', color: '#9e9e9e', textColor: '#fff' },
  { label: 'Patient seen by\nclinical team', color: '#2e7d32', textColor: '#fff' },
  { label: 'Clinical team\nmeets with attending', color: '#00897b', textColor: '#fff' },
  { label: 'Patient is seen by\nattending (and CT)', color: '#1565c0', textColor: '#fff' },
  { label: 'Patient\ncheck-out', color: '#9e9e9e', textColor: '#fff' },
];

export function WorkflowChevron() {
  return (
    <div className="flex items-stretch w-full" style={{ height: 56 }}>
      {STEPS.map((step, i) => (
        <div key={i} className="flex-1 relative flex items-center justify-center">
          {/* Chevron shape via SVG */}
          <svg
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            <polygon
              points={
                i === 0
                  ? '0,0 180,0 200,30 180,60 0,60'
                  : i === STEPS.length - 1
                    ? '0,0 200,0 200,60 0,60 20,30'
                    : '0,0 180,0 200,30 180,60 0,60 20,30'
              }
              fill={step.color}
            />
          </svg>
          <span
            className="relative z-10 text-[11px] font-semibold leading-tight text-center px-4 whitespace-pre-line"
            style={{ color: step.textColor }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
