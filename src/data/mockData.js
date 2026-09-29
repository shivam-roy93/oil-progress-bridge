// ============================================================
// PROGRESS BRIDGE - CENTRALIZED MOCK DATA
// ============================================================

// ------------------------------------------------------------
// PROJECTS
// ------------------------------------------------------------

export const projects = [
  {
    id: "project-001",
    name: "Refinery Expansion Project",
    packageName: "Refinery Expansion – Package 2",
    site: "Package-2 / Area-A",
    discipline: "Piping",
    location: "Area-A",
  },
];

// ------------------------------------------------------------
// USERS
// ------------------------------------------------------------

export const users = [
  {
    id: "user-001",
    name: "Ramesh Kumar",
    email: "supervisor@progressbridge.com",
    password: "123456",
    role: "Site Supervisor",
    roleKey: "site-supervisor",
    projectId: "project-001",
    discipline: "Piping",
  },
  {
    id: "user-002",
    name: "Priya Sharma",
    email: "pm@progressbridge.com",
    password: "pm123",
    role: "Project Manager",
    roleKey: "project-manager",
    projectId: "project-001",
    discipline: "Project Management",
  },
  {
    id: "user-003",
    name: "Arjun Mehta",
    email: "planning@progressbridge.com",
    password: "planning123",
    role: "Planning Engineer",
    roleKey: "planning-engineer",
    projectId: "project-001",
    discipline: "Planning",
  },
];

// ------------------------------------------------------------
// SCHEDULE ACTIVITIES
// ------------------------------------------------------------

export const activities = [
  {
    id: "A101",
    activityId: "L6-CIV-021",
    name: "Foundation Work",
    discipline: "Civil",
    wbs: "Civil > Foundation",
    plannedStart: "2026-09-10",
    plannedFinish: "2026-09-25",
    plannedProgress: 80,
    actualProgress: 65,
    variance: -15,
    daysBehind: 5,
    status: "Delayed",
    severity: "Critical",
    location: "Km 12+000 - Km 12+500",
    updatedBy: "Site Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 3,
    latestUpdate:
      "RCC foundation completed up to column area.",
  },

  {
    id: "A102",
    activityId: "L6-CIV-022",
    name: "Earthwork Excavation",
    discipline: "Civil",
    wbs: "Civil > Earthwork",
    plannedStart: "2026-09-18",
    plannedFinish: "2026-09-30",
    plannedProgress: 70,
    actualProgress: 62,
    variance: -8,
    daysBehind: 3,
    status: "Delayed",
    severity: "High",
    location: "Km 12+000 - Km 12+500",
    updatedBy: "Ramesh Kumar",
    updatedOn: "2026-09-26",
    evidenceCount: 2,
    latestUpdate:
      "Excavation progressing near Area-A.",
  },

  {
    id: "A103",
    activityId: "L6-CIV-023",
    name: "Drainage Work",
    discipline: "Civil",
    wbs: "Civil > Drainage",
    plannedStart: "2026-09-15",
    plannedFinish: "2026-09-28",
    plannedProgress: 75,
    actualProgress: 74,
    variance: -1,
    daysBehind: 0,
    status: "Warning",
    severity: "Medium",
    location: "Area-A North Zone",
    updatedBy: "Site Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 2,
    latestUpdate:
      "Drainage channel installation progressing normally.",
  },

  {
    id: "A104",
    activityId: "L6-PIP-024",
    name: "Erect Line 24-XX",
    discipline: "Piping",
    wbs: "Piping > Line Installation",
    plannedStart: "2026-09-20",
    plannedFinish: "2026-09-30",
    plannedProgress: 50,
    actualProgress: 42,
    variance: -8,
    daysBehind: 3,
    status: "Delayed",
    severity: "High",
    location: "Km 12+500",
    updatedBy: "Ramesh Kumar",
    updatedOn: "2026-09-26",
    evidenceCount: 3,
    latestUpdate:
      "Spool erection progressing at designated location.",
  },

  {
    id: "A105",
    activityId: "L6-PIP-025",
    name: "Pipe Installation",
    discipline: "Piping",
    wbs: "Piping > Pipe Installation",
    plannedStart: "2026-09-18",
    plannedFinish: "2026-10-02",
    plannedProgress: 50,
    actualProgress: 42,
    variance: -8,
    daysBehind: 3,
    status: "Delayed",
    severity: "High",
    location: "Area-A Process Unit",
    updatedBy: "Site Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 2,
    latestUpdate:
      "Pipe installation affected by material availability.",
  },

  {
    id: "A106",
    activityId: "L6-PIP-026",
    name: "Spool Erection",
    discipline: "Piping",
    wbs: "Piping > Spool Erection",
    plannedStart: "2026-09-22",
    plannedFinish: "2026-10-05",
    plannedProgress: 35,
    actualProgress: 35,
    variance: 0,
    daysBehind: 0,
    status: "Healthy",
    severity: "Low",
    location: "Km 12+500",
    updatedBy: "Ramesh Kumar",
    updatedOn: "2026-09-26",
    evidenceCount: 3,
    latestUpdate:
      "Spool erection proceeding as planned.",
  },

  {
    id: "A107",
    activityId: "L6-ELE-031",
    name: "Cable Installation",
    discipline: "Electrical",
    wbs: "Electrical > Cables",
    plannedStart: "2026-09-16",
    plannedFinish: "2026-10-01",
    plannedProgress: 40,
    actualProgress: 35,
    variance: -5,
    daysBehind: 2,
    status: "Warning",
    severity: "Medium",
    location: "Electrical Substation",
    updatedBy: "Electrical Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 1,
    latestUpdate:
      "Cable installation progressing with minor delay.",
  },

  {
    id: "A108",
    activityId: "L6-ELE-032",
    name: "Cable Tray Installation",
    discipline: "Electrical",
    wbs: "Electrical > Cable Tray",
    plannedStart: "2026-09-12",
    plannedFinish: "2026-09-27",
    plannedProgress: 80,
    actualProgress: 78,
    variance: -2,
    daysBehind: 1,
    status: "Warning",
    severity: "Medium",
    location: "Utility Area",
    updatedBy: "Electrical Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 2,
    latestUpdate:
      "Cable tray installation nearing completion.",
  },

  {
    id: "A109",
    activityId: "L6-INS-041",
    name: "Instrument Installation",
    discipline: "Instrumentation",
    wbs: "Instrumentation > Instruments",
    plannedStart: "2026-09-10",
    plannedFinish: "2026-10-05",
    plannedProgress: 65,
    actualProgress: 61,
    variance: -4,
    daysBehind: 1,
    status: "Warning",
    severity: "Medium",
    location: "Process Unit",
    updatedBy: "Instrumentation Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 2,
    latestUpdate:
      "Instrument installation progressing across process area.",
  },

  {
    id: "A110",
    activityId: "L6-INS-042",
    name: "Junction Box Installation",
    discipline: "Instrumentation",
    wbs: "Instrumentation > Junction Boxes",
    plannedStart: "2026-09-20",
    plannedFinish: "2026-10-04",
    plannedProgress: 45,
    actualProgress: 44,
    variance: -1,
    daysBehind: 0,
    status: "Warning",
    severity: "Medium",
    location: "Area-A",
    updatedBy: "Instrumentation Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 1,
    latestUpdate:
      "Junction box installation nearly on schedule.",
  },

  {
    id: "A111",
    activityId: "L6-MEC-051",
    name: "Equipment Installation",
    discipline: "Mechanical",
    wbs: "Mechanical > Equipment",
    plannedStart: "2026-09-12",
    plannedFinish: "2026-09-30",
    plannedProgress: 70,
    actualProgress: 64,
    variance: -6,
    daysBehind: 2,
    status: "Delayed",
    severity: "High",
    location: "Equipment Yard",
    updatedBy: "Mechanical Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 2,
    latestUpdate:
      "Equipment installation delayed due to alignment work.",
  },

  {
    id: "A112",
    activityId: "L6-MEC-052",
    name: "Pump Installation",
    discipline: "Mechanical",
    wbs: "Mechanical > Pumps",
    plannedStart: "2026-09-19",
    plannedFinish: "2026-10-03",
    plannedProgress: 55,
    actualProgress: 55,
    variance: 0,
    daysBehind: 0,
    status: "Healthy",
    severity: "Low",
    location: "Pump House",
    updatedBy: "Mechanical Engineer",
    updatedOn: "2026-09-26",
    evidenceCount: 2,
    latestUpdate:
      "Pump installation progressing according to schedule.",
  },
];

// ------------------------------------------------------------
// PROGRESS TREND
// ------------------------------------------------------------

export const progressTrend = [
  {
    week: "Week 1",
    planned: 15,
    actual: 14,
  },
  {
    week: "Week 2",
    planned: 28,
    actual: 26,
  },
  {
    week: "Week 3",
    planned: 42,
    actual: 38,
  },
  {
    week: "Week 4",
    planned: 55,
    actual: 50,
  },
  {
    week: "Week 5",
    planned: 65,
    actual: 60,
  },
  {
    week: "Week 6",
    planned: 72,
    actual: 67,
  },
];

// ------------------------------------------------------------
// DISCIPLINE-WISE PROGRESS
// ------------------------------------------------------------

export const disciplineProgress = [
  {
    discipline: "Civil",
    planned: 86,
    actual: 82,
  },
  {
    discipline: "Piping",
    planned: 76,
    actual: 71,
  },
  {
    discipline: "Electrical",
    planned: 78,
    actual: 73,
  },
  {
    discipline: "Instrumentation",
    planned: 65,
    actual: 61,
  },
  {
    discipline: "Mechanical",
    planned: 70,
    actual: 64,
  },
];

// ------------------------------------------------------------
// DELAYED ACTIVITIES
// ------------------------------------------------------------

export const delays = activities
  .filter((activity) => activity.variance < 0)
  .map((activity) => ({
    id: activity.id,
    activityId: activity.activityId,
    activity: activity.name,
    planned: activity.plannedProgress,
    actual: activity.actualProgress,
    variance: activity.variance,
    daysBehind: activity.daysBehind,
    severity: activity.severity,
    status: activity.status,
  }));

// ------------------------------------------------------------
// FIELD UPDATES
// ------------------------------------------------------------

export const fieldUpdates = [
  {
    id: "FU001",
    activityId: "A101",
    activityName: "Foundation Work",
    description:
      "RCC foundation completed up to column area.",
    progress: 65,
    evidenceCount: 3,
    updatedBy: "Site Engineer",
    updatedOn: "2026-09-26",
    time: "10:15 AM",
  },

  {
    id: "FU002",
    activityId: "A104",
    activityName: "Erect Line 24-XX",
    description:
      "Spool 24 erection started at Km 12+500.",
    progress: 42,
    evidenceCount: 3,
    updatedBy: "Ramesh Kumar",
    updatedOn: "2026-09-26",
    time: "09:40 AM",
  },

  {
    id: "FU003",
    activityId: "A107",
    activityName: "Cable Installation",
    description:
      "Cable installation progressing in electrical substation.",
    progress: 35,
    evidenceCount: 1,
    updatedBy: "Electrical Engineer",
    updatedOn: "2026-09-26",
    time: "09:20 AM",
  },
];

// ------------------------------------------------------------
// SCHEDULE IMPORT INFORMATION
// ------------------------------------------------------------

export const scheduleImport = {
  projectName: "Refinery Expansion Project",
  source: "Primavera P6",
  fileName: "Project_Schedule.xer",
  lastImported: "25 Sep 2026",
  activities: 4862,
  wbs: 127,
  milestones: 84,
  relationships: 6742,
  status: "Imported",
};

// ------------------------------------------------------------
// PROJECT SUMMARY
// ------------------------------------------------------------

export const projectSummary = {
  overallProgress: 67,
  plannedProgress: 72,
  actualProgress: 67,
  variance: -5,
  delayedActivities: 23,
  criticalActivities: 7,
  scheduleRisk: "Medium",
};

// ------------------------------------------------------------
// SAMPLE SUPERVISOR ACTIVITIES
// ------------------------------------------------------------

export const supervisorActivities = [
  "A101",
  "A102",
  "A103",
  "A104",
  "A105",
  "A106",
  "A107",
  "A108",
];

// ------------------------------------------------------------
// MATCHING DATA
// ------------------------------------------------------------

export const activityMatches = [
  {
    fieldText: "Spool 24 erection",
    suggestedActivityId: "L6-PIP-024",
    suggestedActivityName: "Erect Line 24-XX",
    discipline: "Piping",
    confidence: 92,
    matchStatus: "High Confidence",
  },

  {
    fieldText: "Earthwork excavation",
    suggestedActivityId: "L6-CIV-022",
    suggestedActivityName: "Earthwork Excavation",
    discipline: "Civil",
    confidence: 96,
    matchStatus: "High Confidence",
  },

  {
    fieldText: "Cable installation",
    suggestedActivityId: "L6-ELE-031",
    suggestedActivityName: "Cable Installation",
    discipline: "Electrical",
    confidence: 94,
    matchStatus: "High Confidence",
  },

  {
    fieldText: "Foundation work near Tank 3",
    suggestedActivityId: null,
    suggestedActivityName: null,
    discipline: "Civil",
    confidence: 58,
    matchStatus: "Pending Planner Review",
  },
];

// ------------------------------------------------------------
// DEFAULT PLANNER REVIEWS
// ------------------------------------------------------------

export const plannerReviews = [
  {
    id: "PR001",
    fieldDescription:
      "Foundation work near Tank 3 started.",
    submittedBy: "Ramesh Kumar",
    submittedAt: "2026-09-26T09:25:00",
    suggestedActivityId: null,
    suggestedActivityName: null,
    confidence: 58,
    candidateActivities: [
      {
        activityId: "L6-CIV-021",
        activityName: "Foundation Work",
      },
      {
        activityId: "L6-CIV-023",
        activityName: "Drainage Work",
      },
    ],
    matchStatus: "Pending Planner Review",
    plannerDecision: null,
    reviewedBy: null,
    reviewedAt: null,
  },
];

// ------------------------------------------------------------
// DEFAULT ISSUES
// ------------------------------------------------------------

export const issues = [
  {
    id: "ISS001",
    activityId: "A105",
    issueType: "Material Delay",
    severity: "Medium",
    description:
      "Pipe material delivery is delayed for the current installation area.",
    evidence: [],
    reportedBy: "Ramesh Kumar",
    reportedAt: "2026-09-26T10:00:00",
    status: "Open",
  },
];

// ------------------------------------------------------------
// DEFAULT PROJECT STATE
// ------------------------------------------------------------

export const defaultProjectState = {
  selectedProject: projects[0],
  activities,
  fieldUpdates,
  activityEvents: [],
  plannerReviews,
  scheduleImport,
  lastImported: scheduleImport.lastImported,
  projectProgress: projectSummary,
  issues,
};