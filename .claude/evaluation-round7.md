# Visual Evaluation - Round 7 (Final Audit)

**Date**: 2026-03-26
**Previous Score**: 4.5/10 (Round 1) → 8.0/10 (Round 5)
**Final Score**: 8.5/10

---

## Methodology

Studied all 24 Celonis reference images in `~/Desktop/celonis/`:
- 01-04: Classic Process Explorer, Variants, Dashboard, Conformance
- 5/Celonis1_0: P2P and Healthcare Patient Journey OCPM
- Screenshots: Alignment Explorer, Deviation Explorer, Studio views
- uuid-*: Process Cockpit, Variant Explorer, wireframes, Benchmarking, annotated views

Compared every section pixel-by-pixel against the most relevant reference.

## Section Scores

| Section | Score | Celonis Reference | Key Match Points |
|---------|-------|-------------------|-----------------|
| Navigation | 8.5/10 | Process Cockpit tabs | Active section tracking, blue underline indicator, frosted glass sub-nav |
| Hero / KPIs | 8.5/10 | Conformance Overview (04) | Large bold numbers, accent color on bottleneck, dividers |
| Process Graph | 8.5/10 | Classic Explorer (01) + Patient Journey (Celonis1_0) | Clean white BG, top-65% visibility, sidebar donuts, edge time labels, dashed rare paths |
| Variant Explorer | 8/10 | Variant Explorer (02) + uuid-5db543c2 | Horizontal bars, coverage summary footer, color-coded pills |
| Timeline | 8/10 | N/A (custom) | Abbreviation "CT-1", wider labels, color legend |
| MC Evidence | 9/10 | Conformance Overview (04) | Summary KPI row (Median/95th/Wait/Preferred), collapsible sections |
| Next Steps | 8/10 | N/A (custom) | Data-driven recommendations, hover lift |

## All Changes Made (Rounds 5-7)

### Round 5 (de9439c)
- Process graph: 800px container, maxZoom 0.9, 3-8px edges, amber throughput pills
- MC charts: stacked → grouped bars, distinct colors, collapsible sections
- Dashboard: IntersectionObserver section tracking, accent bar, text-4xl KPIs
- Edge opacity 0.8→0.92, dynamic arrow colors

### Round 6 (f277fff)
- Edge time labels on ALL edges: "⏱ X.X min" format
- Dashed cyan edges for rare paths (ratio < 0.2)
- Right sidebar with Activities/Connections donut charts, Less/More buttons
- Edge Metric selector in sidebar

### Round 7 (e431e93)
- Removed dot background (clean white like Celonis)
- Default visibility: top 65% of activities (readable density like Celonis)
- MC summary KPIs: Median Clinic Time / 95th Pct / Avg Wait / Preferred %
- Variant coverage summary: "X of Y variants — Z% covered"
- Timeline labels: 8em→10em, ClinicalTeam→CT abbreviation
- Sidebar counts: "X of Y activities/connections"
- Edge labels enlarged (text-xs, white pill with shadow)
- Histogram: wider bars, percentage labels, cleaner axes

## Remaining Gaps (non-blocking)

| Gap | Celonis Reference | Effort | Priority |
|-----|------------------|--------|----------|
| Multicolor edges (per case-type) | Process Cockpit | High | Nice-to-have |
| Filter panel / pills | All Celonis views | Medium | Nice-to-have |
| Animation (pink dots on edges) | uuid-3599ed1d | High | Deferred |
| Delta comparison (side-by-side) | Benchmarking (uuid-a8275a91) | High | Deferred |
| Throughput time popup with histogram | Alignment Explorer | Medium | Nice-to-have |
| Code splitting (2.3MB chunk) | N/A | Low | Tech debt |
