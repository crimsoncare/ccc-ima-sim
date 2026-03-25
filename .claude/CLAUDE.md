# CCC-IMA-SIM: Clinical Workflow Process Mining Explorer

## Project Overview
Clinical workflow discrete event simulator migrated from vanilla ES5 JS to TypeScript/Vite/React.
Adding Celonis-style process mining visualization (Process Explorer, Variant Explorer, Throughput Time, Activity Search, Animation).

**Original**: ~1,400 lines vanilla ES5 JS with Plotly.js CDN, no build system, no tests.
**Current branch**: `claude/process-mining-explorer-BbJim` (PR #1)

## Tech Stack
- **Build**: Vite 8 + pnpm + TypeScript 6
- **UI**: React 19 + TanStack Router + Tailwind CSS 4
- **Graph**: React Flow v12 (@xyflow/react) + ELK.js (hierarchical layout)
- **Charts**: Recharts (histograms, bar charts)
- **State**: Zustand
- **Testing**: Vitest + React Testing Library + jsdom
- **CI**: GitHub Actions (test + build + deploy to Pages)

## Commands
```bash
pnpm install          # Install deps
pnpm dev              # Dev server
pnpm test             # Run tests (vitest)
pnpm run build        # TypeScript compile + Vite build
pnpm preview          # Preview production build
```

## Architecture

### Core Simulation (`src/core/`)
Ported from legacy ES5 (`legacy/js/`). Uses seedable PRNG (mulberry32) for deterministic runs.
- `math.ts` — rbeta/rgamma distributions, statistics (mean, variance, percentiles)
- `actor.ts` — Patient/ClinicalTeam/Attending state machines with timeline recording
- `simulation.ts` — DES engine (step-based, min-timeRemaining advancement)
- `scheduler.ts` — 5-phase patient-provider matching algorithm

### Process Mining (`src/mining/`)
Transforms simulation output into process mining artifacts.
- `event-log.ts` — Actor timelines → standard event log (cases with activity sequences)
- `dfg.ts` — Directly-Follows Graph construction + frequency/throughput tracking
- `variants.ts` — Variant extraction (unique activity sequences)
- `happy-path.ts` — Most frequent variant connecting most frequent start/end activities
- `throughput.ts` — Edge throughput time calculations with multiple aggregation methods
- `activity-stats.ts` — Activity coverage metrics
- `types.ts` — Shared process mining type definitions

### UI Components (`src/components/`)
- `process-graph/` — React Flow graph with custom ActivityNode, ProcessEdge, GraphControls
- `variant-panel/` — VariantList + VariantHistogram
- `throughput/` — ThroughputHistogram + ThroughputControls
- `activity/` — ActivityCoverage + ActivityControls

### State (`src/store/`)
- `simulation-store.ts` — Simulation params, execution, results → feeds mining store
- `mining-store.ts` — DFG, variants, visibility, KPI settings, animation state

## Known Issues (remaining)

### Medium Priority
- **Animation not implemented**: Play/Stop button toggles state but no actual bubble animation or timeline scrubber.
- **Delta comparison**: Legacy supported comparing two MC runs side by side. Not ported yet.
- **No error boundaries**: ELK.js layout or chart failures could crash the app.
- **2.3MB single chunk**: No code splitting, no lazy routes. Should add React.lazy for routes.
- **Process animation (Celonis)**: Pink bubbles moving along edges not implemented.

### Low Priority
- No case selection dropdown on node click (flow through / don't flow through / start with / end with)
- No variant histogram drag-select or throughput histogram click-drag
- No list/graph view toggle for variants
- Zustand state is in-memory only — lost on page reload

## Deployment
- **GitHub Pages**: Current CI deploys dist/ to Pages on push to main/master
- **Vercel** (planned): Needs `base: '/'` in vite.config.ts, Vercel auto-detects Vite

## Testing
62 tests across 4 test files:
- `golden-sample.test.ts` — Deterministic simulation output with seed=42
- `math.test.ts` — PRNG, distributions, statistics
- `simulation.test.ts` — Full simulation runs, state machines
- `mining.test.ts` — Event log, DFG, variants, happy path, throughput, activity stats

## Git
- Never push without asking. Never amend. Never commit to main.
- PR branch: `claude/process-mining-explorer-BbJim`
- Legacy code preserved in `legacy/` directory
