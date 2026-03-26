Society of Student-Run Free Clinics Annual Conference 2017

# Using Analytics to Effectively Manage Student Run-Clinics

**Chi Feng**  
PhD Candidate, MIT

**Jingzhi An**  
MD-PhD Candidate, Harvard-MIT

![Title slide with a dark red background across the upper roughly two-thirds of the page and a white band across the bottom. Centered near the top in small white text: "Society of Student-Run Free Clinics Annual Conference 2017". Below it, in very large white text split across two lines: "Using Analytics to Effectively" and "Manage Student Run-Clinics". In the lower white section, left side lists presenters: "Chi Feng" in bold gray followed by "PhD Candidate, MIT" in lighter gray; below, "Jingzhi An" in bold gray followed by "MD-PhD Candidate, Harvard-MIT" in lighter gray. Bottom left logos: The John D. Stoeckle Center for Primary Care Innovation with tagline "Your Primary Care is Our Primary Concern", and Massachusetts General Hospital with blue shield logo reading "MGH 1811". Right side stacked logos: MIT with "Massachusetts Institute of Technology"; Harvard Medical School crest with "THE HARVARD MEDICAL SCHOOL"; and Crimson Care Collaborative logo with shield marked "CCC" and the words "CRIMSON CARE COLLABORATIVE".](figure)

# Introduction

![Slide layout with a dark crimson banner across the top containing the white title "Introduction" aligned left. Below, on the upper left, the Crimson Care Collaborative logo appears in red: a shield with the letters "C C C" and a ribbon-like flourish, followed by the text "CRIMSON CARE COLLABORATIVE" and the subtitle "A HARVARD MEDICAL SCHOOL STUDENT-FACULTY MEDICAL PRACTICE". To the right of the logo is a sentence in large black text: "A group of 6 student-run clinics providing services in: pediatrics, primary care, mental health, and dentistry". Mid-right is a color photograph of Massachusetts General Hospital at dusk showing a modern glass-front building labeled "LUNDER BUILDING", a skybridge labeled "MASSACHUSETTS GENERAL HOSPITAL", lit windows, cars, and an entrance canopy on the right.](figure)

Focus on **Internal Medical Associate at Massachusetts General Hospital (CCC-IMA)**

- Adult primary care practice
- Urgent care + bridge to care
- Clinic runs every Tuesday 5 – 9 pm
- Up to 12 patients per clinic, > 300/year
- ~ 75 volunteers + faculties
- 15 Board Members + 1 faculty director

We provide **clinical service for patients** and **educational opportunities for volunteers**

- Craft roles and responsibilities
- Design training and educational programs
- *Staffing and scheduling for clinic operations*

# Objectives of this Workshop

- Learn data-driven approaches for informed policy decisions affecting clinic operations
- Use model-based simulation to analyze a real-world staffing problem
- Develop ideas on applying these concepts to your clinic
- Gain insights on how to jump-start the infrastructure for data-driven operations
- Hands-on session

# A Typical Visit

![A process flow diagram across the top of the page on a dark background. Five connected right-pointing chevron arrows run left to right. The first chevron is light gray and labeled "Patient check-in". The second is green and labeled "Patient seen by clinical team". The third is teal and labeled "Clinical team meets with attending". The fourth is blue and labeled "Patient is seen by attending (and clinical team)". The fifth is light gray and labeled "Patient check-out". Below the flow is a Gantt-style schedule with rows for staff and patient resources. Visible row labels on the left are "Attending-1", faint "Attending-2", "ClinicalTeam-1", faint "ClinicalTeam-2", faint "ClinicalTeam-3", faint "ClinicalTeam-4", and "Patient-1". Colored bars contain durations: Attending-1 has teal "10" followed by blue "25"; Attending-2 has dark teal "13" then dark blue "14". ClinicalTeam-1 has gray "15", green "25", teal "10", blue "25". ClinicalTeam-2 has gray "15", dark green "37", dark teal "13", dark blue "14". ClinicalTeam-3 has gray "15", brown outlined "28", green "34". ClinicalTeam-4 has gray "15", brown outlined "28", green "21", yellow outlined "15". Patient-1 has a small gray block, gray "6", yellow outlined "2", green "25", orange outlined "10", blue "25". Vertical gridlines divide the timeline, but no axis labels or tick values are visible.](figure)

# Challenges in Designing Operations Policies

![Horizontal chevron process diagram near the top of the slide, spanning almost the full width. Five connected arrow-shaped segments point left-to-right. Segment 1 is gray and labeled "Patient check-in". Segment 2 is green and labeled "Patient seen by clinical team". Segment 3 is teal and labeled "Clinical team meets with attending". Segment 4 is blue and labeled "Patient is seen by attending (and clinical team)". Segment 5 is gray and labeled "Patient check-out". All segments have black outlines and centered text.](figure)

## Design constraints and objectives:

- Clinic must finish within 3 hours
- Minimize patient wait time
- Ensuring continuity of care  
  e.g. maximizing probability of being seen by “preferred” attending/clinical team

![Small illustrative 3D clip-art image near the lower left: several white human-like figures sit in a circle on white block seats, suggesting a group meeting. Two red human-like figures stand among them; one red figure is upright with an arm raised as if presenting or leading discussion, while another red figure leans forward. To the right of the image is large black text asking: "What are some other design constraints and objectives?"](figure)

What are some other design constraints and objectives?

# Stakeholder interests relating to operations

![Hierarchy-style stakeholder interest diagram on a white background with a dark red title banner across the top reading "Stakeholder interests relating to operations" in large white text. The diagram has two main vertical gray boxes on the left with white rotated text: upper box "Volunteer" and lower box "Patient". From each gray box, green category boxes branch rightward, then blue detail boxes branch further right. For Volunteer: green boxes are "Accessibility" and "Quality of experience". "Accessibility" connects to three blue boxes: "Patients per session", "Time commitment", and "End time of clinic". "Quality of experience" connects to two blue boxes: "Time spent w/ attending" and "Diversity of cases seen". For Patient: green boxes are "Accessibility" and "Quality of care". "Accessibility" connects to two blue boxes: "Duration of visit" and "How soon is first appointment". "Quality of care" connects to two blue boxes: "Continuity of care" and "Waiting time". Connectors are thin green and blue bracket-like lines matching the category/detail colors.](figure)

## Volunteer

### Accessibility
- Patients per session
- Time commitment
- End time of clinic

### Quality of experience
- Time spent w/ attending
- Diversity of cases seen

## Patient

- Duration of visit
- How soon is first appointment

### Quality of care
- Continuity of care
- Waiting time

![Horizontal process flow diagram beneath the title, composed of five connected right-pointing chevron blocks with black outlines. From left to right: a light gray chevron labeled "Patient check-in"; a green chevron labeled "Patient seen by clinical team"; a teal chevron labeled "Clinical team meets with attending"; a blue chevron labeled "Patient is seen by attending (and clinical team)"; and a light gray chevron labeled "Patient check-out". The chevrons are aligned in a single row across the page, indicating the patient visit sequence from check-in through check-out.](figure)

## A typical policy question:

**Should we increase the number of clinical teams to better achieve our design objectives?**

![Horizontal process flow diagram near the top of the slide consisting of five connected chevron-shaped blocks outlined in black, arranged left to right. Block 1 is light gray and labeled "Patient check-in". Block 2 is green and labeled "Patient seen by clinical team". Block 3 is teal and labeled "Clinical team meets with attending". Block 4 is blue and labeled "Patient is seen by attending (and clinical team)". Block 5 is light gray and labeled "Patient check-out". The chevrons are centered across the page and represent the patient visit workflow from check-in to check-out.](figure)

**Should we increase the number of clinical teams  
to better achieve our design objectives?**

**Alice says** (proponent of increase)

- More patients seen per session
- Patients will wait less
- Clinic may end earlier
- More volunteering opportunities

![A horizontal process-flow diagram made of five connected right-pointing chevrons across the upper portion of the slide. The first chevron is gray and labeled "Patient check-in". The second chevron is green and labeled "Patient seen by clinical team". The third chevron is teal and labeled "Clinical team meets with attending". The fourth chevron is blue and labeled "Patient is seen by attending (and clinical team)". The fifth chevron is gray and labeled "Patient check-out". The chevrons are outlined in black and arranged left to right to show a patient visit workflow.](figure)

**Should we increase the number of clinical teams  
to better achieve our design objectives?**

### **Alice says** (proponent of increase)

- More patients seen per session
- Patients will wait less
- Clinic may end earlier
- More volunteering opportunities

### **Bob says** (against increase)

- Bottleneck may lie elsewhere (attendings)
- Patients will have to wait more
- May not have impact on duration on clinic
- Reduction in number of patients/team

# Approaches to Design Operations Policies

First approach: **Conduct an experiment**

- Delayed feedback (~ months)
- Requires long-term commitment, even for small sample size
- Can only perform one experiment at a time
- Hard to preserve institutional knowledge
- Full dynamics (captures all idiosyncrasies)

First approach: **Conduct an experiment**

- Delayed feedback (~ months)
- Requires long-term commitment, even for small sample size
- Can only perform one experiment at a time
- Hard to preserve institutional knowledge
- Full dynamics (captures all idiosyncrasies)

Second approach: **Model-based simulation**

![Flow diagram illustrating the second approach, model-based simulation. On the left, black text reads "Policy of Interest". A light gray right-pointing arrow leads to a medium gray square in the center labeled in white text "Model of Clinic Dynamics". From this square, another light gray right-pointing arrow leads to black text on the right reading "simulated clinic sessions", with light gray text above it in parentheses: "(multiple)". Below that, a light gray downward arrow points to black text reading "performance metrics", with light gray text beneath in parentheses: "(averages, percentiles)". The layout is left-to-right then downward, showing policy input, simulation model, multiple simulated sessions, and resulting performance metrics.](figure)

- Immediate feedback for rapid iteration
- High throughput and “large” sample size
- Useful tool for training and education
- Simplified dynamics require model calibration and validation

# Application Example

**Revisit:** How many teams should we have per clinic?

Live simulation demo: [http://crimsoncare.github.io/ccc-ima-app](http://crimsoncare.github.io/ccc-ima-app)

![Screenshot of a dark-themed simulation app interface. Across the top of the app area is a horizontal row of four blue buttons labeled "Parameters", "JSON import/export", "Run Simulation", and "Run Monte Carlo". Below is gray hint text reading "Hint: hover over the timeline labels to highlight relationships". The main content is a Gantt-style schedule on a charcoal background with vertical time gridlines labeled from 5:00 to 8:00 at 15-minute intervals: 5:00, 5:15, 5:30, 5:45, 6:00, 6:15, 6:30, 6:45, 7:00, 7:15, 7:30, 7:45, 8:00. Left-side row labels are grouped as Attending-1 and Attending-2; ClinicalTeam-1 through ClinicalTeam-4; and Patient-1 through Patient-8. Each row contains colored rectangular task blocks with centered numeric labels. Attending-1 shows blocks labeled 9, 15, 13, 14, 27, 18, 17, 8, 16. Attending-2 shows 16, 14, 8, 11, 17, 12, 10, 19, 2, 9, 12. ClinicalTeam-1 shows 15, 18, 9, 15, 53, 18, 17. ClinicalTeam-2 shows 15, 27, 16, 14, 49, 10, 19. ClinicalTeam-3 shows 15, 2, 36, 5, 13, 14, 42, 15, 5, 8, 16. ClinicalTeam-4 shows 15, 29, 36, 11, 17, 44, 9, 12. Patient rows show corresponding staggered blocks: Patient-1 has 8, 2, 18, 9, 15, 12; Patient-2 has 2, 9, 27, 16, 14, 3; Patient-3 has 3, 36, 17, 14, 5; Patient-4 has 6, 36, 11, 17, 7; Patient-5 has 6, 25, 53, 18, 17, 2; Patient-6 has 8, 17, 49, 10, 19, 4; Patient-7 has 6, 14, 42, 28, 16, 4; Patient-8 has 5, 30, 5, 44, 9, 12, 4. Blocks use multiple colors including gray, green, teal, blue, orange-outline brown, yellow-outline olive, and a small red block, indicating different activity types or relationships.](figure)

# Observations: 6 vs. 4 clinical teams

## 4 Clinical Teams

![Histogram comparing checkout times for 4 clinical teams. The x-axis is labeled "Last patient checked out" and runs from 7:00 to 9:00 with tick marks at 7:00, 7:15, 7:30, 7:45, 8:00, 8:15, 8:30, 8:45, and 9:00. The y-axis is labeled "Frequency" with visible ticks at 0, 100, 200, and 300. Blue semi-transparent histogram bars form a distribution beginning around 7:28, rising sharply from about 7:40, peaking slightly before and around 8:00 at roughly 330–360 frequency, then tapering off through about 8:45 to 9:00. A dark blue vertical reference line is drawn just after 8:00, approximately 8:03 to 8:05. A light gray vertical shaded band spans roughly 7:45 to 8:25, centered around 8:00.](figure)

## 6 Clinical Teams

![Histogram comparing checkout times for 6 clinical teams. The x-axis is labeled "Last patient checked out" and runs from 7:00 to 9:00 with tick marks at 7:00, 7:15, 7:30, 7:45, 8:00, 8:15, 8:30, 8:45, and 9:00. The y-axis is labeled "Frequency" with visible ticks at 0, 100, 200, 300, and 400. Blue semi-transparent histogram bars form a tighter distribution than the 4-team chart, beginning around 7:15 to 7:20, increasing from about 7:30, peaking near 7:50 to 7:58 at roughly 360–390 frequency, then falling after 8:00 and tapering to near zero by about 8:35 to 8:45. A dark blue vertical reference line is drawn just before 8:00, approximately 7:52 to 7:54. A light gray vertical shaded band spans roughly 7:35 to 8:13, covering the main concentration of values.](figure)

# Observations: Patient waiting for clinical team

![Line chart panel labeled "4 Clinical Teams". Y-axis label: "Patient waiting for clinical team". Y-axis ticks shown at 0:00, 0:15, 0:30, 0:45, and 1:00. X-axis categories: PT1 5:15, PT2 5:15, PT3 5:30, PT4 5:30, PT5 6:00, PT6 6:00, PT7 6:15, PT8 6:15. A solid blue line with circular markers is near zero for PT1 and PT2, drops to 0:00 at PT3 and PT4, then rises sharply to just above 0:15 at PT5 and remains around 0:17–0:18 through PT8. Small blue dots sit above each category, around 0:05 for PT1–PT2, near 0:01 for PT3–PT4, and around 0:20–0:21 for PT5–PT8. A light blue shaded band spans a lower dashed boundary and upper boundary: around 0:09–0:13 at PT1–PT2, narrowing to near 0:00–0:09 at PT3–PT4, then expanding dramatically from roughly 0:03 to about 0:55 at PT5, staying broad through PT8 with the top edge slightly declining. A dashed blue midline is around 0:09 at PT1–PT2, near 0:00 at PT3–PT4, then around 0:32–0:33 at PT5–PT8.](figure)

![Line chart panel labeled "6 Clinical Teams". Y-axis label: "Patient waiting for clinical team". Y-axis ticks shown at 0:00, 0:15, 0:30, 0:45, and 1:00. X-axis categories: PT1 5:15, PT2 5:15, PT3 5:30, PT4 5:30, PT5 6:00, PT6 6:00, PT7 6:15, PT8 6:15. A solid blue line with circular markers stays very close to 0:00 from PT1 through PT6, then rises slightly at PT7 to about 0:03–0:04 and remains similar at PT8. Small blue dots appear around 0:04 for PT1–PT2, about 0:01 for PT3–PT4, at 0:00 for PT5–PT6, and around 0:10 for PT7–PT8. A light blue shaded band covers approximately 0:00–0:12 at PT1–PT2, about 0:00–0:08 at PT3–PT4, collapses to 0:00 at PT5–PT6, then expands at PT7–PT8 to roughly 0:00–0:30. A dashed blue line within the band is about 0:09 at PT1–PT2, near 0:00 at PT3–PT6, then around 0:19 at PT7–PT8.](figure)

# Observations: Patient waiting for attending

![Line chart with shaded bands for "4 Clinical Teams". Y-axis label: "Patient waiting for attending". Y-axis scale marked at 0:00, 0:15, 0:30, 0:45, 1:00. X-axis categories: PT1 5:15, PT2 5:15, PT3 5:30, PT4 5:30, PT5 6:00, PT6 6:00, PT7 6:15, PT8 6:15. A solid dark blue line with circular markers shows approximate values around 0:12 for PT1 and PT2, rising to about 0:16 at PT3 and PT4, dropping to about 0:12 at PT5 and PT6, then rising again to about 0:16 at PT7 and PT8. A dashed blue upper line sits roughly at 0:17 for PT1-PT2, 0:24 for PT3-PT4, 0:17 for PT5-PT6, and 0:26 for PT7-PT8. A dashed blue lower line sits roughly near 0:08 for PT1-PT2, 0:10 for PT3-PT4, 0:08 for PT5-PT6, and 0:10 for PT7-PT8. A light blue shaded band spans a wider range, approximately from 0:05-0:32 at PT1, 0:05-0:32 at PT2, 0:06-0:35 at PT3, 0:06-0:36 at PT4, 0:05-0:31 at PT5, 0:05-0:31 at PT6, 0:06-0:37 at PT7, and 0:06-0:38 at PT8.](figure)

![Line chart with shaded bands for "6 Clinical Teams". Y-axis label: "Patient waiting for attending". Y-axis scale marked at 0:00, 0:15, 0:30, 0:45, 1:00. X-axis categories: PT1 5:15, PT2 5:15, PT3 5:30, PT4 5:30, PT5 6:00, PT6 6:00, PT7 6:15, PT8 6:15. A solid dark blue line with circular markers shows approximate values around 0:12 for PT1 and PT2, about 0:16 for PT3 and PT4, rising to about 0:20 at PT5 and PT6, then about 0:21 at PT7 and slightly below that at PT8. A dashed blue upper line is roughly at 0:18 for PT1-PT2, about 0:25-0:26 for PT3-PT4, and about 0:30 for PT5 through PT8. A dashed blue lower line is roughly at 0:08 for PT1-PT2, about 0:10 for PT3-PT4, about 0:12 for PT5-PT6, and about 0:13 for PT7-PT8. A light blue shaded band spans a wider range, approximately from 0:04-0:33 at PT1, 0:04-0:33 at PT2, 0:05-0:36 at PT3, 0:05-0:36 at PT4, 0:06-0:43 at PT5, 0:06-0:45 at PT6, 0:06-0:40 at PT7, and 0:06-0:42 at PT8.](figure)

# Observations

![Stacked bar chart under the title "Observations". Y-axis label: "Patients seen by clinical team" with percentage scale from 0% to 100% marked at 0%, 20%, 40%, 60%, 80%, and 100%. X-axis categories: ClinicalTeam-1, ClinicalTeam-2, ClinicalTeam-3, ClinicalTeam-4, ClinicalTeam-5, ClinicalTeam-6. Legend at upper right has three green shades labeled 3, 2, 1, with 3 as darkest green, 2 as medium green, and 1 as lightest green. ClinicalTeam-1 bar: about 12% category 1 and about 88% category 2, no visible category 3. ClinicalTeam-2: about 12% category 1 and about 88% category 2, no visible category 3. ClinicalTeam-3: about 93% category 1 and about 7% category 2, no visible category 3. ClinicalTeam-4: about 84% category 1 and about 16% category 2, no visible category 3. ClinicalTeam-5: 100% category 1. ClinicalTeam-6: 100% category 1.](figure)

## Observations:

- Attending availability is the key bottleneck
  - Duration of the clinic is not significantly affected
  - Patients wait in the examination room instead of the lobby
- Patients volume limits the patient : clinical team ratio and affects volunteer experience

# Approach to Modeling Clinic Dynamics

The model is based on:

- Data collected in clinic over time
- Constraints that we know the clinic has to operate under,

and is built to reflect the true dynamics of the clinic in an iterative approach:

![Circular process diagram with three stages connected by three thick gray curved arrows on a white background. Top-left text reads "Model refinement". Top-right text reads "Model calibration". Bottom-center text reads "Model validation". A short gray curved arrow at the top points from the left stage toward the right stage. A larger gray curved arrow on the right curves downward from "Model calibration" toward "Model validation". Another large gray curved arrow on the left curves upward from "Model validation" back toward "Model refinement". The layout forms a continuous iterative loop among the three model-development stages.](figure)

# Model Calibration

**Model Calibration:** find values of model parameters that result in predictions that best match the training data.

**KEY IDEA:** Identify model parameters, usually **intrinsic** properties  
(independent from the design parameters, e.g., staffing, scheduling)

**Examples:**

|  |  |
|---|---|
| Patient | Arrival time relative to scheduled time? |
| Clinical team | How long do they tend spend with the patients? |
| Attending | How long do they tend to spend with the patients? |

Can you name any other intrinsic properties?

How do we collect useful data?

![Small 3D clip-art style illustration in the lower-left of the slide showing a group meeting. Several glossy white humanoid figures sit on white cube stools arranged in a circle. Two glossy red humanoid figures stand among them; one red figure is elevated and appears to be presenting or pointing upward with one arm raised, while another red figure stands nearby facing the group. The figures have rounded heads and simplified bodies with no facial features. The image suggests discussion, training, or facilitation.](figure)

# Model Calibration – Data Collection

## How we collect the data at CCC-IMA

## Current - Google Spreadsheet

![Screenshot of a Google Sheets document embedded in a presentation slide. The spreadsheet title at top left reads "CCC-IMA Patient Tracker Spring 2015-Spring 2016". The menu bar shows: File, Edit, View, Insert, Format, Data, Tools, Add-ons, Help. Status text says "All changes saved in Drive". Top right shows email "jingzhi.an@gmail.com", a "Comments" button, and a blue "Share" button. The visible sheet has column letters A through O and row numbers 1 through 14. Header row includes: "Pt Initials", "Team #", "Team (SC/JC)", "Attending", "SHOW/ NO SHOW?", yellow-highlighted "DO NOT EDIT", "Patient Tracker", "Pt Arrived (TIME); \"DNK\" if no show", "With Clinical Team (TIME)", "Ready for Attending (TIME)", "Attending in Room (TIME)", "Attending out of Room (TIME)", "Resource In (TIME)", and "Resource Out (TIME)". Leftmost visible time entries down the rows are 5:15 PM repeated for rows 2–6, then 5:30 PM, 5:45 PM twice, 6:00 PM twice, and 6:15 PM twice. Most cells are blank.](figure)

| Time | Pt Initials | Team # | Team (SC/JC) | Attending | SHOW/ NO SHOW? | DO NOT EDIT | Patient Tracker | Pt Arrived (TIME); "DNK" if no show | With Clinical Team (TIME) | Ready for Attending (TIME) | Attending in Room (TIME) | Attending out of Room (TIME) | Resource In (TIME) | Resource Out (TIME) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 5:15 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5:15 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5:15 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5:15 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5:15 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5:30 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5:45 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5:45 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 6:00 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 6:00 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 6:15 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 6:15 PM |  |  |  |  |  |  |  |  |  |  |  |  |  |  |

Moving towards real-time data collection:

![Slide with a dark red banner across the top containing the white title "Model Calibration – Data Collection". Below, on a white background, left side text reads "How we collect the data at CCC-IMA" and beneath it "Moving towards real-time data collection:". Two Android phone screenshots are centered-left and center, connected by a thick yellow right-pointing arrow. The left phone shows a status bar with time 12:29 and the prompt "Who are you?" above a scrollable list of user cards: "Alyssa Botelho (JC) — At Clinic Huddle 1h 1m ago", "Toni Chan (JSSRC) — Default 2h 15m ago", "Phillip Chea (JSSRC) — Default 2h 15m ago", "Shiri Feingold (Attending) — Arrive at Clinic 44m ago", "Dan Henderson (Attending) — Default 2h 15m ago", "Danielle Levitt (JSSRC) — Default 2h 15m ago", and partially visible "Nina Lowery (SC)". The right phone screenshot, also at 12:29, shows "Name: Alyssa Botelho (JC)", "Status: At Clinic Huddle", a "Sign Out" button, and three large buttons labeled "Prep for Patient", "Meet with Patient", and "UNDO". On the right side of the slide are two bulleted activity logs titled "Chelsea Nunez (JC)" and "Katie Slusarz (JC)" with timestamped status events.](figure)

## Chelsea Nunez (JC)

- 18:59:33 Meet with Attending
- 18:59:31 Meet with Patient
- 17:57:48 End Visit
- 17:38:56 Meet with Attending
- 17:38:54 Meet with Patient
- 17:14:21 Prep for Patient
- 17:12:10 At Clinic Huddle
- 16:00:00 Default

## Katie Slusarz (JC)

- 19:47:35 End Visit
- 19:47:34 Meet with Attending
- 19:20:15 Wait for Attending
- 19:20:13 Meet with Patient
- 18:31:21 End Visit
- 18:17:57 Meet with Attending
- 18:01:45 Wait for Attending
- 17:21:33 Meet with Patient
- 17:16:50 Prep for Patient
- 17:12:29 At Clinic Huddle
- 16:00:00 Default

# Model Calibration – Data Analysis

## How we use the data collected to obtain model parameters

## Data tracked 2015-2017

Appointment Time

Team: Attending / SC/ JC

Show / No Show

Time-stamps

- Patient arrived
- With clinical team
- Ready for attending
- Attending in room
- Attending out of room
- Patient checked out
- Resource in/out\*

## Example of parameter extraction

Clinical team time with patient

![A histogram with an aligned horizontal box plot below it titled by nearby text "Clinical team time with patient". The x-axis is labeled "Time (minutes)" and runs from 0 to 90 with tick marks every 10 minutes. The histogram y-axis is labeled "Frequency" with tick marks at 0, 5, 10, and 15, reaching a maximum of 15. Bars are dark red/maroon. A thin vertical gray line marks the mean at about 33.4 minutes. Annotation text to the upper right reads "mean = 33.4 min, std = 15.9 min". The distribution is concentrated roughly between 20 and 50 minutes, with smaller counts extending toward 0 and up to about 75 minutes, including a sparse right tail. Below, a horizontal box plot shows a blue-outlined box spanning approximately 24 to 44 minutes, a red median line near 33 minutes, whiskers extending to roughly 0 and 75 minutes, and a dashed black reference line running horizontally through the plot.](figure)

![Slide containing eight histogram panels arranged in two rows of four, plus a legend at right of the lower-right plot. Top row shows single red-outline histograms. Bottom row shows overlaid subgroup histograms in green, blue, and orange. Panel 1 title/x-axis: "Duration of Patient Visit (hr)", y-axis: "No. of Cases", x-scale 0 to 4, y-scale 0 to 60; distribution peaks around 1.5 to 2.0 hours and trails to about 3.2 hours. Panel 2: "Time with Clinical Team (hr)", x-scale 0 to 1.5, y-scale 0 to 150; highest counts around 0.4 to 0.7 hr. Panel 3: "Time with Attending (hr)", x-scale 0 to 1.5, y-scale 0 to 200; strongly right-skewed with highest counts near 0.1 to 0.3 hr. Panel 4: "Time spent waitin (hr)", x-scale 0 to 1.5, y-scale 0 to 150; counts spread from about 0.1 to 1.1 hr with a high bar near 1.0 hr. Bottom row repeats the same four metrics with overlaid subgroup outlines: green = "BTC New", blue = "BTC F/U", orange = "UC". Bottom-left y-scale 0 to 40; bottom-middle-left 0 to 60; bottom-middle-right 0 to 80; bottom-right 0 to 40.](figure)

1. Visualize the distributions described by data

2. Explore characteristics of sub-groups

3. Extract summary statistics from distributions

# Model Validation

**Model Validation:** checks the the model's representation of the real system.

**Key Idea:** Identify **extrinsic** (or derived) properties of the clinic

**Examples:**
1. When does the clinic tend to end?

![Line chart comparing measured and simulated clinic end times versus number of patients. X-axis label: "Number of patients" with ticks at 2, 4, 6, 8, 10. Y-axis label: "Time" with ticks at 7:00, 7:30, 8:00, 8:30, 9:00. Legend in upper left inside a boxed area: blue line labeled "Measured data" and red line labeled "Simulated data". Blue measured data include star-shaped points approximately at: 1 patient 7:15, 5 patients 7:30, 6 patients 7:45 and 8:20, 7 patients about 8:05, 8:10, and 8:30, 8 patients about 8:20 and 8:30, 9 patients about 8:10, 10 patients about 8:15. A solid blue trend line rises from about 7:18 at 1 patient to about 8:32 at 10 patients, with blue dotted bounds above and below it. Red simulated data shown as a solid upward-sloping line from about 7:00 near 2 patients to about 8:55 at 10 patients, with red dotted bounds around it. Gridlines are shown across the plot.](figure)

2. How long do patient visits tend to take?

3. How long do patients, clinical teams spend waiting?

# Model Refinement

**Model Refinement:** further improve the model accuracy

**Key Idea:** Identify discrepancies, look for explanation, and incorporate new dynamics

**Example:** Mismatch in simulated data and measured data for busier clinics

![Main slide figure containing one large comparison chart on the left, explanatory bullet list on the right, and four small scatter plots along the bottom. Large chart: x-axis labeled "Number of patients" with ticks at 2, 4, 6, 8, 10; y-axis labeled "Time" with ticks formatted as 7:00, 7:30, 8:00, 8:30, 9:00. Legend in upper-left box shows blue line labeled "Measured data" and red line labeled "Simulated data". Blue asterisk markers show measured observations at approximately: 1 patient 7:15, 5 patients 7:30, 6 patients 7:45 and 8:20, 7 patients about 8:05 and 8:10, 8 patients about 8:22, 8 patients 8:30, 9 patients 8:10, 10 patients 8:15. Blue solid trend line rises roughly from 7:20 at x=1 to 8:32 at x=10, with blue dotted bounds above and below. Red solid simulated line rises more steeply, from about 7:00 at x=2 to about 8:55 at x=10, with red dotted bounds; an oval dark red outline highlights the upper-right region near x=8 to 10 and times 8:00 to 9:00 where simulated values exceed measured values. Right side text reads "Potential causes for shorter appointments:" followed by bullets: "Time pressure for clinicians later in session", "Increased motivation to keep to schedule", and "Implement as “hurry factor”". Bottom row contains four gray-dot scatter plots with red regression lines, each with x-axis "Patient : Attending ratio" ranging 0 to 15. Plot 1 y-axis "Duration of Visit (hr)" ranging 0 to 3, regression line slightly decreasing around 1.6 hr. Plot 2 y-axis "Time with team (hr)" ranging 0 to 1.5, regression line slightly decreasing from about 0.58 to 0.50. Plot 3 y-axis "Time with attending (hr)" ranging 0 to 1.5, regression line more clearly decreasing from about 0.45 to 0.18. Plot 4 y-axis "Time spent waiting (hr)" ranging 0 to 1.5, regression line increasing from about 0.62 to 0.90.](figure)

## Potential causes for shorter appointments:

- Time pressure for clinicians later in session
- Increased motivation to keep to schedule
- Implement as “hurry factor”

# Audience Challenge: Find optimal schedule

![Small 3D clipart-style illustration on the left showing a group of white human-like figures seated in a circle on white block seats. Two red human-like figures are standing among them, one with an arm raised and one gesturing forward, suggesting discussion or leadership. The figures are glossy and rendered in a simple rounded style on a white background.](figure)

How can we **schedule the patients** to optimize the **end time of the clinic**? What policies will make an (positive or negative) impact?

`crimsoncare.github.io/ccc-ima-sim`

**Conditions:** 2 Attending physicians

4 Clinical Teams

8 Patients

- 3 Urgent Care (uc)
- 3 Bridge-to-Care New (btc_new)
- 2 Bridge-to-Care Follow-up (btc_fu)  
  **has preferred attending & team**

**Hints:** Try different arrangements of preferred attending and team

Try different scheduled appointment times

BTC New appointments take the longest, may be beneficial to spread them out, front-load, or back-load

# Take-away

- Data-driven simulation is an effective tool for making informed policy decisions
  - Enables quantitative, probabilistic thinking:
    **Mean/media** and **percentiles** of performance metrics

- Our model is constructed using the **calibrate – validate – refine** approach
  - Model parameters were chosen based on historical data
  - Validate model predictions against observations

- The simulation was used to explore several staffing / scheduling problems

- Getting started is straightforward:
  - Build a data collection system in your clinic
  - Code is open source: github.com/crimsoncare/ccc-ima-sim