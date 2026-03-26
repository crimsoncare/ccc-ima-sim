# Visual Evaluation - Round 1

**Evaluator**: Harsh visual critique comparing against Celonis, Disco, and ProM
**Date**: 2026-03-25
**Verdict**: The app has solid data and real substance, but the visual presentation is firmly in "hackathon demo" territory. A stakeholder seeing this would think "student project," not "process mining tool."

---

## Section-by-Section Scores

### 1. Navigation Bar
| Criteria | Score |
|----------|-------|
| Design quality | 5/10 |
| Readability | 6/10 |
| Professionalism | 5/10 |
| Celonis fidelity | 4/10 |

**What I saw**: Dark navy bar (`#1a1a2e`) with orange "Process Mining Explorer" logo text and gray nav links. Active tab has a subtle `bg-white/20` highlight. Six tabs across.

**Issues**: The nav looks like a generic dark-mode template. Celonis uses a clean, compact sidebar or a top bar with crisp typography, iconography, and a clear visual hierarchy. This nav has no logo/icon, no visual weight on the active tab, and the orange-on-dark feels like a leftover from a CSS theme generator. The tab labels are small and washed out (`text-white/70`).

---

### 2. Hero / KPI Metrics Area
| Criteria | Score |
|----------|-------|
| Design quality | 6/10 |
| Readability | 6/10 |
| Professionalism | 5/10 |
| Celonis fidelity | 4/10 |

**What I saw**: Large title, paragraph description, then 6 KPI cards in a row (Simulated Cases, Unique Pathways, Happy Path, Clinic Duration, Staff, Bottleneck). Cards are pastel-colored (blue, orange, red backgrounds).

**Issues**:
- The KPI cards are the right idea but look like Bootstrap cards from 2018. Celonis KPI tiles use bold numbers with subtle backgrounds, minimal borders, and clean typography.
- The "800" for simulated cases and "59" for unique pathways are `text-2xl` which is too small for hero-level KPIs. These should be the most visually dominant elements on the page.
- The sub-text ("8 patients x 100 sessions") is useful but cramped.
- Pastel color-coding (blue-50, orange-50, red-50) feels washed out. The information hierarchy is flat - everything looks equally (un)important.
- The hero paragraph is too long and reads like a README. A stakeholder does not need to know it was "calibrated from actual clinic operations data" in the hero section.

---

### 3. Process Graph (DFG)
| Criteria | Score |
|----------|-------|
| Design quality | 5/10 |
| Readability | 3/10 |
| Professionalism | 4/10 |
| Celonis fidelity | 4/10 |

**What I saw**: React Flow graph in a white container with 700px height. Nodes are small colored circles (64px diameter) with 10px labels below. Edges are blue bezier curves with frequency labels. ELK layout runs top-to-bottom. There is a minimap in the corner. On initial load, the graph is zoomed out so far that node labels are unreadable -- they appear as colored dots.

**Issues**:
- **CRITICAL: Nodes are unreadable at default zoom.** The `fitView` with `maxZoom: 0.65` forces the graph to zoom out so much that 10px labels are invisible. This is the single worst visual problem in the app. A first-time viewer sees colored dots connected by lines and has no idea what they represent.
- Celonis uses rectangular activity boxes (not circles) with the activity name INSIDE the box, the frequency prominently displayed, and enough padding to be readable. This app puts labels BELOW tiny circles in 10px font.
- The three "insight callout" cards above the graph (Clinical Team Phase, Attending Phase, Optional Activities) are good content but add visual noise before the graph even loads. They compete for attention.
- The color legend at the bottom is the right idea but uses tiny 12px circles that are hard to match to the equally tiny graph nodes.
- Edge frequency labels are tiny floating pills (`text-[10px]`) that overlap and clutter the graph at any zoom level.
- The 700px fixed height is often too small for the graph, requiring scroll-to-zoom which is not obvious.

---

### 4. Variant Explorer
| Criteria | Score |
|----------|-------|
| Design quality | 6/10 |
| Readability | 5/10 |
| Professionalism | 5/10 |
| Celonis fidelity | 5/10 |

**What I saw**: Two-column layout: 2/3 variant list (scrollable cards with activity pills), 1/3 histogram. Each variant card shows rank, case count, percentage, a frequency bar, and color-coded activity pills with arrows.

**Issues**:
- The variant list shows ALL 59 variants by default in a scrollable container. This is information overload. Celonis shows top 5-10 by default with a "show more" progressive disclosure.
- Activity pills at `text-[10px]` are hard to read and the arrows between them are tiny `text-[10px]` gray characters. On a long variant (16+ activities), the pill chain wraps multiple lines and becomes visual noise.
- The "Less / Reset / More" buttons at the top control how many variants are *selected* (highlighted in graph), not how many are *shown*. This is confusing UX.
- The histogram on the right is a decent Celonis-like pattern but uses unlabeled bars. The x-axis shows "#1, #2, #3" but not the variant names.
- The histogram and list don't have strong visual connection -- clicking a bar should highlight the variant in the list and vice versa (unclear if this works).

---

### 5. Clinic Session Timeline (Gantt Chart)
| Criteria | Score |
|----------|-------|
| Design quality | 7/10 |
| Readability | 6/10 |
| Professionalism | 6/10 |
| Celonis fidelity | N/A (custom) |

**What I saw**: Dark background (`#222`) Gantt chart with color-coded state bars for attendings, clinical teams, and patients. Time axis from 5:00 to 8:00 with 15-min ticks. Hover highlights related actors.

**Issues**:
- This is actually the best-looking section. The dark background Gantt is visually distinctive and the color coding is functional.
- However, there is no legend explaining what the colors mean. Green, blue, teal, orange-outlined, red-outlined bars are used but never explained. A viewer has to hover each bar to see the tooltip.
- The actor labels (Attending-1, ClinicalTeam-1, Patient-1) are truncated at `8em` which cuts off "ClinicalTeam-" labels.
- Numbers inside bars (duration in minutes) are sometimes cut off for short-duration activities.
- The section has no controls -- no ability to switch between different simulation runs or zoom into time ranges.

---

### 6. Monte Carlo Validation Charts
| Criteria | Score |
|----------|-------|
| Design quality | 5/10 |
| Readability | 5/10 |
| Professionalism | 4/10 |
| Celonis fidelity | N/A (custom) |

**What I saw**: 2-column grid of 10 Recharts charts. Mix of area charts (confidence bands), bar charts (patients seen), line charts (preferred provider), and histograms (attending waiting). All 300px height.

**Issues**:
- Ten charts dumped in a 2-column grid with no visual hierarchy or grouping. It reads like a Jupyter notebook output, not a dashboard.
- The confidence band charts are clever (5th-95th percentile shading) but the visual execution is flat. The white fill trick to create bands leaves a harsh edge.
- Chart titles are tiny (`text-sm font-semibold`) and look like footnotes rather than section headers.
- Y-axis labels format durations as "0:00, 0:15, 0:30" which is correct but the label text is 11px and hard to read.
- The "Patients Seen by Clinical Team" stacked bar chart is nearly unreadable -- the opacity-based stacking produces indistinguishable segments.
- X-axis labels on patient charts (PT1 5:15, PT2 5:15) run together and overlap at this chart width.
- No section headers to group "Patient metrics," "Staff metrics," "System metrics." Just a wall of charts.

---

### 7. Sub-pages (Process Explorer, Variant Explorer tabs, etc.)
| Criteria | Score |
|----------|-------|
| Design quality | 2/10 |
| Readability | N/A |
| Professionalism | 2/10 |
| Celonis fidelity | 1/10 |

**What I saw**: Navigating to any tab other than Dashboard shows "No simulation data available" with a "Run Simulation" button on an empty page.

**Issues**:
- **The simulation state does not persist across page navigation.** This is a major UX failure. A user exploring the Process Explorer tab has to re-run the simulation from scratch. In Celonis, you load data once and explore it across all views.
- The empty state is a plain gray text + blue button centered on a blank page. No illustration, no guidance, no explanation.

---

### 8. "What's Next?" Section
| Criteria | Score |
|----------|-------|
| Design quality | 6/10 |
| Readability | 7/10 |
| Professionalism | 6/10 |
| Celonis fidelity | N/A |

**What I saw**: Gradient background (blue-to-orange) card with three columns: Staffing Policy, Scheduling, Try It Yourself. Clean typography with a link to the simulation page.

**Issues**:
- This is decent but the gradient feels generic.
- The content is good but static -- it would be more powerful if it dynamically referenced the actual bottleneck found.

---

## TOP 10 ISSUES (Ranked by Visual Impact)

### 1. Process graph nodes are unreadable at default zoom
**What's wrong**: Nodes are 64px circles with 10px labels underneath. At `fitView` with `maxZoom: 0.65`, labels are invisible. The graph looks like a scatter plot of colored dots.
**What it should look like**: Celonis uses rectangular boxes (min 120x50px) with the activity name INSIDE the box in 12-14px font. The frequency is shown as a badge or inside the box. Labels must be readable without zooming.
**Files**: `src/components/process-graph/ActivityNode.tsx`, `src/components/process-graph/ProcessGraph.tsx`
**Effort**: Major rework -- redesign node shape from circles to rectangles, move labels inside, adjust ELK layout spacing.

### 2. Sub-pages lose simulation data on navigation
**What's wrong**: Navigating to Process Explorer, Variant Explorer, etc. shows empty "No simulation data" because the dashboard auto-run doesn't populate shared state for other routes.
**What it should look like**: Data loads once and persists across all tabs. Or, each tab triggers its own load if needed.
**Files**: `src/store/simulation-store.ts`, `src/routes/process-explorer.tsx`, `src/routes/variant-explorer.tsx`, etc.
**Effort**: Medium -- ensure the Zustand store persists across route changes (it should already, but the auto-run effect only fires on the index route).

### 3. KPI cards look like Bootstrap 4 leftovers
**What's wrong**: Pastel background cards with tiny numbers. No visual hierarchy -- "800 cases" and "2A / 4CT" have identical visual weight.
**What it should look like**: Celonis-style KPI tiles: large bold numbers (32-40px), subtle gray or white cards with thin borders, with a clear primary/secondary hierarchy. The most important metrics (case count, bottleneck) should be visually dominant.
**Files**: `src/routes/index.tsx` (the `Insight` component)
**Effort**: 1-3 lines per card -- increase font size, simplify backgrounds, add hierarchy.

### 4. Monte Carlo charts are a wall of undifferentiated plots
**What's wrong**: 10 charts in a 2-column grid with no grouping, no headers, tiny titles. Looks like a stats homework assignment.
**What it should look like**: Group charts into collapsible sections ("Patient Wait Times," "Staff Utilization," "System Performance"). Add section headers. Consider tabs or accordion for the 10 charts.
**Files**: `src/components/simulation/MonteCarloCharts.tsx`, `src/routes/index.tsx`
**Effort**: Medium -- wrap chart groups in card containers with headers, possibly add tabs.

### 5. Variant list shows all 59 variants with no progressive disclosure
**What's wrong**: 59 scrollable variant cards with 10px activity pills. Information overload.
**What it should look like**: Show top 5 variants by default. "Show more" expands to 10, then 20, then all. Celonis defaults to showing ~5-7 variants.
**Files**: `src/components/variant-panel/VariantList.tsx`
**Effort**: 1-3 lines -- add a `visibleCount` state, slice the variants array, add a "Show more" button.

### 6. Timeline Gantt has no color legend
**What's wrong**: The Gantt chart uses 10+ distinct colors (green, blue, teal, orange border, red border, gray) but never explains what they mean.
**What it should look like**: A compact legend bar above or below the chart: "Meeting with CT" = green, "Waiting for Attending" = orange border, etc.
**Files**: `src/components/simulation/Timeline.tsx`
**Effort**: Medium -- build a legend component from the `STATE_COLORS` and `StateLabels` maps.

### 7. Navbar looks generic/template-y
**What's wrong**: Dark navy + orange text with no icon, no visual weight on active tab, washed-out inactive tabs.
**What it should look like**: Clean professional nav with a small logo/icon, clear active-tab indicator (bottom border or filled background), and properly contrasted text.
**Files**: `src/routes/__root.tsx`
**Effort**: 1-3 lines per nav item -- add bottom border for active, increase text opacity, add an icon.

### 8. Edge labels clutter the process graph
**What's wrong**: Every edge has a floating frequency label in a tiny pill (`text-[10px]`). With 40+ edges, the labels overlap and create visual noise.
**What it should look like**: Show labels only on hover, or only for edges above a frequency threshold. Celonis shows edge labels on demand or uses line thickness to encode frequency.
**Files**: `src/components/process-graph/ProcessEdge.tsx`
**Effort**: Medium -- add conditional rendering based on frequency threshold or zoom level.

### 9. Hero description paragraph is too long
**What's wrong**: A 3-line paragraph explaining the simulation methodology in the hero section. No stakeholder reads this.
**What it should look like**: One concise sentence. Move methodology details to an info tooltip or a collapsible "About" section.
**Files**: `src/routes/index.tsx`
**Effort**: 1-3 lines -- trim the paragraph.

### 10. Stacked bar charts (Patients Seen) are unreadable
**What's wrong**: The "Patients Seen by Clinical Team" chart uses opacity-based stacking where 3-4 nearly identical shades of green are stacked. Impossible to distinguish segments.
**What it should look like**: Use distinct colors or a grouped bar chart instead of stacked. Or use a box plot / violin plot to show distribution.
**Files**: `src/components/simulation/MonteCarloCharts.tsx` (`PatientsSeenChart`)
**Effort**: Medium -- switch from stacked opacity bars to grouped bars or a different chart type.

---

## Overall Assessment

**Overall Score: 4.5/10**

The app has genuinely good data and meaningful analysis underneath. The simulation engine, process mining extraction, and Monte Carlo validation are technically solid. But the visual layer communicates "I built this in a weekend" rather than "this is a professional analytical tool."

The three most impactful fixes (in order of bang-for-buck):
1. **Redesign process graph nodes** from circles to readable rectangles
2. **Fix data persistence** across tabs
3. **Polish KPI cards** with proper typography hierarchy

These three changes alone would move the app from 4.5/10 to roughly 6.5/10.
