<!-- Page 1 -->

# Analysis the patients’ careflows using process mining

**Abdel-Hamed Mohamed Rashed**1, **Noha E. El-Attar**1, **Diaa Salama Abdelminaam**1,2, **Mohamed Abdelfatah**1\*

1 Information System Department, Faculty of Computers and Artificial Intelligence, Benha University, Benha City, Egypt, 2 Department of Computer Science, Faculty of Computers and Informatics, Misr International University, Cairo, Egypt

\* Mohamed.abdo@fci.bu.edu.edu

## Abstract

Recently, The Egyptian health sector whether it is public or private; utilizes emerging technologies such as data mining, business intelligence, Internet of Things (IoT), among many others to enhance the service and to deal with increasing costs and growing pressures. However, process mining has not yet been used in the Egyptian organizations, whereas the process mining can enable the domain experts in many fields to achieve a realistic view of the problems that are currently happening in the undertaken field, and thus solve it. This paper presents application of the process mining techniques in the healthcare field to obtain meaningful insights about its careflows, e.g., to discover typical paths followed by certain patient groups. Also, to analyze careflows that have a high degree of dynamic and complexity. The proposed methodology starts by the preprocess step on the event logs to eliminate outliers and clean the event log. And then apply a set of the popular discovery miner algorithms to discover the process model. Then careflows processes are analyzed from three main perspectives: the control-flow perspective, the performance perspective and, the organizational perspective. That contributes with many insights for the domain experts to improve the existing careflows. Through evaluating the simplicity metric of extracted models; the paper suggested a method to quantify the simplicity metric. The paper used a dataset from a cardiac surgery unit in an Egyptian hospital. The results of the applied process mining techniques provide the hospital managers a real analysis and insights to make the patient journey easier.

## 1. Introduction

Healthcare is one of the most important business sectors in any country. Obtaining a high-quality healthcare service as well as not overrated cost is a challenging issue, where the good health of citizens reflects positively on their productivity. Healthcare management is described as a multilateral process; healthcare is provided in hospitals, rehabilitation centers, nursing homes, and clinics. Also, many professionals may participate in it such as general practitioners, dentists, midwives, and physiotherapists. Healthcare contains massive data from its databases

![Left sidebar and journal branding. At top left is the PLOS ONE logo, with “PLOS” in black and “ONE” in magenta, above a thin horizontal black line spanning the page width. In the left column below, a square badge reads “Check for updates” under a ribbon-like multicolor icon in a rounded gray box. Beneath a horizontal divider is an “OPEN ACCESS” label with a black open-lock icon. The sidebar text reads: “Citation: Rashed A-HM, El-Attar NE, Abdelminaam DS, Abdelfatah M (2023) Analysis the patients’ careflows using process mining. PLoS ONE 18(2): e0281836. https://doi.org/10.1371/journal.pone.0281836” Then: “Editor: Lun Hu, Xinjiang Technical Institute of Physics and Chemistry, Chinese Academy of Sciences, CHINA” “Received: August 28, 2022” “Accepted: February 2, 2023” “Published: February 23, 2023” “Copyright: © 2023 Rashed et al. This is an open access article distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.” “Data Availability Statement: All relevant data for this study are available from the GitHub repository (https://github.com/hameede/Log-event-for-careflows-of-patients).” “Funding: The author(s) received no specific funding for this work.” “Competing interests: The authors have declared that no competing interests exist.”](figure)

<!-- Page 2 -->

related to the care processes. Consequently, enhancing the performance of its processes will improve the care services quality and reduce its costs. Business process management (BPM) domains investigate how to improve the business process of the organization. Domains in BPM like process modeling, process mapping, and process mining are used interchangeably as soon as their similarity. Process mapping is used to draw an idealized process model of how processes should be performed using workshops, interviews, and document analysis. Process mining uses automation techniques to extract process models from organizational databases. Process modeling defines how the process model should be, it depends on human perception [1].

Improving healthcare processes effects directly on the quality and costs of the care services, but there are many barriers related to the management of healthcare processes such as highly dynamic, complex, ad-hoc, and increasingly multidisciplinary [2]. Nevertheless, processes of different complexity and duration (up to several months) can be identified. The process mining can solve these challenges by relating the actual behavior of organization processes with the modeled one. It leads to reveal insights that may prove that hand-made (based on opinion and beliefs) is different from the reality. The business process mining is using techniques and tools to discover, monitor, and improve real processes based on event logs, which are extracted from business information systems.

This paper presents process mining application on dataset of a hospital in Egypt, the process discovery algorithms aim to discover the careflows of patients from the event log that extracted from the information system of the hospital. The discovered model explores the patient’s journey inside the hospital as s/he registers to the end. Then discovered model is checked the consensus with standard process model to enhance any error and deviation. The process model and event log were analyzed under the organizational and performance perspectives. The results of the analysis are important for any future suggested improvements in hospital processes.

This paper is organized as: Section 1 provides background concepts about process mining in healthcare. And it introduces the previous related applications and works of healthcare using process mining. Then it is followed by section 2 that presents the approach that is proposed to be applied. In the section 3 discusses the results when apply the proposed approach on the case study, the results of the preparing the event logs, then results when applying four miner algorithms to discover the process model from the event log. In the end of this section; the results of performing two main analysis perspectives. One for performance analysis and the second is for organizational analysis. At the last section 4; the conclusion will be presented to summarized the results and points to the future works.

## 1.1 Process mining and healthcare

Process mining brings together the data-centric analysis (such as data mining) and process-centric analysis (such as simulation); hand-made simulation is used in healthcare projects to plan the processes and its predictions, but because of the careflows complexity; the processes do not agree with the reality and fail in the improvement. Process mining can solve that challenge by modeling the care processes from historical event logs to reflect its real processes and go ahead to the improvement. Process mining leverages of data mining methods such as association, classification, clustering, prediction, sequential patterns, and regression in many interior stages such as preprocessing the event logs, clustering the traces, prediction [3]. Process mining techniques tend to automatically discover process models by extracting event logs from the process-aware information systems (PAIS), then check the conformance of process models to reality, and improve process performance in terms of key performance indicators

<!-- Page 3 -->

KPIs (cost, time, quality) [4]. The event log is a group of traces, each group representing a process case (i.e., a specific execution or instance of a process), with each trace described as a sequence of events (related to process activity executions) ordered by timestamp and performed by many resources as humans, machines and etc. that involved in the case. Every event has required attributes, such as the activity name, execution time, optional attributes such as the cost, the lifecycle of the activity (i.e., completed, started, assigned) and the resource doing it.

Fig 1 shows the implementation of the process mining in a clinical environment, once event logs are extracted from the hospital information system, they can be used as start point for the process mining functions, which are usually classified in the three iterative functions: discovery, conformance checking and enhancement. Firstly; discovery process aims to create process models from the event logs automatically. Secondly; the conformance checking process starts by replaying the event logs with designed simulated model (hand-made model) to

![Process mining workflow diagram for a hospital setting. At top left is a cloud-shaped bubble labeled "Real Activities" containing an isometric hospital building labeled "HOSPITAL" and four circular clinician avatars. At top right is a circle containing a hospital information system icon: a monitor with charts, heart symbol, and two hands touching the screen; below it the text "Hospital Information System". A double-headed horizontal arrow between the cloud and the circle is labeled "Support/control". A solid vertical arrow from the hospital information system points downward to a right cylinder labeled "Event Logs"; the arrow text reads "Register Events". The right cylinder contains a small event table image and a small process tree image, with the internal labels "Event Logs" and "model". A dashed diagonal arrow runs from the cloud down toward the event logs cylinder, labeled ".inform". A solid diagonal arrow runs upward from the left cylinder toward the hospital information system, labeled "Specify Configure implement". A solid vertical arrow rises from the left cylinder to the cloud, labeled "Analyze". The left cylinder is labeled "Process Model" and contains text "New model", "Diagnostic", and "Enhanced model", plus small process tree icons and a warning symbol inside a circle. Between the two cylinders is the heading "Three types of process mining:" above three blue arrows: a left-pointing arrow labeled "Discovery", a double-headed horizontal arrow labeled "Conformance", and an L-shaped leftward arrow labeled "Enhancement".](figure)

**Fig 1.** Process mining approach including process discovery, conformance checking and enhancements for a hospital [7].

https://doi.org/10.1371/journal.pone.0281836.g001

PLOS ONE | https://doi.org/10.1371/journal.pone.0281836 February 23, 2023 3 / 32

<!-- Page 4 -->

check conformance and to uncover bottlenecks in the process. Finally, enhancement process is to enrich the model with the insights that extracted from the event logs, for example, using performance data or timing information on model to display the bottlenecks, throughput, and frequencies [5, 6].

Discovery process is done under three different perspectives, control-flow perspective: it uses event logs for a set of traces to create a process model that defines all possible paths. It is expressed in terms of a petri net or some other notations (e.g., BPMN, YAWL, EPC, etc.), organizational perspective: it focuses on the actors (people, machines, roles, systems, and departments) are involved within the system and how they are related. This can give deep insights in the roles and organizational units or in the relations between individual performers through a social network, performance perspective: it concerns on the occurrence time and frequencies of events. It graphically shows the bottleneck cases and all types of performance indicators, for example, the average/variance of the total flow time within a process or the sojourn time of a given event.

The consensus of healthcare experts is on the complexity of managing clinical pathways, due to the nature of clinical operations; including very long time-consuming, the failure to set a binding deadline for the clinical process due to the presence of several participants and their variety, as well as many resources. Also, another reason for the complexity of clinical processes is the difficulty of formalizing them. In other term, dealing with the same disease is different from one patient to another; the clinical protocol map for the same disease differs; this is called “variation or drifting” dues to the difference in the patients’ traditions, behaviors, commitment to treatment, or the different traditions of their countries. Also, the patient health statuses; where some patients have other diseases make the treatment method different. Also, it may be due to the difference in the beliefs and experiences of the doctors and the nursing specialist and the resources available to them [8].

Based on aforementioned problems related to clinical pathways; many risks cause inefficiency of the healthcare activities performance such as: large waiting time, high cost, deviations from the standard model, bottlenecks, and frequent activities. Process mining techniques propose solutions to cope these risks by understanding what careflows are really happening and analyzing if there are any deviation from the prescription process model. Moreover, using the timestamps of events can determine and detect bottlenecks and other ineffectiveness. The terms of careflows; patient pathways; care processes; and healthcare processes have the same meaning.

ProM ([promtools.org](promtools.org)) is the most frequently used framework for process mining, which will be used throughout this study. ProM has a set of tools aimed to support techniques in various mining processes through plugins which enable researchers to apply versatile algorithms on the collected event logs [9]. Other frequently used process mining tools are Disco ([https://fluxicon.com/disco](https://fluxicon.com/disco)) and Celonis ([http://my.celonis.de/login](http://my.celonis.de/login)), and ProDiscovery ([https://www.puzzledata.com/prodiscovery_eng](https://www.puzzledata.com/prodiscovery_eng)). Custom made tools and techniques are also often used.

## 1.2 Related works

Many process mining applications were utilized in several business processes management to become more efficient and more manageable. For example, Process Mining can be used to enhance the education services quality [10]. Also, it is exploited to optimize loan application processes in the banking sector [11]. And even it can be used to improve the service quality of complaint service in big companies [12]. This section introduces a number of related process mining applications in the healthcare sector. The study [8] used process mining techniques to

<!-- Page 5 -->

infer meaningful knowledge insights for a hospital in Italy. The event logs are analyzed using the ProM framework from three different perspectives: the control flow perspective, the organizational perspective and the performance perspective. Applying process mining in this hospital provides the management to diagnose problems and set improvements based on real facts, represented in form of clinical data. There are two issues with this study:(1) the external validity; the extent by which the results can be applied generally beyond the parameters of the study.(2) The dataset records activities that took place during a period of two months between the end of 2015 and the beginning of 2016. For this reason, to confirm the validity and robustness of the findings, It must use the same process mining methods described in this paper to fresh (and more current) datasets collected over a longer time. In [13] the work was carried out conformance checking, the work used the process mining to check the conformance of the workflow of Open-Source EMRs (workflow from event logs of an EMR) and the workflow of hospitals (workflow of hospitals based on domain knowledge). The conformance checked the log and the model using alignment and replay and the results were evaluated on four metrics (fitness, precision, simplicity, and generalization). The main limitation of this study is the complexity and heterogeneity of healthcare processes. In [14], a healthcare case was presented to improve the business process by enhancing the KPIs associated with process instances data by using the process mining tools to extract knowledge from event logs related to the health care process, most of the patients were satisfied to the emergency department. The authors in [15] proposed a process redesign lifecycle phase coupled with process mining as an operational framework. The framework calculates indicators (time, cost, quality, and flexibility) to assess whether process redesign best practices. The limitation that found in this work that the authors analyze variations in the current and proposed processes, with results being positive, negative, and neutral for outcomes desired. The proposed framework has been applied on case studies in a hospital and a tour agency. Another application study was presented by [16] that proposed a new process mining method for simulating unstructured processes In order to achieve the most suitable process model, the proposed methodology permits the evaluation, comparison, and combination of the results of different process mining algorithms leveraging on conformance checking technique. The limitation of this study is related to the constraints of using Petri nets language for evaluating quality parameters, also another limitation is the possibility of lack of integration between coexisting information systems that cause lack of reliable event logs. In [17] another relevant study applied in dataset of a general university hospital in South Korea aiming to manage the duration of inpatient stay more efficiently. Where electronic health record (EHR) data and process mining technology were used to analyze all event records entered between patient admission and discharge, the limitation of this study is the generalizability to apply this approach, it is limited to one specific hospital not on multiple hospitals. Where there are differences between hospitals in the admission process and treatment plans. The study in [18] described how the process mining was applied to unstructured event data for an evidence-based process model discovery of patient journeys from start to end. The resulted process model is the basis for a simulation model. The resulted process models used for performance analysis and verification of the knowledge discovered using process mining techniques. The critical challenge of this study is to identify key process improvement areas, these areas are normally areas where the performances are measured by KPIs. The study [19] integrated the process mining and the goal programming approach to improve the design of an emergency department from the view of operations management. It has been observed that many patients must travel unneeded long distances during their visits owing to inefficient assignment of the clinical units to the available spaces. The proposed method was improved the distances traveled by noncritical and critical patients, this study was limited by the lack of information related to the staff movements and walking behaviors. Also, the study needed to determine the

<!-- Page 6 -->

effects of proposed layout on the walking distances of ED staff and personnel. The paper proposed a framework for process performance indicators utilized in emergency rooms. The paper [20] suggested multiple process performance indicators that can be gained by analyzing the event logs from the clinical unit and verify them by discussion with clinical managers in the emergency department. The paper provided a single case study. As such, it is necessary to apply our framework to multiple emergency room event logs to validate it. Also, the paper only included the limited attributes of emergency room patient-related attributes; thus, only a part of them was measured. The study [21] compared the patient pathways across four Australian hospitals using process mining techniques. The study detects the differences visually in process variants to learn from each other. The challenges of this study; the clinical staff usually get a limited view of patient pathways, as a result, it is hard to provide better care, also another challenge; the relational databases do not exist across or even within hospitals. Therefore, merging data via unique identifiers is not straightforward, so the piecing health care data together is difficult. The study [22] proposed a framework based on process mining to analyze acute care from time dimension. The framework detected the time-critical medical procedures, and analyzed the causes of delay and evaluated the existing treatment process. The study has limitations such as: the methodology is tested on the data from only one hospital; another limitation is some medical activities are not recorded completely.

In conclusion, Table 1 shows the results of the literature review. The table demonstrates some points about the related works such as the research context, the specialty if specified, and the type of process mining activity. This literature presents applications of process mining in the healthcare sector. But after an investigation and research there are no previous papers devoted in Egypt to the hospitals’ business process mining. The next section describes the applied approach of process mining at a hospital in Egypt by applying different process mining perspectives: the control-flow perspective, the organizational perspective and, the performance perspective to discover more analysis and insights to support the management of the hospital.

## 2. The proposed approach

The papers will analyze the performance of the hospital by utilizing process mining techniques to detect any long waiting time or any deviation from the base model. The approach that’s implemented in this study consists of three main phases as it’s showed in Fig 2, (1) data

**Table 1. Overview of reviewed researches.**

| Paper | Application context | healthcare specialty | Type of activity | Used tool |
|---|---|---|---|---|
| [8] | Single hospital | Outpatient Clinic, Emergency Room, and Hospitalizations | application of discovery technique | ProM |
| [13] | Multiple hospital | Not specified | Conformance Checking | Disco |
| [14] | Single department | Emergency Room | Process Enhancement | ProM |
| [15] | Single hospital | Not specified | Performance analysis | ProM |
| [16] | Single department | Lung center | discovery technique and conformance checking | ProM |
| [17] | Single hospital | Hospitalization | Performance analysis | Statistical methods |
| [18] | Single hospital | General Medicine, and Cardiology | Process Enhancement | ProM |
| [19] | Single hospital | Emergency department | application of discovery technique | Disco |
| [20] | Single department | Emergency Room | application of discovery technique | ProM, Disco, ProDiscovery |
| [21] | Four hospital | Chest pain patient | application of discovery technique | ProM |
| [22] | Single hospital | Acute care | application of discovery technique | ProM |

https://doi.org/10.1371/journal.pone.0281836.t001

<!-- Page 7 -->

# Fig 2. Proposed methodology based on process mining for patient’s careflows.

![Flowchart with three large rounded rectangular panels arranged left to right and connected by arrows. Left panel title: "Preprocessing Phase". Inside it, a box labeled "Data Extraction" points right to a vertical cylinder labeled "Event logs", which points right to a box labeled "Preprocessing data". A rightward arrow connects this panel to the center panel. Center panel title: "Model Discovery Phase". Inside it, a top box labeled "Trace Clustering" points downward to a box labeled "Process Discovery". Below, a dashed connector leads to a lower box labeled "Evaluating models quality". A rightward arrow connects this panel to the right panel. Right panel title: "Analysis Phase". Inside it, a top long box labeled "Performance Analysis", a middle-right box labeled "Conformance Checking" shown with a dashed incoming connector, and a bottom long box labeled "Organizational Analysis". A bracket-like connector at left branches downward into the analysis boxes. All boxes are outlined in black on a white background.](figure)

https://doi.org/10.1371/journal.pone.0281836.g002

preprocessing; (2) model discovery phase; (3) analysis phase. If the approach starts with discovery model without applying any preprocessing steps or clustering techniques on the event logs, the output will be unstructured as it is represented in [Fig 3](figure). [Fig 3](figure) is considered as “spaghetti-like” or unstructured model that shows all paths and does not distinguish the critical path or trivial one, It seems a complicated and hard to read, understand, or conduct analysis tasks. The proposed approach includes many steps: firstly, it starts with the preprocessing phase; the event logs are extracted from the hospital information system of the hospital. Then,

# Fig 3. The first discovered process (A spaghetti model) using every trace.

![Very dense process-mining network diagram in black, gray, and white, spanning most of the page width. The graph begins at a small circular start marker on the far left feeding into a small rectangular node, then fans into a tall vertical stack of many tiny activity nodes near the left side. Nodes are shown as alternating small black filled squares, small white circles, and small outlined rectangles with tiny labels. Readable activity labels include "CT" near the lower left, "X-RAY" near the lower-middle/left, "MRI" near the center-left, "ECO" and "ECHO" in the left-central cluster, "CBC" and "INR" in the central area, "ACB" and "EKG" in the upper-central/right area, "ICU" in the lower-central/right area, and "exit" near the right side. Numerous thin curved gray arcs connect nodes across long distances, with many loops sweeping from the left cluster across the page to a compact right-side convergence node and back. The layout shows a classic “spaghetti” process model: many overlapping paths, branches, merges, and long return arcs, making the process visually tangled and difficult to follow.](figure)

https://doi.org/10.1371/journal.pone.0281836.g003

<!-- Page 8 -->

prepare event logs by filtering them from outliers, noise parts. Secondly, process models are mined from event logs by four famous process discovery miner algorithms, if the generated model seemed as a spaghetti model (unstructured model), clustering and grouping methods are used to cluster the whole event logs into parts that refine the spaghetti model into a simple visualized model. After discovering the models, an evaluating the quality of the discovered models to choose the fitness one to use it in the following steps; thirdly, the analysis phase is proposed from two perspectives; performance analysis to discover deviations, bottlenecks and the insights about the events and cases related to the time; organizational analysis to mine the relations between the resources of the hospital. All steps in this methodology are implemented on ProM framework which has enormous plugins.

## 2.1 Preprocessing phase

### 2.1.1 Extracting data.

Extracting data is how to build the event log from the raw data set, it is done by identifying the appropriate attributes that should be used in the event log, identifying the period to extract event logs, and extracting the events with high clarity. The event log often saved in an IEEE standard as XES (eXtensible Event Stream), which is supported by the wide majority of process mining tools.

### 2.1.2 Preprocessing data.

The extracted event log is not qualified to apply the after-mentioned process mining techniques on it; there are many issues in event log such as irrelevant data, noise data, outlier data, and missing data. Also, some process instances are incomplete because they were started before the data extract begins, all these issues must be solved to prepare the event log to be ready.

## 2.2 Model discovery phase

The model discovery is one of imperative process mining functions which automatically constructs process models from the event logs. The produced process model reflects the actual process as observed through real process executions. But it is critical to apply the clustering techniques before the model discovery to mine a simple model or sometimes after model discovery if it is needed. Clustering technique is a very useful for logs which contain various cases following different procedures, as in healthcare systems it is more frequent and common place.

### 2.2.1 Clustering techniques.

Two main approaches for clustering and simplifying the data are abstraction and clustering techniques. The abstraction technique is to aggregate the low level activities into one high level activity. The focus will be on most significant aspects of the process or the main activity. The clustering technique is to group the traces that have the same similarity into separate clusters. Every sub-log groups the traces that have very similar characteristics. There are a number of clustering algorithms has been developed for complex network such as fast fuzzy clustering (F2CAN) algorithm that perform accurate and fast clustering [23]. There are two main methods of clustering technique that can be used, trace clustering and sequence clustering. Trace clustering clusters careflows based up on trace profiles [24]. A trace profile contains certain characteristics of the trace that is identified as essential, e.g. Activities, a certain sequence of activities, medical service providers, etc. From ProM plugins that has been implemented upon this technique is ActiTrac [25]. The second clustering method is the sequence clustering, which focuses only on the sequence of activities in traces and creates more simple models than trace clustering [26]. Clustering not only allows discovering more comprehensible models, but also allows to identify or confirm subgroups based upon their behavior.

<!-- Page 9 -->

## 2.2.2 Process discovery.

Process mining considers the model discovery is the base step to build the model in such as graphical structure from the real events. Process discovery uses event log to generate a process model. Several techniques of discovery model are used to support the process mining, the earlier process discovery algorithm is $\alpha$-algorithm [27] used to produce a petri net that represents the event log. The algorithm analyzes the event log, then establishes different dependency relations between tasks. Relations between tasks considered as casual and also describe the sequence of the tasks. But it is sensitive to noise and incompleteness of the event logs. On real-life data, such algorithm does not work well. This section will provide descriptions of the four discovery model algorithms that are applied throughout the paper:

- **Heuristic miner** addresses many problems with the $\alpha$-algorithm; to create a model, event logs are analyzed by using the dependency values of the activities. Two steps to build a model by the heuristics miner are: creating dependency graph and creating causal matrix. Dependency graph illustrates the dependency (causality) of events. To create a dependency graph, the dependency matrix, and the length-one loop dependency are built. It builds the directly-follows matrix by using the frequencies between the activities. Then it gets the dependency matrix by using the formula:

$$
|=>| = \frac{((|a > b| - |b > a|))}{((|a > b| + |b > a| + 1))}
$$

(1)

> directly follows, $a > b$ means $a$ is directly followed by $b$

The above Eq (1) calculated all cells in the dependency matrix. Now the gotten values between minus 1 and plus 1. a negative value means actually that there’s a negative relation. a high value in the plus side means that there’s a strong relation. Then the heuristic Miner builds a causal matrix to represent the correct process model. There are two types of non-observed activities, which are AND and XOR. The AND type represents parallel activities, while the XOR type represents sequential activities. By filtering certain relation and then using particular patterns, the Petri net is generated.  
This algorithm is useful when there is real-life data with a limited number of diverse events, one of the advantages of this algorithm is to output a Heuristics net and that a heuristic net that can be changed to other types of process models, such as a petri net is used for further analysis in ProM. It considers frequencies and significance in order to filter out noisy or infrequent behavior, which makes it less sensitive to noise and incomplete logs. Additionally, it can identify short loops. Thirdly, it permits single activities to be skipped. It does not guarantee the soundness of the process model [28].

- **Inductive miner** includes two steps to achieve its work, firstly it creates Stochastic Task Graph (SAG) from event log, and at that point, it synchronizes the structures of event log instances, to generate the process model. It discovers a main split in the event log (there are different types of splits: sequential, parallel, concurrent and loop). Once the split has been discovered, the algorithm iterates over the sub-logs (found by applying the split), until a base case is identified. There are different variations of the algorithm, one of them—IMDFc—avoids the recursion on the sub-logs in favor of using the Directly Follows graph. It guarantees the soundness of the process model and a good fitness model.it internally does not work on petri nets but uses process trees then convert it to petri net [29].

- **ILP miner** “an integer linear programming” approach based on the language-based theory of regions. That always results in a petri net that fits the event log perfectly, meaning that all traces can be replayed successfully on the net. ILP-based discovery algorithms mine causal

<!-- Page 10 -->

dependencies between activities that are detected in the event log. However, it can produce models that are not very structured and less readable (i.e. spaghetti models). This approach performs well only under the assumption that the process under analysis shows frequent behavior, thus it results to be ineffective in describing low-frequent exceptional behavior. ILP miner is very sensitive to noise, as all traces need to be repayable in the net. It is not preferred to use this miner on real-life logs. The ILP miner outputs petri net model, As many calculations are required to solve ILP problems, ILP miners are typically slower than other algorithms. It is difficult to achieve progress on this topic because these problems are NP-hard [30].

- **ETM miner** “Evolutionary Tree Miner” based on a genetic algorithm that allows the user to control the model discovery process based on user preferences to the four quality metrics: fitness, complexity, precision, and generalization. It based on process tree in its implementation, so no unsound model is generated. To achieve its work, ETM as genetic algorithm does several steps. When the event log of the observed behavior is input. A population of random process trees is created, and each tree contains exactly one instance of each activity. Then, for each candidate in the population, the four quality dimensions are determined. The overall fitness of the process tree is calculated using the weights assigned to each dimension. In the following step, certain stop criteria are checked, such as locating a tree with the desired overall fitness. If any of the stop requirements are met, the candidates in the population are modified and the fitness is again calculated. This process is repeated until at least one stop requirement is met. And the fittest candidate is then returned [31]. The technique successfully handles the problems like non-trivial constructs and/or noise present in the log. This genetic algorithm approach used global search techniques to handle these problems rather than depending on local information, Experiments were carried out using synthetic and real-life logs to explain that the fitness metric is complete and precise. The ETM execution time was extremely long (several hours on our target computer), and the computation failed several times due to memory lack (i.e. java heap space).

## 2.2.3 Evaluating the quality of the discovered models.

Wil van in [30] proposed four quality dimensions of the discovered process model: fitness, simplicity, precision and generalization. **Fitness** means that the process model is capable of displaying all trace in logs from beginning to end. **Simplicity** means the simplest model that can be the best to describe the behavior of the model. It concerns on the human comprehension since it will be difficult to understand and reveal complex process models. The simplicity expresses the complexity of the process model. It can be measured by the number of arcs and nodes which are used in the process models. **Generalization** refers to the process model that gives more behaviors which are not existent in the event logs displaying in the model. Lastly, the precision implies to the ability of the model which disallowed undesirable behavior.

# 2.3 Analysis phase

The analysis tasks are to provide insights into the processes in the business. The analysis in process mining can be presented through the performance analysis and organizational analysis.

## 2.3.1 Performance analysis.

The performance analysis can be implemented by:

**Conformance checking** that used to detect an existence deviation in the discovered careflow model from what was planned through handmade model.

<!-- Page 11 -->

**Statistics analysis** to measure some metrics such as the consuming time of the case process, the consumed time for each activity, as well as the resources used with each activity, what activities consume a lot of time, as well as the long waiting times before the activity start.

## 2.3.2 Organization analysis.

The social network miner used process logs to discover the social networks. because there are several social network analysis methods and research results available, The resulting social network enables analysis of the social relations between originators involving process executions.

# 3. The discussion and results

## 3.1 The case study

The data set was collected from the heart surgery unit in an Egyptian hospital, where the hospital received more than 1233 heart treatment cases, and only 1233 cases that started and ended its treatment during the six months from January 2021 to May 2021. The business process as it is planned by the healthcare professionals shown in Fig 4, The patient’s journey begins with “Admission to Hospital” activity and ends with “Discharge and Leave” the hospital. Some or few of activities are interposed the two activities such as “First Consultation Checkup”, “Second Consultation Checkup”, “Radiology Tests”, “Laboratory Tests”, “Scheduling Patient Appointment”, “Cardiac Stent”, “Diagnostic Catheterization”, “Recuperation Ward”, “Prepare patient for Surgery”, “Blood Bank”, “Perform open heart Surgery”, “ICU”. Surely, a business process depends on the careflow which includes event logs that build complete cases, Fig 5 shows a part of the event log that contains one case of one patient. All including activities points to activities of the patient into the cardiac care department and related activities occurred in other departments. Service fees, names of the patients, and the names of work staff are hidden as the hospital’s privacy issues.

## 3.2 Preprocessing phase results

This phase is the primary stage that firstly includes extracting the events from the data set and how to select the appropriate attributes that should be used in the event log, then the extracted log is cleaned and prepared for importing into the ProM framework.

![Process flow diagram labeled as the general business model for heart surgeries in the hospital. The diagram is a left-to-right workflow with black arrows, white rectangular activity boxes outlined in purple, small orange diamond gateway symbols at merge/split points, a hollow black start circle on the far left, and a hollow black end circle on the far right. Main visible flow begins at "Admission to Hospital", then "1st Consultant Checkup". From there, branches lead to "Recuperation Ward" at the top, "Cardiac Stent", "Diagnostic Catheterization", "Laboratory Tests", "Radiology Tests", and "Consultant Checkup" near the bottom. These branches reconnect through multiple orange gateways into "Scheduling Patient Appointment", then "Admission Request", "Prepare patient for Surgery", "Blood Bank", "Perform open heart Surgery", "ICU", and finally "Discharge & leave". Long connecting arrows loop from upper branches and lower branches back into the central path, and one long top connector runs from near "Recuperation Ward" across to the final section before discharge. Another long connector from "Cardiac Stent" returns into the surgery preparation stream. The layout shows several alternative or prerequisite activities converging before surgery-related steps and discharge.](figure)

**Fig 4.** General business model for the heart surgeries in the hospital.

https://doi.org/10.1371/journal.pone.0281836.g004

<!-- Page 12 -->

![Table figure titled by caption "Fig 5. A part of event log." A bordered table with 10 columns and multiple rows. Column headers from left to right: ActivityNo, CaseNo, ActivityName, StartDate, FinishDate, org:resource, Age, Gender, Service fees, Refer from. The first and last visible rows contain dotted placeholders ".........." indicating omitted rows. Visible records all have CaseNo 11519171, Age 55, Gender Male, Service fees 0, and Refer from Doctor. Row details: A24028 Admission to Hospital, 2/1/2021 10:00 to 2/1/2021 10:30, Receptionist 1. A24038 1st Consultant Checkup, 2/1/2021 11:00 to 2/1/2021 12:00, General Practitioner1. A24048 Laboratory Tests, 2/1/2021 12:00 to 2/4/2021 13:00, Laboratory specialist 1. A24058 Diagnostic Catheterization, 2/5/2021 10:30 to 2/5/2021 11:30, Catheter and stent surgery team. A24068 Recuperation Ward, 2/5/2021 11:30 to 2/6/2021 14:00, ward nurse 2. A24078 Consultant Checkup, 2/6/2021 14:30 to 2/6/2021 15:00, cardiology consultant 2. A24088 Scheduling Patient Appointment, 2/7/2021 9:00 to 2/12/2021 9:00, Administration official 1. A24098 Admission&Request, 2/12/2021 9:30 to 2/12/2021 10:00, Receptionist 3. A24108 Prepare patient for Surgery, 2/12/2021 10:30 to 2/16/2021 11:00, nurse care 1. A24118 Blood Bank, 2/15/2021 10:00 to 2/15/2021 11:00, Blood bank. A24128 Perform open heart Surgery, 2/16/2021 11:00 to 2/16/2021 15:00, Open heart surgery team. A24138 ICU, 2/16/2021 15:00 to 2/21/2021 13:00, ICU nursing 2. A24148 Recuperation Ward, 2/21/2021 13:00 to 2/26/2021 13:30, ward nurse 2. A24158 Cardiac Stent, 2/5/2021 10:30 to 2/5/2021 11:30, Catheter and stent surgery team. A24168 Radiology Tests, 2/1/2021 12:00 to 2/4/2021 14:30, Radiology specialist 1. A24178 Discharge &Leave, 2/26/2021 14:30 to 2/26/2021 15:00, Receptionist 2. Below the table are the caption and a DOI link.](figure)

**Fig 5.** A part of event log.

https://doi.org/10.1371/journal.pone.0281836.g005

## 1- Extracting data.

The undertaken hospital uses a hospital information system to manage their business and data. The hospital database contains more than 40 tables to serve all aspects of the hospital, but this study concerns deeply on tables that related to the patient movement and its relations to collect the complete activities about the patient. Tables describe services are introduced to the patient such as admission, labs, radiology, wards, surgery, and medication departments. Fig 6 shows the necessary tables used to define and extract the event logs of the dataset. Each table describes an activity in general or data needed to describe the event, every activity table contains data about time, resources, originator, and other useful information for the performance or organizational analysis. The tables have relationships among them. Queries used to filter the final dataset depending on these tables from the hospital information system.

## 2- Preprocessing phase results.

This phase is the primary stage firstly includes extracting the events from the data set and how to select the appropriate attributes that should be used in the event log, then the extracted log is cleaned and prepared for importing into the ProM framework.

a. **Data cleaning:** before any cleaning process; “patient’s name” attribute was converted into IDs or code number to maintain the confidential and privacy. Then, any duplicate records were deleted. It is important removing irrelevant data such as noise and outlier data from the event logs for better results. The boxplots for event duration time are used for detecting the outlier and take a decision to remove it or change the value to new value. Fig 7 (a) and 7(b) is for boxplots for events duration time. The activities “Admission to Hospital”, “Cardiac Stent”, and “Discharge Leave” are usually taking a fixed time, so the outliers from these activities will return to the known fixed time. Other outliers from other activities will be removed.

b. **Handle missing values:** there are 44 empty values or noise data in the event logs in column “StartDate” and column “FinishDate”. The suitable handling is to fill the empty cells with

<!-- Page 13 -->

![Entity-relationship style database model diagram for the case study. Three vertical groups of light-blue headed tables with white attribute sections connected by crow’s-foot relationship lines. Left column tables from top to bottom: "blood_bank" with one field shown as "......."; "surgery service" with field "....."; "lab_exam service" with field "...."; "medication service" with field "....."; "radiology_service" with field "....."; "admitttion service" with field "....". Center column: "case" with fields "case_no", "patient", "case_startdate", "case_enddate"; below it "service" with fields "service_no", "case_no", "timestamp", "originator", "placed"; below that "Ward" with field "...."; below that "clinic" with field ".....". Right column: "patient" with fields "patient_id", "patient_age", "patient_gender", "....."; below it "physicans" with field "....."; then "nurses" with field "....."; then "other workers" with field "....."; then "ICU" with field ".....". Relationship lines connect left-side service-type tables into the central "service" / "case" structure, "case" to "patient", "service" to staff tables on the right, and "service" / location-related entities to "Ward", "clinic", and "ICU", all shown with crow’s-foot and circle/bar cardinality markers.](figure)

**Fig 6. Database model for the case study.**

https://doi.org/10.1371/journal.pone.0281836.g006

the mean values of the same event of other cases as approximations of the true values. Step a and b (Removing outliers and noises, and handling missing values from the event log) are implemented using Python Pandas.

c. **Incomplete process instances:** To clean up data, it should remove those incomplete process traces from the log. The ProM platform have many plugins to deal with the noise from traces or event attributes such as plugin of “Filter log on trace attribute values”, “Filter log on event attribute values”, and “Filter log using simple heuristics”. These plugins provide

<!-- Page 14 -->

# Fig 7. Boxplots for events durations.

![Two-panel figure of boxplots titled "Boxplots for events durations" on both panels. Left panel (a) has y-axis label "Duration in minuts" with scale from 0 to 120 in increments of 20, and x-axis label "ActivityName". Three activity categories are shown with rotated labels: "Admission to Hospital", "Cardiac Stent", and "Diagnostic Catheterization". "Admission to Hospital" is a blue boxplot with box roughly from 20 to 30 minutes, median around mid-20s, whiskers extending to about 40, and outlier points near 60, 80, and 90 minutes. "Cardiac Stent" appears collapsed around 40 minutes with outliers near 30, 50, 60, 80, 90, and 100 minutes. "Diagnostic Catheterization" appears collapsed around 40 minutes with outliers near 20, 30, 50, 60, 80, 90, and 100 minutes. Below the left panel is label "(a)". Right panel (b) is another boxplot chart with the same y-axis label "Duration in minuts", scale 0 to 120, x-axis label "ActivityName", and one rotated category label "Discharge &Leave". The distribution is centered around 30 minutes with outliers near 20, 80, and 90 minutes. Below the right panel is label "(b)".](figure)

https://doi.org/10.1371/journal.pone.0281836.g007

the ability to eliminate all traces that do not begin and/or end with a particular event. By calculating the frequency of event recurrence, it can also eliminate all events related to the specific process task. [Table 2](#table-2-event-data-before-and-after-applying-preprocessing-phase) illustrates a statistic for the event log data before and after applying preprocessing phase.

## 3.3 Model discovery phase results

There are two main techniques to solve the difficulties in the event log when mining structured model before apply the mine discovery algorithms. The paper used the abstraction and clustering techniques to simplify the discovered models.

**1- Clustering techniques.** The initial event log contains a hug number of data as a result from a vast number of activity sequences within low level abstraction, which generates a spaghetti model as it’s shown in [Fig 3](figure). This model is unstructured and difficult to understand. In order to apply the discovery and analysis process; it is necessary for the model to be simple and structured. This paper implemented some techniques to solve these difficulties, such as abstraction and clustering techniques. The abstraction technique is to aggregate the low level activities into one high level activity. The focus will be on the most significant aspects of the process or the main activity, this case study will concern on the department level not its low details that happen in the department. For example; the Radiology department contains many low activities such as “register, scheduling, ultrasound, scan abdomen, chest X-ray, CT scan brain, report, send report, and discharge”. All these activities will be discarded and merged in one main activity titled as “Radiology”. Also, this action will be applied to the low level activities in Lab department to merge to them in one main abstraction Lab activity. In the clustering

### Table 2. Event data before and after applying preprocessing phase.

|  | No. of cases | No. of events | No. of activities | No. of processes |
|---|---:|---:|---:|---:|
| Before apply filters | 1233 | 20860 | 15 | 1 |
| After apply filters | 961 | 8176 | 15 | 1 |

https://doi.org/10.1371/journal.pone.0281836.t002

<!-- Page 15 -->

![Cluster diagram from the “ActiTraC” method. Five rectangular nodes connected by black lines in a left-to-right branching layout, with two circular split/join symbols containing an “X” on the connecting lines. Top left node labeled “xes906” with a pink-to-light background. Text inside: traces 961 (100.0%), dpi 53 (100.0%), ICS-fitness 0.4801391, PM 0.0, fitting dpi 0. To its right, connected horizontally, a bright green node labeled “xes906_01” with: traces 718 (74.71%), dpi 8 (15.09%), ICS-fitness 1.0, PM 1.0, fitting dpi 8. From the lower right of xes906 a diagonal line goes to the first circular X symbol; from that circle a horizontal line goes right to gray-green node “xes906_02” with: traces 58 (6.03%), dpi 3 (5.66%), ICS-fitness 1.0, PM 1.0, fitting dpi 3. The diagonal continues down-right to a second circular X symbol; from it a horizontal line goes right to node “xes906_03” with: traces 41 (4.26%), dpi 2 (3.77%), ICS-fitness 1.0, PM 1.0, fitting dpi 2. Another diagonal continues down-right to greenish node “xes906_other” with: traces 144 (14.98%), dpi 40 (75.47%), ICS-fitness 0.3287311. In the lower left of the figure, summary text reads: Average ICS-fitness 0.8994144; Average PM 0.85015607; Number of clusters 4.](figure)

Fig 8. Four clusters generated from “ActiTraC” method.

https://doi.org/10.1371/journal.pone.0281836.g008

technique, the traces that have the same similarity will be grouped into separate clusters. Every sub-log groups the traces that have very similar characteristics. Patients of the traces are grouped into the same cluster based on the characteristics of their care journeys.

This paper proposed to use the trace clustering method by using “ActiTraC” plugin, and Markov cluster algorithm “MCL”. The generated clusters from “ActiTraC” plugin as it’s shown in Fig 8, there are four clusters generated has the same interesting. So the experts of the hospital did not accept this result. Another try to apply trace clustering using Markov cluster algorithm “MCL” [32]. The MCL finds the traces that are similar based on selected perspectives. The Table 3 shows the properties of the two clusters generated from using the ProM plugin “cluster cases using Markov clustering” based on “refers from” attribute, also Fig 9 shows petri net models of the two generated clusters.

After a consultation with the experts in the undertaken hospital, they see no point in relying on the previous trace clustering results. So they were agreed to do the clustering upon on the

## Table 3. The properties of the two clusters generated from using Markov clustering algorithm.

|  | No. of cases | No. of events | No. of activities | No. of originator | Refers from |
|---|---:|---:|---:|---:|---|
| Cluster1 | 564 | 5159 | 15 | 23 | “Doctor” |
| Cluster2 | 397 | 3017 | 13 | 20 | “Emergency” |

https://doi.org/10.1371/journal.pone.0281836.t003

<!-- Page 16 -->

![Two BPMN process-flow diagrams from a medical care pathway. Top diagram labeled **Cluster1 Refers from “Doctor”**. Flow starts at a black-outlined start circle, then rounded boxes: **Admission to Hospital** → **1st Consultant Checkup**. From there multiple looping paths branch through gateway diamonds and activity boxes including **Diagnostic Catheterization**, **Laboratory Tests**, **Consultant Checkup**, **Radiology Tests**, and **Scheduling Patient Appointment**. These converge near **Cardiac Stent** and then continue rightward through **Admission Request** → **Prepare patient for Surgery** → **Blood Bank** → **Perform open heart Surgery** → **ICU** → **Recuperation Ward** → **Discharge & Leave**, ending at a black-outlined end circle. Bottom diagram labeled **Cluster2 Refers from “Emergency”**. It also starts with **Admission to Hospital** → **1st Consultant Checkup**, then branches through **Laboratory Tests**, **Prepare patient for Surgery**, **Radiology Tests**, **Consultant Checkup**, **Admissions Request**, and **Scheduling Patient Appointment**, with looping arrows and gateway diamonds. The flow converges to **Diagnostic Catheterization** → **Cardiac Stent** → **Recuperation Ward** → **Discharge & Leave** → end circle.](figure)

**Fig 9. BPMN models of the two clusters generated from using Markov clustering algorithm upon on refers from attribute.** (a) Cluster refers from “Doctor” (b) Cluster refers from “Emergency”.

https://doi.org/10.1371/journal.pone.0281836.g009

interesting they need, upon the main activity that the cardiac consultant decided for the patients. The main three categories of clustering upon: 1) cardiac stent or diagnostic catheterization surgeries, 2) heart surgery, 3) the rest of the traces that do not include any surgery will be added into the third cluster named “medication”. The clustering process generated three clusters based on a certain sequence of event series. The generated clusters logs were converted to petri net models as it is shown in [Fig 10](#).

## 3.3.1 Process discovery results.

The domain experts in the hospital have prepared a hand-made process model for planning the patient’s processes during his healthcare journey once s/he admitted to the hospital at the end of the journey. The domain experts predict that their hand-made model is idealized for planning the processes, but in many times it’s far from the actual processes that performed. Process mining considers the model discovery is the base step to build the model in such as graphical structure from the real events. For illustration purpose, the names of the activities will be represented by letters as it is shown in [Table 4](#). [Table 5](#) shows the most frequent and the complete traces in the event logs that are 87% from the original event log without any anomaly trace. Process discovery uses event log to generate a process model. Based on the process model, the domain experts in the hospital can apply other process mining techniques such as conformance checking and performance analysis to gain deeper insights into the hospital. This paper applied four popular process discovery miner algorithms to the data set of the hospital and compared among generated models to select one model with the high scores in the quality metrics (fitness, precision, generalization, simplicity). In the following section, a petri net figures Figs [11–14](#) output from applying the discovery miner algorithms, these petri nets will be the input to next step of “Evaluation of the quality of the discovered models”; The four used mining algorithms are heuristic miner [28], inductive miner [29], ILP miner [30, 33], and ETM miner [31, 34]. These algorithms are supported in Prom, guarantee complete traces, and output a petri net model.

## 3- Evaluation of the quality of the discovered models.

Throughout this section, the paper introduces how it measured the four quality metrics (fitness, precision, simplicity, and generalization) to evaluate the performance of the discovered process models:

- **Fitness metric** is measured using the alignment-based conformance checking method, in general the early alignment methods [35] depended on replaying each trace against the

<!-- Page 17 -->

# PLOS ONE

## Patient’s care journey using process mining

![Figure with three BPMN process models labeled (a), (b), and (c), each drawn left-to-right with start and end events as open circles, rounded rectangles for activities, diamonds for gateways, and arrows showing flow.  
(a) Sequence begins at start, then "Admission to Hospital", "1st Consultant Checkup", gateway, "Laboratory Tests", "Radiology Tests", gateway, "Scheduling Patient Appointment", "Diagnostic Catheterization", gateway, "Cardiac Stent", "Recuperation Ward", gateway, "Consultant Checkup", "Discharge &Leave", then end. Curved bypass arrows connect across several steps, including from earlier gateway/activity regions to later nodes.  
(b) Begins start → "Admission to Hospital" → "1st Consultant Checkup". From there multiple outgoing branches to "Scheduling Patient Appointment", "Blood Bank", "Perform open heart Surgery", "ICU", "Consultant Checkup", "Admission&Request", "Prepare patient for Surgery", and also to a lower parallel structure containing "Diagnostic Catheterization", "Cardiac Stent", "Radiology Tests", and "Laboratory Tests". These lower activities merge through gateways to another merge, then to "Recuperation Ward", then up to a gateway leading to "Discharge &Leave" and end. Upper branches also curve to the same discharge gateway.  
(c) Begins start → "Admission to Hospital" → "1st Consultant Checkup". From there branches lead upward to "Diagnostic Catheterization", "Consultant Checkup", "Laboratory Tests", "Radiology Tests", and downward through a gateway to "Prepare patient for Surgery" and another gateway to "Admission&Request". Several upper branches merge through gateways into "Scheduling Patient Appointment", then through another gateway to a final merge near "Discharge &Leave". "Prepare patient for Surgery" and "Admission&Request" also feed this final merge. Final sequence is "Discharge &Leave" → end.](figure)

**Fig 10. BPMN models generated after clustering patients upon on the interest of hospital’s experts.** (a) Cardiac Stent and Diagnostic Catheterization (b) open heart surgery (c) without any surgery just a medication.

https://doi.org/10.1371/journal.pone.0281836.g010

process model one event at a time. The error in replay happens when there are ignore/skip an event in the log or to ignore/skip task in the process model. This drawback is fixed by later alignment techniques in researches of [35, 36], where the closed corresponding trace that can be parsed by the model is identified for each trace. This paper used the Prom plugin named “Replay a log on petri net for conformance analysis” that was derived from the alignment-based conformance checking in [35, 36]. This plugin takes the petri net that generated from the four discovery miners and the event log after filtering, the outputs from this plugin

## Table 4. Index of the activities.

| Index | Activity | Index | Activity |
|---|---|---|---|
| A | Admission to Hospital | I | Recuperation Ward |
| B | 1st Consultant Checkup | J | Admission&Request |
| C | Laboratory Tests | K | Prepare patient for Surgery |
| D | Radiology Tests | L | Blood Bank |
| E | Consultant Checkup | M | Perform open heart Surgery |
| F | Scheduling Patient Appointment | N | ICU |
| G | Diagnostic Catheterization | X | Discharge &Leave |
| H | Cardiac Stent |  |  |

<!-- Page 18 -->

## Table 5. Most frequent traces.

| Trace | Freq% |
|---|---:|
| A-B-C-D-G-I-X | 24.3% |
| A-B-G-I-X | 13.1% |
| A-B-C-D-G-H-I-X | 11% |
| A-B-G-H-I-X | 7.4% |
| A-B-F-G-H-I-X | 7% |
| A-B-C-D-F-G-H-I-X | 6% |
| A-B-C-D-E-F-J-K-L-M-N-I-X | 3% |
| A-B-C-D-G-E-B-C-E-J-K-L-M-N-I-X | 3% |
| A-B-C-D-H-G-I-E-F-J-K-L-M-N-I-X | 2.7% |
| A-B-G-E-C-D-E-F-J-K-L-M-N-I-X | 2.2% |
| A-B-G-H-I-E-F-J-K-L-M-N-I-X | 2% |
| A-B-C-D-F-G-H-I-F-J-K-L-M-N-I-X | 2% |
| A-B-C-D-G-E-X | 1.7% |
| A-B-C-D-E-F-J-K-X | 1.7% |

https://doi.org/10.1371/journal.pone.0281836.t005

are a “Result Replay” and “log contains statistical information such as trace fitness”. The Fig 15 shows the result of replaying the petri net from inductive miner as one from the four applied discovery miners with extracted log after filtering. Fig 16 shows the output statistical information from replay petri net (from the inductive miner) with the extracted log. This step is applied on the petri nets of the other three discovery miners (heuristic, ILP, and ETM).

**The precision metric and the generalization metrics** are measured by using the plugin of “Measure the Precision/Generalization” that needs three elements (the petri net, event log, and result replay of the Fig 15 as input to it). The plugin of “Measure the Precision/Generalization” measures the precision using the method that introduced in [37]. This method measures precision by aligning the logs to the process model, if all activities by the model are actually

![Process model diagram labeled "Fig 11. Result model from heuristic miner." A long horizontal Petri-net-like process model spans nearly the full page width. It consists of alternating small white circular places and black square transitions connected by thin gray arrows and multiple looping arcs above and below the main path. The model begins at a small white circle on the far left, proceeds through several white rectangular transition boxes and black square nodes into a dense central section with multiple parallel branches. In the center are repeated groups of black square transitions connected through white circular places and white rectangular boxes, with several long curved arcs linking earlier and later nodes, creating layered loops above and below the main line. Toward the right, the branches reconverge into a simpler sequence of nodes and end at a small white circle. No internal node labels are legible in the image. Caption appears directly below the figure.](figure)

**Fig 11. Result model from heuristic miner.**

https://doi.org/10.1371/journal.pone.0281836.g011

![Process model diagram labeled "Fig 12. Result model from inductive miner." Another horizontal Petri-net-like process model across the page, visually simpler and more structured than Fig 11. Starting from a small white circle at far left, the path passes through white rectangular boxes and black square transitions into a branching cluster near the left-center. Several parallel branches fan upward and downward from a central black square, each branch containing alternating white circular places, black square transitions, and some white rectangular boxes. Curved gray arcs loop from the top and bottom branches back into a central merging black square. After this merge, the process continues rightward through a linear sequence with occasional short upper and lower branches, including paired black square transitions around white rectangular boxes, then terminates at a small white circle at the far right. No node text is legible. Caption appears below the diagram.](figure)

**Fig 12. Result model from inductive miner.**

https://doi.org/10.1371/journal.pone.0281836.g012

<!-- Page 19 -->

PLOS ONE

Patient’s care journey using process mining

![Large Petri net diagram labeled as Figure 13. The figure occupies most of the page and shows a dense process-mining Petri net from the ILP miner. It contains many rectangular transition boxes labeled with letters including A, J, L, M, B, F, I, N, C, D, E, H, G, K, and X, connected by numerous curved arcs. Small circular places appear between transitions, with many parallel and looping paths spanning left to right and top to bottom. A begins near the far left after a small start circle; X appears near the far right before an end circle. The center is dominated by dozens of tightly packed horizontal and wavy arcs, creating a highly tangled network with repeated long loops around the perimeter and multiple crossings among mid-page nodes such as B, C, D, E, F, H, and I.](figure)

**Fig 13. Petri net from the ILP miner.**

https://doi.org/10.1371/journal.pone.0281836.g013

![Long, narrow Petri net diagram labeled as Figure 14. This process model runs horizontally across the page and is much more structured than Figure 13. It starts at a small start circle leading to A on the left, then proceeds through sequences of black square transitions, white circular places, and labeled rectangular transitions. Clusters of looping branches appear around groups containing G, H, B, C, D, E, F, I, J, K, M, and N. Midway, a boxed C with D and E nearby forms a small branch. Later, another cluster shows F and G, followed by a larger block with I, J, K, M, N, E, F, and H connected in parallel and looping paths. Near the right end, a compact group contains C, J, E, and D before reaching X and an end circle. The layout is linear overall with local subnet loops and synchronization points.](figure)

**Fig 14. Result from ETM miner algorithm.**

https://doi.org/10.1371/journal.pone.0281836.g014

<!-- Page 20 -->

![Petri net replay diagram spanning the page width. A left-to-right process model with circles and rectangular transition boxes connected by directed arcs. The network begins with a small white start place, then a blue-green rectangular activity, a yellow circular place, a blue/red rectangular activity, another yellow place, and a black rectangular transition. In the middle, the net branches into multiple parallel and alternative paths with stacked black, green, cyan, and red-outlined rectangular transitions connected through yellow and white circular places. Several arcs loop and merge back into a central black transition, then continue rightward through more white/yellow places and colored rectangular transitions, including a sequence of red-outlined boxes and green boxes near the right side. The diagram ends with a blue/red rectangular activity, a yellow place, a green rectangular activity, and a final white end place. No axis or legend is visible; it is a process graph with many colored nodes indicating replay results.](figure)

**Fig 15. Result Replay of Petri net based on inductive miner with extracted log.**

https://doi.org/10.1371/journal.pone.0281836.g015

observed, then precision is ‘1’. the method based on Eq 2 below:

$$
Precision(Log, Model) = \frac{1}{|e|} + \sum_{ee} \frac{|en_L(e)|}{|en_M(e)|}
$$

(2)

Where each event $ee \in e$, $e$ is the collection of unique events, $en_M(e)$ the number of enabled activities in the model, and $en_L(e)$ is the number of the observed activities actually executed. The value of the precision between ‘0’ and ‘1’. If the value near to ‘0’ the model is underfitting, in

![Screenshot of a software panel titled "Inspector" on a light gray background. Across the top are four dark rounded tabs labeled "Info", "Display", "Filter", and "Export"; the "Info" tab is selected. At upper right are two small toolbar icons. Below is a large black inspector pane with expandable sections listed in italic light text with red triangle bullets: "Legend", "View", "Elements Statistics", and expanded "Global Statistics (non-filtered traces)" with a white downward triangle. Inside is a dark gray table with two column headers, "Property" and "Value". Visible rows include: "Calculation Time (ms)" — "2.6638470343392306"; "Num. States" — "63.580645161290334"; highlighted in dark red, "Trace Fitness" — "0.9477877254793351"; "Title of Visualization" — "Alignments of xes906 on a0..."; "Exit code of alignment for tra..." — "1.0"; "Model move cost empty trace" — "5.0"; "Number of LPs solved" — "1.1841831425598337"; "Queued States" — "63.80020811654526"; "Raw Fitness Cost" — "0.8439125910509887"; partially visible lower row "Move-Model Fitness" — beginning "0.974340239490..." A vertical scrollbar appears on the right side of the table.](figure)

**Fig 16. The statistical information obtained from replay Petri net based on petri net from inductive miner with extracted log.**

https://doi.org/10.1371/journal.pone.0281836.g016

<!-- Page 21 -->

opposite if the model near to ‘1’ is more precise. Also, the plugin of “Measure the Precision/ Generalization” measures the generalization using a similar approach as it used for precision measuring. The approach based on the Eq 3 below to quantify the generalization:

$$
Generalization(Log, Model) = 1 - \frac{1}{|\varepsilon|} + \sum_{e\varepsilon} pnew(|diff(e)|, |sim(e)|)
$$

(3)

Where each event $e\varepsilon$, $\varepsilon$ is the collection of unique events, $pnew(w;n)$ is the estimated probability that next visit to stat $stateM(e)$ will reveal a new path not seen before, $w = |diff(e)|$ is the number of unique activities observed leaving state $s$ and $n = |sim(e)|$ is the number of times $s$ was visited by the event log. Fig 17 shows screen shot of a result from the plugin “measure precision/ generalization” of a petri net based on inductive miner.

- **The simplicity metric** quantifies complexity of the model as “how number of arcs and nodes in the model”. The simplicity concept concerns on the model itself not relating to the event log. The [38, 39] introduce a number of metrics to measure the simplicity or complexity of the model such as size, diameter, density, connectivity, node degree, separability structuredness, sequentiality, depth, gateway mismatch, gateway heterogeneity, control-flow complexity(Cardoso), cyclicity, token splits, and soundness. There is no single perfect metric that can be used for quantifying the simplicity. All metrics has pros and cons issues. This paper will use a new method to quantify the simplicity metric and decide if the discovered model is simple or not, and what is the simpler model than others. The new method is summarized into two steps: Firstly; checking the soundness of every model resulted from the miner algorithms. Then second step; measuring the metrics of control-flow complexity (Cardoso), cyclomatic, and structuredness.

A. **Check the soundness:** The process model is sound when it is able to achieve three properties: 1) option to complete; reaches the end state of process model from any state; 2) proper completion: there are no token left behind when reach the final state of process model; 3) no dead transition: each transition in the model can be enabled. The paper used the ProM plugin “Analyze with Woflan” to check the soundness of each model resulted from the discovery miner algorithm. The output from the plugin states that only the models based on the inductive miner and ETM miner are sound. So; the other models based on ILP and heuristic miner algorithms are discarded from the next step.

![Screenshot of a software window from ProM. Top left shows the ProM logo in a blue rectangle. A dark title bar reads: “Precision/Generalization of Extracted_traces_23456.csv (filtered on simple heuristics) to 4fb4…” with the ending cut off at the right edge. On the right side of the top bar are three large icon buttons: a document-like icon, a triangular play icon, and an eye icon, each in rounded dark gray tabs. The main white results panel below shows two lines of output in large serif text: “Precision : 0.54091” and “Generalization : 0.98693”. The screenshot is cropped so only the upper part of the application window and left side of the results area are visible.](figure)

**Fig 17.** Precision and generalization results of Petri net based on inductive miner.

https://doi.org/10.1371/journal.pone.0281836.g017

<!-- Page 22 -->

B. **Measuring the metrics of ‘density’, ‘control-flow complexity (Cardoso)’, ‘cyclomatic’, and ‘structuredness’.** the density is the relation between the number of arcs and the maximum number of arcs between all nodes, Control-Flow Complexity(Cardoso) is sums of all choices of a process based on the number of splits of each type and its number of outgoing arcs, Cyclomatic is the number of nodes within cycles with regard to the all number of nodes, it is calculated by the rule: $CM = |E||V| + P$; where $E$ is number of nodes, $V$ is number of edges, $P$ is number of connected components. Structuredness is the proportion of well-structured parts with respect to the rest (non-structured) in the process model. The structuredness ratio of the process graph is measured by decreasing the number of nodes in the reduced process graph from the one and divided by the number of nodes in the original process graph. The paper used ProM plugin “Show Petri net metrics” to get the values of the above metrics (Cardoso, Cyclomatic, and Structuredness). Table 6 shows the output values of the metrics (Cardoso, Cyclomatic, and Structuredness) for the models based on the inductive and ETM discovery miners.

The results of the Table 6 show that both models based on inductive miner and ETM miner algorithms are simple, the values of the metrics (Cardoso, Cyclomatic, and structuredness) indicates that model based on inductive miner is simpler than the model based on ETM miner.

Table 7 shows the results of the four miner algorithms in the four quality evaluation metrics (fitness, precision, generalization, complexity). It is shown that the inductive miner algorithm scores the highest values in fitness and generalization issues, followed by ETM miner algorithm. The inductive miner algorithm scores a low value in precision issue than ETM. Based on this comparison, the best choice is to depend on the inductive miner algorithm as discovery process model in this case study. Also, it’s noticeable through execution that ETM miner has consumed more time than other miner algorithms, this has been proved in [40], and therefore the ETM miner was excluded from using in this paper.

**3.3.2 The results of the analysis phase.** This paper elaborates on the analysis tasks to provide insights into the processes in the hospital. Performance analysis techniques are conducted by statistical analysis or by using Prom tool such as dotted chart, conformance checking, and inductive visual miner. The dotted chart method for case handling processes, conformance checking to check deviations and bottlenecks. Also, organizational analysis conducted by

**Table 6. Quantify the complexity of the model from the inductive and ETM discovery miners.**

| Model based on | Cardoso | Cyclomatic | Structuredness |
|---|---:|---:|---:|
| Inductive miner | 21 | 37 | 218 |
| ETM miner | 64 | 458 | 46410 |

https://doi.org/10.1371/journal.pone.0281836.t006

**Table 7. Comparison among the four applied algorithms.**

| Miner | Fitness | Precision | Generalization | Complexity |
|---|---:|---:|---:|---|
| Inductive miner | 0.99 | 0.54 | 0.99 | Simple |
| Heuristic miner | 0.75 | 0.60 | 0.99 | Complex |
| ILP miner | 0.66 | 0.41 | 0.97 | Complex |
| ETM miner | 0.87 | 0.83 | 0.99 | Low Simple |

https://doi.org/10.1371/journal.pone.0281836.t007

<!-- Page 23 -->

social network mining method to provide insights into the collaboration between originators or departments in the hospital.

**1- The results of the performance analysis.** The performance analysis stage has a special importance during applying the process mining process in the hospital; it is implemented when the ‘model discovery’ and ‘evaluating the quality metrics of the generated models’ are finished to use their outputs. Where performance analysis is important to know the time that the patient consumes since entering the hospital, the consumed time for each activity, as well as the resources used with each activity, what activities consume a lot of time with the patient, as well as the long waiting times of the patient while performing a particular operation. Also, it is necessary to detect the existent deviation in the discovered careflow model from what was planned through handmade, as well as discovering the occurrence of bottlenecks in implementing certain operations. Performance analysis can be implemented by ProM platform provides process mining with many performance analysis techniques or by statistics analysis.

**Statistical analysis;** using statistical analysis merged with process mining in order to analysis the length of patient journey into the hospital and if any correlation between the diagnosis of the patient and the length of its journey or the length of hospitalization spent time. Table 8 shows the Length of the patient journey (in days) into the hospital according to the patient type (preferred from doctor, or from Emergency). Table 8, shows that patients from emergency have shorter length path than from doctor. The average of stay of patient from doctor was ≈13 day, but the stay of the patients from Emergency was ≈7 days.

Table 9 shows the Length of the patient journey (in days) into the hospital according to the patient diagnosis (open heart, Cardiac Stent and Diagnostic Catheterization, medication, and “discharged without surgery”). Table 9, shows that patients of “open heart” have the longest length path than other diagnostics. The average of stay of patient of “open heart” was ≈23 day, other diagnostics patients have a length stay ≈7 and 8 days. That’s because the activities included in the variants of “open heart surgery” has a long time to complete, but activities includes in others diagnostic have a shorter time.

ProM platform provides process mining with many performance analysis techniques such as conformance checking, dotted chart, and inductive visual miner plugins.

**Table 8. The length of the patient journey (in days) into hospital according to the patient refer from type.**

| Metric | from doctor | from Emergency |
|---|---:|---:|
| Average | 12.86 | 6.87 |
| Minimum | 1.35 | 0.04 |
| Interquartile Range | 6.19 -17.81 | 3.05 -9.59 |
| Median | 11.30 | 5.88 |
| Maximum | 41.31 | 71.25 |

https://doi.org/10.1371/journal.pone.0281836.t008

**Table 9. Length of the patient journey (in days) into hospital according to the patient diagnostics.**

| Metric | open heart surgery | Cardiac Stent and Diagnostic Catheterization | Only medication | Cdischarged without surgery |
|---|---:|---:|---:|---:|
| Minimum | 4.2 | 1.9 | 1.0 | 6.6 |
| Interquartile Range | 19.5-27.3 | 3.1-10.6 | 5.3-12.2 | 11.9-14.1 |
| Median | 22.5 | 6.6 | 8.3 | 12.6 |
| Maximum | 41.3 | 55.7 | 19.5 | 71.3 |
| Average | 23.1 | 7.1 | 8.6 | 13.7 |

https://doi.org/10.1371/journal.pone.0281836.t009

<!-- Page 24 -->

![Process-mining Petri net replay diagram spanning the page width. A long horizontal workflow graph is shown on a white background. It begins at a small white start circle, then passes through a green rectangular activity box, several yellow circular places, and black/pink transition nodes. The model branches into multiple parallel and nested paths in the center-left, with several green and light-green activity boxes and yellow circles connected by curved black arcs. In the middle, two looped substructures appear, one above the other, each with activity boxes inside rounded flow paths. The paths rejoin into a central line, continue through a sequence of small rectangular activity boxes on the right, then enter a large outer loop that curves above and below the line before ending at a green activity box and a small white end circle. Colors visible include green and cyan activity boxes, yellow places, black curved arcs, white connector circles, and black/pink transition markers. No readable node labels are legible at this resolution.](figure)

**Fig 18. Replaying the Event Log and the Petri Net of the base Model “Standard model” for Conformance Analysis and Bottleneck analysis.**

https://doi.org/10.1371/journal.pone.0281836.g018

![Two side-by-side software screenshots from a process-mining “Inspector” interface. Left screenshot: panel title “Inspector” at top left with tabs “Info”, “Display”, “Filter”, and “Export”. A dark left menu lists “Legend”, “View”, “Elements Statistics”, and “Global Statistics (non-filtered traces)”. Main table has columns “Property” and “Value”. Readable rows include: “Calculation Time (ms)” = “3.821219562955255”; “Num. States” = “314.75234131113416”; highlighted row “Trace Fitness” = “0.9568753377762151”; “Title of Visualization” begins “Alignments of xes906 on e5…”; “Exit code of alignment for tra…” = “1.0”; “Model move cost empty trace” = “4.0”; “Number of LPs solved” = “1.8428720083246621”; “Queued States” = “353.54006243496355”; “Raw Fitness Cost” = “0.6045785639958376”. Right screenshot: top dropdown area labeled “Selected elements” with selected item “Recuperation Ward”. Below is a table with columns “Property” and “Value”. Readable rows: “#Move log+model (total)” = “914”; “#Move log+model (in 100% fitting traces)” = “688”; “#Traces where move log+model occur” = “839”; “#Move model only (in all traces)” = “122”; “#Traces where move model only occur” = “122”. Background shows faint process-model nodes and arrows. Bottom instruction text reads: “* Click a place/transition on the projected model to see its stats, or use combobox”. A collapsed section label at bottom reads “Global Statistics (non-filtered traces)”.](figure)

**Fig 19. The resulting Statistical information obtained from replaying the event log with the Petri Net of the base model “Standard model” for conformance checking process.**

https://doi.org/10.1371/journal.pone.0281836.g019

**Conformance checking;** Fig 18 presents the conformance checking analysis by replaying result from mapping extracted event log from information system (after cleaning and pre-processing it) on petri net of the base model “standard model”, the base model was hand-made by hospital’s domain experts (petri net of the base model was converted from BPMN model of Fig 4. The global statistics of replaying results in Fig 19 shows there are compliance between the base model (hand-made model) and the event logs from the information system with percentage 95%. It means that the extracted event log has a deviation from the model with about 5%. By example in Fig 19 (b), the activity “Recuperation Ward” has a red green bar to indicate 123 times not observed in the traces and 838 times it was executed correctly. According to global statistics in Fig 19 (a), some services in the hospital needs to be improved.

**Inductive visual miner;** for more analysis and inspection, the paper intends to detect the deviations in the model by using the inductive visual miner [41] as it is shown in Figs 20–22. The resulted model from the visual inductive miner starts with green circle and walks over the arrows to the end red circle, whereas each box represent an activity, the numbers that shown under the activity name are the frequencies with which it were executed according to the model. In Fig 20, the red-dashed edges indicate that these paths include deviations

<!-- Page 25 -->

PLOS ONE

Patient’s care journey using process mining

![Three horizontal process-mining diagrams stacked vertically across the page, each showing a left-to-right patient-care workflow with colored rounded rectangles connected by curved arrows and annotated with small numeric labels. Top diagram uses mostly blue nodes, middle diagram pink/red nodes, bottom diagram red nodes. Each starts at a small green start marker on the far left and ends at a red end marker on the far right. The diagrams include many branching and looping arcs over and under the main path, with activity boxes distributed along a thin horizontal baseline. The node labels are too small to read reliably at this resolution, but the visual structure shows repeated hospital-service process paths, deviations, service distribution, and resource sojourn-time bottlenecks.](figure)

**Fig 20. The process model explains the deviations.**

https://doi.org/10.1371/journal.pone.0281836.g020

![Second process-mining diagram spanning the page width, again left-to-right with pink/red activity boxes and pale blue connecting arcs. A green start dot appears at the far left, followed by several activity nodes, a dense cluster of branches and loops in the left-middle region, then a long linear section with occasional branches, and a red end dot at the far right. Small frequency or count labels appear above many arcs and nodes, but they are not legible at this image scale. This figure visually emphasizes patient distribution among hospital services through alternative paths and counts.](figure)

**Fig 21. Patients’ distribution among hospital services.**

https://doi.org/10.1371/journal.pone.0281836.g021

![Third process-mining diagram across the page, similar layout to the previous two but with stronger red highlighting on several activity boxes, suggesting bottlenecks or sojourn-time emphasis. It begins with a green start marker on the left and ends with a red end marker on the right. The left-middle section contains several loops and parallel branches; the center and right sections contain a mostly linear path with occasional diverging lower arcs and a few red-highlighted nodes. Tiny labels are present above edges and inside or near nodes, but not readable in this scan.](figure)

**Fig 22. The process model explains sojourn time of the resources.**

https://doi.org/10.1371/journal.pone.0281836.g022

or bottlenecks during the execution; there are many activities such as “1st Consultant Check-up”, “Laboratory Tests”, “Admission Request”,“Prepare patient for Surgery”,”Blood bank”, and “Recuperation Ward” in the model that has been skipped with a number of times, while they should be executed in the model. [Fig 21](#) outlines the patients involved in hospital services during the observed period, a total of 961 patients started the services by the activity of “Admission to Hospital” and “1st Consultant Checkup”. A number of 645 patients passed through the “Laboratory Tests” and 642 for the “Radiology Tests”, 266 patients passed through “consultant checkup” service without passing through the lab or radiology department, and 903 patient passed directly through “Diagnostic Catheterization” and only 305 “Cardiac Stent” surgical services. Then a group of 159 patient wanted to use the services of performing the open heart surgery and then passed to the service of “recuperation ward”. While a group of 914 patient used the “recuperation ward” because they did the surgeries of “Open Heart” and “Cardiac Stent”. And at the end all the 961 patient passed through the service of “discharged and leave” to finish the sojourn in the hospital. [Fig 22](#), shows the bottlenecks on the services where there are unbalanced allocation of resources; some resources were overallocated while others were free. In the [Fig 22](#); it is possible to observe resources with high queue length while other resources were idle in the same instant, it’s clear on the Lab resource and 1st consultant resource.

**Dotted chart;** Also the paper used the “Project chart on Dotted Chart” plugin that’s a dotted chart visualization of the event logs, it’s capable of handling large event logs to show overall events and performance information of the event log. [Fig 23](#) displays the events as dots for the whole event log, the time ranging from January 2021 to May 2021 is measured along the horizontal axis of the chart, the vertical axis represents case IDs and the events are colored according to their activity name. The dotted chart shows that most of the patient’s cases start their activities inside the undertaken hospital with activity “1st Consultant Checkup”, then activities “Laboratory Tests” and “Radiology Tests” together. In [Fig 24](#): the dotted chart for

<!-- Page 26 -->

![Dotted scatter chart labeled as the whole event log. The plot area has x-axis label "Event: time:timestamp" with date ticks from left to right: 21-Jan, 28-Jan, 4-Feb, 11-Feb, 18-Feb, 25-Feb, 4-Mar, 11-Mar, 18-Mar, 25-Mar, 1-Apr, 8-Apr, 15-Apr, 22-Apr, 29-Apr, 6-May, 13-May, 20-May. The y-axis label is "Trace: concept:name" with case IDs including 11914734, 13885019, 14889412, 16919202, 18902390, 18902484, 19140126, 19192215, 19192277, 19192352, 24259001, 28759001, 32259001, 36759001, 48917284, 64719131, 81079050, and 9659001. Many colored dots form descending diagonal clusters and scattered sequences across the timeline. A legend at upper right lists colored event types: 1st Consultant Checkup, Admission to Hospital, Admission& Request, Blood Bank, Cardiac Stent, Consultant Checkup, Diagnostic Catheterization, Discharge &Leave, ICU, Laboratory Tests, Perform open heart Surgery, Prepare patient for Surgery, Radiology Tests, Recuperation Ward, Scheduling Patient Appointment, Doctor, Emergency. The dots show multiple trajectories, with dense activity in March–April and some sequences extending into May.](figure)

**Fig 23. The dotted chart of whole event log.**

https://doi.org/10.1371/journal.pone.0281836.g023

cluster 1 of “cardiac stent and diagnostic catheterization”. It’s noted that the throughput time for the most instances is short, it reaches less than one day. Also, it’s noted the most instances has a few number of activities, it reaches only three activities without the activities of the “Admission to hospital” and “Leave and Discharge”. In Fig 25; the dotted chart for cluster 2 of “open heart surgery”. It’s noted that the throughput time for the most instances is long, it reaches to more than 30 days. In general of the three dotted charts; it is shown that there are many correlation orders of a specific activity such as “Blood Bank”, “Perform open heart Surgery” and “ICU”, also there is correlation between “Consultant Checkup”, “Laboratory Tests” and “Radiology Tests”. Based on Fig 26 that shows the dotted chart for cluster 3, where the patients leaved the hospital without any surgery but only took medication care. It’s noted a space-time between dot of “scheduling patient appointment” event and dot of next admission “Admission request”.

<!-- Page 27 -->

![Dotted scatter chart from a medical process-mining study. The y-axis is labeled "Trace: concept:name" and lists case IDs including 70719131, 7359001, 74719131, 7659001, 7859001, 79719131, 80719131, 81448893, 8259001, 8359001, 8459001, 8559001, 86719131, 87719131, 88719131, 89719131, 91079050, 91719131, 92719131, 93719131, 9559001, 96719131, 9859001, and 99719131. The x-axis is labeled "Event time:timestamp" with dates from 7-Mar through 24-Mar. Colored circular markers appear in diagonal clusters across dates, mainly magenta and orange with cyan outlines/shadows, indicating events per trace over time. At upper right is a partially visible scrollable legend listing activity names, including truncated entries such as "Consultant Che...", "Diagnostic Cath...", "Discharge & Le...", "Laboratory Test...", "Prepare patient", "Radiology Tests", "Recuperation W...", "Scheduling Pati...", and "all". The plot background is white with a light gray grid.](figure)

**Fig 24. The dotted chart of cluster 1 of “cardiac stent and diagnostic catheterization”.**

https://doi.org/10.1371/journal.pone.0281836.g024

## 2- The results of the organization analysis.

The paper used social network miner that plugged into ProM platform to gain insights about the collaboration between departments, and persons in the hospital. The social network miner allows for the discovery of social networks from process logs. Since there are several social network analysis techniques and research results available, the generated social network allows for analysis of social relations between originators involving process executions. The social network is used to analysis of social relations between originators involving process executions. Fig 27 shows the social network that generated from the event log, it used the “Handover of Work” metric that measures the frequency of transfers of work among departments. In undertaken hospital there are many departments that interact and handover work to each other, there are many-to-many relationship among resources. Fig 27 shows that there are many originators such as laboratory, radiology, and accountant, cardiology consultant, and general practitioner are highly involved in the process and interacts with many departments. But There are other originators are often involved but are not directly connected to all other originators such as ICU nurse, nurse care, and ward nurse. Also, they noted that fewer interactions between the general practitioner 2, accountant2, and receptionist 2 to other originators. This can be explained that those originators work as evening time with no density in patient requests.

<!-- Page 28 -->

![Dotted scatter chart from a process-mining tool. The y-axis is labeled "Trace: concept:name" and lists case/trace IDs including 19192286, 19192280, 19192290, 19192306, 19192317, 19192352, 2019171, 25158919, 28759001, 28359001, 3019171, 31559001, 33259001, 37659001, 42719131, 5459001, 65719131, 71448893, 78719131, 8219171, 9108932, 9759001. The x-axis is labeled "Event: time:timeSinceCaseStart" with ticks around 2d22h0m0.000s, 9d22h0m0.000s, 16d22h0m0.000s, 23d22h0m0.000s, 30d22h0m0.000s, and 37d22h0m0.000s. Hundreds of small colored dots—cyan, blue, purple, green, yellow, orange, red, and pink—form horizontal event sequences per trace, heavily concentrated near time zero and extending to about 37 days. At upper right is an overlay panel titled "Inspector" with a tab "Info" and a section "Legend" beside a grayscale gradient bar.](figure)

**Fig 25.** The dotted chart of cluster 2 of “open heart surgery”.

https://doi.org/10.1371/journal.pone.0281836.g025

# 4. Conclusions

The paper suggested applying the process mining approach in analyzing the patient’s journey as s/he registered to the hospital to the end and leaving the hospital. The paper have used a dataset from Egyptian hospital based on the event logs of the cardiac patients. The proposed methodology has employed four discovery algorithms to mine a structured process model from unstructured careflows. But before performing this step; the paper suggested applying the abstraction and trace clustering techniques to simplify the unstructured form of the model. Then, an evaluation of the quality metrics among the output models from the discovery miners was conducted to select the best process model that describe careflows of all groups of patients, the evaluation was based on fitness, precision, generalization, and simplicity metrics. To evaluate the simplicity metric of extracted models; the paper suggested a method to quantify the simplicity metric and decide if the process model is simple or not. The method with two steps: checking the soundness of every model resulted from the miner algorithms, then secondly; measuring the metrics of control-flow complexity: Cardoso, cyclomatic, and structuredness. The highest quality process model is selected to compare it with the process model that hand-made by experts to detect the deviations. The matching rate between the discovered process model and the standard one

<!-- Page 29 -->

![Dotted scatter chart showing patient event traces over time for cluster 3. X-axis label: "Event time:timestamp" with dates from left to right: 12-Apr, 14-Apr, 16-Apr, 18-Apr, 20-Apr, 22-Apr, 24-Apr, 26-Apr, 28-Apr, 30-Apr, 2-May, 4-May, 6-May, 8-May, 10-May. Y-axis label: "Trace: concept:name" with case IDs including 13891228, 13904202, 13904207, 13917812, 14891712, 29184112, 2918482, 38894213, 48917254, 48917304, 58992335, 58992405. Colored dots mark event occurrences; clusters of points appear around 14-Apr, 16–18 Apr, 21–24 Apr, 26–30 Apr, 2–10 May. Two arrow annotations point to late-April dots labeled "Scheduling patient appointment" and "Discharge". A legend panel on the right titled "Legend" lists color-coded events: 1st Consultant Checkup, Admission to Hospital, Admission&Request, Blood Bank, Consultant Checkup, Diagnostic Catheterization, Discharge &Leave, Laboratory Tests, Prepare patient for Surgery, Radiology Tests, Scheduling Patient Appointment, and all.](figure)

**Fig 26.** The dotted chart of cluster 3 of “the patients leaved the hospital without any surgery but only took medication care”.

https://doi.org/10.1371/journal.pone.0281836.g026

was a 95%. The paper derived the insights from the careflows and the event log by utilizing organizational and performance analysis. The paper used ProM plugins to apply process mining techniques while extracting and cleaning the event logs, discovering the process models, applying the conformance checking, applying performance or organizational analysis. As results of the paper, the process mining approach was used to extract the careflows of large groups of patients with large variants from start step “registration” in hospital to the end step “leave”, Accordingly, various analyzes were applied to get useful insights to hospital management that can used to improve their healthcare processes. The major impediment of this methodology is it was employed only for current case study, and it was not tested for another cases with other variables. In the future, it may be a serious to extend the implementation of the methodology in another hospital or multiple hospitals to address the problem of drifting. Future work will focus on how to enhance the performance of the business process by improving a prediction models and recommendations systems that based on a merge of process mining and machine learning methods, there are many methods of deep learning that can be useful for predicting and classification the parameters such as remembered in [42, 43]. The

<!-- Page 30 -->

![Directed social network diagram on a light gray background showing hospital originators and handover-of-work relationships. Colored oval nodes with black spiky halos are connected by many thin gray arrows in multiple directions. Readable node labels include: ICU nursing 2, ICU nursing 1, ward nurse 2, General practitioner2, Laboratory specialist2, Radiology specialist1, Catheter and stent surgery team2, Blood bank, cardiology consultant1, cardiology consultant2, Laboratory specialist 1, Radiology specialist2, Catheter and stent surgery team1, General practitioner1, ward nurse 1, Administration official 1, Administration official 2, Receptionist 1, Receptionist2, Receptionist3, nurse care 1, nurse care 2, and Open heart surgery team. Nodes are distributed across the canvas with ward nurse 2 near top center, Laboratory specialist 1 at right, Open heart surgery team at left, and Administration official 2 near bottom center. The figure emphasizes a dense web of interactions rather than numeric scales or legend.](figure)

**Fig 27. Social network of the hospital originators with the handover of work metric.**

https://doi.org/10.1371/journal.pone.0281836.g027

recommendation system will be useful to deal with inefficient activities such as; large waiting time, high cost, deviations from the standard model, and bottlenecks.

# Author Contributions

**Conceptualization:** Abdel-Hamed Mohamed Rashed, Diaa Salama Abdelminaaam, Mohamed Abdelfatah.

**Data curation:** Abdel-Hamed Mohamed Rashed, Noha E. El-Attar.

**Formal analysis:** Noha E. El-Attar, Diaa Salama Abdelminaaam.

**Methodology:** Abdel-Hamed Mohamed Rashed, Diaa Salama Abdelminaaam.

**Resources:** Abdel-Hamed Mohamed Rashed, Mohamed Abdelfatah.

**Software:** Abdel-Hamed Mohamed Rashed, Diaa Salama Abdelminaaam.

**Supervision:** Mohamed Abdelfatah.

**Validation:** Diaa Salama Abdelminaaam, Mohamed Abdelfatah.

**Visualization:** Noha E. El-Attar.

**Writing – original draft:** Abdel-Hamed Mohamed Rashed, Noha E. El-Attar.

**Writing – review & editing:** Diaa Salama Abdelminaaam, Mohamed Abdelfatah.

<!-- Page 31 -->

# References

1. Van Der AW, Adriansyah A, Medeiros, AKAD, Arcieri F, Baier T, Blickle T et al. Process mining manifesto. In: International conference on business process management. Berlin (Heidelberg): Springer. 2011.

2. Rebuge Á, Ferreira DR. Business process analysis in healthcare environments: A methodology based on process mining. Inf. Syst. Elsevier. 2012; 37(2): 99–116. https://doi.org/10.1016/j.is.2011.01.003

3. Kirchme M, Laengle S, Masias V. Transparency-driven business process management in healthcare settings. IEEE Technology and Society Magazine. 2013; 4(32):14–16. https://doi.org/10.1109/MTS.2013.2286427

4. Amor EE, Ghannouchi SA. Applying Data Mining Techniques to Discover KPIs Relationships in Business Process Context. In: 2017 18th International Conference on Parallel and Distributed Computing, Applications and Technologies (PDCAT);2017: 230-237.

5. Van Der AW. Process Mining Data Science in Action. Verlag Berlin (Heidelberg): Springer, 2016.

6. Van Der AW, Reijers HA, Weijters AJ, van Dongen BF, De Medeiros AA, Song M, et al. Business process mining: an industrial application, Information Systems.2007; 32 (5):713–732. https://doi.org/10.1016/j.is.2006.05.003

7. Van der AW. Process Mining: Discovery. Conformance and Enhancement of Business Processes. Verlag, Berlin: Springer, 2011.

8. Agostinelli S,Covino F, D’Agnese G, De Crea C, Leotta F,Marrella A. Supporting Governance in Healthcare Through Process Mining: A Case Study. IEEE Access. 2020; 8:186012–186025. https://doi.org/10.1109/ACCESS.2020.3030318

9. Van der WA, Van BD, Gunther C, Rozinat A, Verbeek H, Weijters A. ProM: the process mining toolkit. In: Alves de Medeiros A, Weber B, editors. Proceedings of the BPM 2009 Demonstration Track. Ulm, Germany: CEUR-WS.org; 2009, p.1–4.

10. AlQaher H, Panda M. An Education Process Mining Framework: Unveiling Meaningful Information for Understanding Students’ Learning Behavior and Improving Teaching Quality. Information. 2022; 13 (1):29. https://doi.org/10.3390/info13010029

11. Moreira C, Haven E, Sozzo S, W Andreas. Process mining with real world financial loan applications: Improving inference on incomplete event logs. PLoS One. 2018; 13(12):e0207806. https://doi.org/10.1371/journal.pone.0207806 PMID: 30596655

12. Wu Q, He Z, Wang H, Wen L, Yu T. A business process analysis methodology based on process mining for complaint handling service processes. Applied Sciences.2019; 9(16): 3313. https://doi.org/10.3390/app9163313

13. Asare E, Wang L, Fang X. Conformance checking: Workflow of hospitals and workflow of open-source EMRs. IEEE Access, 2020; 8:139546–139566. https://doi.org/10.1109/ACCESS.2020.3012147

14. Elhadjamor EA, Ghannouchi SA. Analyze in depth health care business process and key performance indicators using process mining. Procedia Computer Science, 2019; 164: 610–617. https://doi.org/10.1016/j.procs.2019.12.227

15. Cho M, Song M, Comuzzi M, Yoo S. Evaluating the effect of best practices for business process redesign: An evidence-based approach based on process mining techniques. Decision Support Systems.2017; 104:92–103. https://doi.org/10.1016/j.dss.2017.10.004

16. Stefanini A, Aloini D, Benevento E, Dulmin R, Mininno V. A process mining methodology for modeling unstructured processes. Knowledge and Process Management. 2020; 27(4): 294–310. https://doi.org/10.1002/kpm.1649

17. Baek H,Cho M,Kim S,Hwang H,Song M,Yoo S. Analysis of length of hospital stay using electronic health records: A statistical and data mining approach. PloS one.2008; 13(4): e0195901. https://doi.org/10.1371/journal.pone.0195901

18. Perimal-Lewis L, De Vries D, Thompson CH. Health intelligence: Discovering the process model using process mining by constructing Start-to-End patient journeys. In Proceedings of the Seventh Australasian Workshop on Health Informatics and Knowledge Management.2014; 153: 59–67.

19. Rismanchian F, Lee YH. Process mining–based method of designing and optimizing the layouts of emergency departments in hospitals. HERD: Health Environments Research Design Journal. 2017; 10 (4): 105–120. https://doi.org/10.1177/1937586716674471 PMID: 28643568

20. Cho M, Song M, Park J, Yeom SR, Wang JJ, Choi BK. Process Mining-Supported Emergency Room Process Performance Indicators. Int. J. Environ. Res. Public Health. 2020; 17:6290. https://doi.org/10.3390/ijerph17176290 PMID: 32872350

21. Partington A, Wynn M, Suriadi S, Ouyang C,Karnon J. Process mining for clinical processes: a comparative analysis of four Australian hospitals. ACM Transactions on Management Information Systems (TMIS). 2015; 5(4): 1–18. https://doi.org/10.1145/2629446

<!-- Page 32 -->

22. Pang J, Xu H, Ren J, Yang J, Li M, Lu D, et al. Process mining framework with time perspective for understanding acute care: a case study of AIS in hospitals. BMC Medical Informatics and Decision Making. 2021; 21(1): 1–10. https://doi.org/10.1145/2629446

23. Hu L, Pan X, Tang Z, Luo X. A fast fuzzy clustering algorithm for complex networks via a generalized momentum method. IEEE Transactions on Fuzzy Systems. 2021; 30(9): 3473–3485. https://doi.org/10.1109/TFUZZ.2021.3117442

24. Song M, Günther CW, Van der AW. Trace clustering in process mining. In: International conference on business process management. Springer, Berlin, Heidelberg. 2008: 109-120.

25. De Weerdt J, Vanden Broucke S, Vanthienen J, Baesens B. Active trace clustering for improved process discovery. IEEE Transactions on Knowledge and Data Engineering. 2013; 25(12): 2708–2720. https://doi.org/10.1109/TKDE.2013.64

26. Veiga GM. Developing Process Mining Tools. An Implementation of Sequence Clustering for ProM. [Master’s Thesis]. [Porto Salvo, Portugal]: IST—Technical University of Lisbon;2009,81p.

27. Van der AW, Weijters T, Maruster L. Workflow mining: Discovering process models from event logs. IEEE transactions on knowledge and data engineering. 2004; 16(9):1128–1142. https://doi.org/10.1109/TKDE.2004.47

28. Weijters AM, Van Der AW, De Medeiros AA. Process mining with the heuristics miner-algorithm. Technische Universiteit Eindhoven, Tech. Rep. WP. 2006; 2017(166):1–34.

29. Leemans SJ, Fahland D, Van Der AW. Discovering block-structured process models from event logs-a constructive approach. In: International conference on applications and theory of Petri nets and concurrency. Springer, Berlin, Heidelberg.2013: 311-329.

30. Rozinat A, Van der AW. Conformance Checking of Processes Based on Monitoring Real Behavior. Information Systems. Elsevier. 2008; 33 (1):64–95. https://doi.org/10.1142/S0218843014400012

31. Buijs JC, van Dongen B, Van der AW. Quality dimensions in process discovery: The importance of fitness, precision, generalization and simplicity. International Journal of Cooperative Information Systems. 2014; 23(01):1440001. https://doi.org/10.1142/S0218843014400012

32. Hompes B, Buijs J, Van der AW, Dixit P, Buurman J. Discovering deviating cases and process variants using trace clustering. In: Proceedings of the 27th Benelux Conference on Artificial Intelligence (BNAIC), November 2015; 5(6).

33. Van Zelst SJ, Van Dongen BF, Van der AW. ILP-Based Process Discovery Using Hybrid Regions. International Workshop on Algorithms Theories for the Analysis of Event Data, ATAED. CEUR Workshop Proceedings; 2015:47–61.

34. Van der AW, Medeiros A, Weijters AJ. Genetic process mining. In: International conference on application and theory of petri nets. Springer, Berlin, Heidelberg.2005: 48-69.

35. Adriansyah A. Aligning Observed and Modeled Behavior. [Phd thesis], [Eindhoven]: Eindhoven University of Technology;2014,252p.

36. Adriansyah A, Van Dongen BF, Van der AW. Conformance checking using cost-based fitness analysis. In: 2011 ieee 15th international enterprise distributed object computing conference; 2011, August. pp. 55-64.

37. Adriansyah A, Munoz-Gama J, Carmona J, Van Dongen BF, Van Der AW. Measuring Precision of Modeled Behavior. Information Systems and e-Business Management; 2015: 13(1):37–67. https://doi.org/10.1007/s10257-014-0234-7

38. Mendling J, Neumann G, Van der AW. Understanding the occurrence of errors in process models based on metrics. In: OTM Confederated International Conferences” On the Move to Meaningful Internet Systems”. Berlin, Heidelberg, Springer.2007: 113–130.

39. Lassen KB, Van der AW. Complexity metrics for Workflow nets. Information and Software Technology, Elsevier. 2009: 51(3):610–626. https://doi.org/10.1016/j.infsof.2008.08.005

40. JCAM B. Flexible evolutionary algorithms for mining structured process models, Technische Universiteit, Eindhoven:2004; 57.

41. Leemans S, Fahland D, Van der AW. Process and deviation exploration with inductive visual miner. BPM (Demos), 2014; 1295(8):p.46.

42. Alqudah AM, Al-Hashem M, Alqudah A. Reduced Number of Parameters for Predicting Post-Stroke Activities of Daily Living Using Machine Learning Algorithms on Initiating Rehabilitation. Informatica. 2021; 45(4). https://doi.org/10.31449/inf.v45i4.3570

43. Al-Hashem M, Alqudah AM, Qananwah Q. Performance Evaluation of Different Machine Learning Classification Algorithms for Disease Diagnosis. International Journal of E-Health and Medical Communications (IJEHMC). 2021; 12(6):1–28.