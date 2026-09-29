import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

import "./PlanningSchedule.css";

/* =========================================================
   STORAGE KEYS
========================================================= */

const SCHEDULE_STORAGE_KEY =
  "progressBridgeScheduleImport";

const FIELD_EVENTS_STORAGE_KEY =
  "progressBridgeFieldEvents";

/* =========================================================
   FALLBACK SCHEDULE
========================================================= */

const DEFAULT_SCHEDULE = {
  projectName: "Refinery Expansion Project",
  source: "Primavera P6",
  lastImported: "25 Sep 2026",
  activities: 4862,
  wbs: 127,
  milestones: 84,
  relationships: 6742,
};

/* =========================================================
   SCHEDULE ACTIVITIES
========================================================= */

const BASE_ACTIVITIES = [
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
    daysBehind: 5,
    status: "Delayed",
    severity: "Critical",
    location: "Km 12+000 - Km 12+500",
    latestUpdate:
      "RCC foundation completed up to column area.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 3,
  },
  {
    id: "A102",
    activityId: "L6-CIV-022",
    name: "Earthwork Excavation",
    discipline: "Civil",
    wbs: "Civil > Earthwork",
    plannedStart: "2026-09-12",
    plannedFinish: "2026-09-29",
    plannedProgress: 70,
    actualProgress: 62,
    daysBehind: 3,
    status: "Delayed",
    severity: "High",
    location: "Km 12+000 - Km 12+500",
    latestUpdate:
      "Excavation continues across the eastern section.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 2,
  },
  {
    id: "A103",
    activityId: "L6-CIV-023",
    name: "Drainage Work",
    discipline: "Civil",
    wbs: "Civil > Drainage",
    plannedStart: "2026-09-14",
    plannedFinish: "2026-09-30",
    plannedProgress: 75,
    actualProgress: 74,
    daysBehind: 0,
    status: "Warning",
    severity: "Warning",
    location: "Area-A North Zone",
    latestUpdate:
      "Drainage line progressing close to plan.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 2,
  },
  {
    id: "A104",
    activityId: "L6-PIP-024",
    name: "Erect Line 24-XX",
    discipline: "Piping",
    wbs: "Piping > Erection",
    plannedStart: "2026-09-18",
    plannedFinish: "2026-10-01",
    plannedProgress: 45,
    actualProgress: 74,
    daysBehind: 0,
    status: "In Progress",
    severity: "Healthy",
    location: "Unit-02 / Pipe Rack",
    latestUpdate:
      "Spool 24 erection field update received.",
    updatedBy: "Ramesh Kumar",
    updatedOn: "26 Sep 2026",
    evidenceCount: 2,
  },
  {
    id: "A105",
    activityId: "L6-PIP-025",
    name: "Spool Erection",
    discipline: "Piping",
    wbs: "Piping > Fabrication",
    plannedStart: "2026-09-20",
    plannedFinish: "2026-10-04",
    plannedProgress: 50,
    actualProgress: 42,
    daysBehind: 3,
    status: "Delayed",
    severity: "High",
    location: "Pipe Fabrication Yard",
    latestUpdate:
      "Spool preparation is progressing below plan.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 1,
  },
  {
    id: "A106",
    activityId: "L6-ELE-017",
    name: "Cable Laying",
    discipline: "Electrical",
    wbs: "Electrical > Cable",
    plannedStart: "2026-09-21",
    plannedFinish: "2026-10-02",
    plannedProgress: 40,
    actualProgress: 35,
    daysBehind: 2,
    status: "Warning",
    severity: "Warning",
    location: "Substation-A",
    latestUpdate:
      "Cable laying continued in the substation area.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 1,
  },
  {
    id: "A107",
    activityId: "L6-INS-012",
    name: "Instrument Installation",
    discipline: "Instrumentation",
    wbs: "Instrumentation",
    plannedStart: "2026-09-23",
    plannedFinish: "2026-10-04",
    plannedProgress: 38,
    actualProgress: 31,
    daysBehind: 2,
    status: "Delayed",
    severity: "Medium",
    location: "Control Area",
    latestUpdate:
      "Instrument mounting is underway in the control area.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 1,
  },
  {
    id: "A108",
    activityId: "L6-MEC-008",
    name: "Equipment Installation",
    discipline: "Mechanical",
    wbs: "Mechanical > Installation",
    plannedStart: "2026-09-25",
    plannedFinish: "2026-10-03",
    plannedProgress: 70,
    actualProgress: 64,
    daysBehind: 2,
    status: "Warning",
    severity: "Medium",
    location: "Equipment Yard",
    latestUpdate:
      "Equipment installation continues with available resources.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 2,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const value = JSON.parse(raw);

    return value;
  } catch {
    return fallback;
  }
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const getVariance = (planned, actual) => {
  return (
    safeNumber(actual) -
    safeNumber(planned)
  );
};

const getStatus = (planned, actual) => {
  const progress = safeNumber(actual);
  const variance = getVariance(
    planned,
    actual
  );

  if (progress >= 100) {
    return "Completed";
  }

  if (variance <= -11) {
    return "Delayed";
  }

  if (variance <= -5) {
    return "Warning";
  }

  if (progress > 0) {
    return "In Progress";
  }

  return "Not Started";
};

const getSeverity = (variance) => {
  if (variance <= -11) {
    return "Critical";
  }

  if (variance <= -6) {
    return "High";
  }

  if (variance < 0) {
    return "Warning";
  }

  return "Healthy";
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "Completed":
      return "schedule-status-completed";

    case "Delayed":
      return "schedule-status-delayed";

    case "Warning":
      return "schedule-status-warning";

    case "In Progress":
      return "schedule-status-progress";

    default:
      return "schedule-status-notstarted";
  }
};

const getDayValue = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
};

/* =========================================================
   PAGE
========================================================= */

const PlanningSchedule = () => {
  const navigate = useNavigate();

  const [scheduleInfo, setScheduleInfo] =
    useState(DEFAULT_SCHEDULE);

  const [fieldEvents, setFieldEvents] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [wbsFilter, setWbsFilter] =
    useState("All");

  const [showGantt, setShowGantt] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = () => {
    const importedSchedule =
      readStorage(
        SCHEDULE_STORAGE_KEY,
        null
      );

    const savedFieldEvents =
      readStorage(
        FIELD_EVENTS_STORAGE_KEY,
        []
      );

    setScheduleInfo({
      ...DEFAULT_SCHEDULE,
      ...(importedSchedule || {}),
    });

    setFieldEvents(
      Array.isArray(
        savedFieldEvents
      )
        ? savedFieldEvents
        : []
    );
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =======================================================
     MERGE FIELD UPDATES
  ======================================================= */

  const activities = useMemo(() => {
    return BASE_ACTIVITIES.map(
      (activity) => {
        const matchingEvents =
          fieldEvents
            .filter(
              (event) =>
                event &&
                event.activityId ===
                  activity.activityId
            )
            .sort(
              (a, b) =>
                new Date(
                  b.submittedAt || 0
                ) -
                new Date(
                  a.submittedAt || 0
                )
            );

        const latestEvent =
          matchingEvents[0];

        if (!latestEvent) {
          return activity;
        }

        const actualProgress =
          safeNumber(
            latestEvent.actualProgress,
            activity.actualProgress
          );

        const variance =
          getVariance(
            activity.plannedProgress,
            actualProgress
          );

        return {
          ...activity,

          actualProgress,

          status:
            getStatus(
              activity.plannedProgress,
              actualProgress
            ),

          severity:
            getSeverity(
              variance
            ),

          latestUpdate:
            latestEvent.progressNotes ||
            latestEvent.fieldDescription ||
            latestEvent.remarks ||
            activity.latestUpdate,

          updatedBy:
            latestEvent.submittedBy ||
            activity.updatedBy,

          updatedOn:
            latestEvent.submittedAt
              ? formatDate(
                  latestEvent.submittedAt
                )
              : activity.updatedOn,

          evidenceCount:
            Array.isArray(
              latestEvent.evidence
            )
              ? latestEvent.evidence
                  .length
              : activity.evidenceCount,
        };
      }
    );
  }, [fieldEvents]);

  /* =======================================================
     WBS OPTIONS
  ======================================================= */

  const wbsOptions = useMemo(() => {
    const unique = [
      ...new Set(
        activities
          .map(
            (activity) =>
              activity.wbs
          )
          .filter(Boolean)
      ),
    ];

    return [
      "All",
      ...unique,
    ];
  }, [activities]);

  /* =======================================================
     FILTERED ACTIVITIES
  ======================================================= */

  const filteredActivities =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return activities.filter(
        (activity) => {
          const variance =
            getVariance(
              activity.plannedProgress,
              activity.actualProgress
            );

          const status =
            getStatus(
              activity.plannedProgress,
              activity.actualProgress
            );

          const searchable = [
            activity.activityId,
            activity.name,
            activity.wbs,
            activity.discipline,
            activity.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            query === "" ||
            searchable.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "All" ||
            status ===
              statusFilter;

          const matchesWbs =
            wbsFilter ===
              "All" ||
            activity.wbs ===
              wbsFilter;

          /*
            Keep variable used so ESLint/Oxlint
            doesn't complain about variance being
            calculated but unused.
          */
          void variance;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesWbs
          );
        }
      );
    }, [
      activities,
      searchTerm,
      statusFilter,
      wbsFilter,
    ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    if (
      filteredActivities.length ===
      0
    ) {
      return {
        planned: 0,
        actual: 0,
        variance: 0,
      };
    }

    const planned =
      filteredActivities.reduce(
        (total, activity) =>
          total +
          safeNumber(
            activity.plannedProgress
          ),
        0
      ) /
      filteredActivities.length;

    const actual =
      filteredActivities.reduce(
        (total, activity) =>
          total +
          safeNumber(
            activity.actualProgress
          ),
        0
      ) /
      filteredActivities.length;

    return {
      planned: Math.round(
        planned
      ),
      actual: Math.round(
        actual
      ),
      variance:
        Math.round(actual) -
        Math.round(planned),
    };
  }, [filteredActivities]);

  /* =======================================================
     GANTT RANGE
  ======================================================= */

  const ganttDates = useMemo(() => {
    const allDates =
      activities.flatMap(
        (activity) => [
          getDayValue(
            activity.plannedStart
          ),
          getDayValue(
            activity.plannedFinish
          ),
        ]
      );

    const validDates =
      allDates.filter(Boolean);

    if (
      validDates.length ===
      0
    ) {
      return {
        start: new Date(
          "2026-09-01"
        ),
        end: new Date(
          "2026-10-15"
        ),
      };
    }

    let start =
      new Date(
        Math.min(
          ...validDates.map(
            (date) =>
              date.getTime()
          )
        )
      );

    let end =
      new Date(
        Math.max(
          ...validDates.map(
            (date) =>
              date.getTime()
          )
        )
      );

    start.setDate(
      start.getDate() - 2
    );

    end.setDate(
      end.getDate() + 2
    );

    return {
      start,
      end,
    };
  }, [activities]);

  const ganttTotalDays =
    Math.max(
      1,
      Math.round(
        (ganttDates.end -
          ganttDates.start) /
          86400000
      ) + 1
    );

  const ganttDayLabels =
    useMemo(() => {
      const values = [];

      for (
        let i = 0;
        i < ganttTotalDays;
        i += 1
      ) {
        const date =
          new Date(
            ganttDates.start
          );

        date.setDate(
          date.getDate() + i
        );

        values.push(date);
      }

      return values;
    }, [
      ganttDates,
      ganttTotalDays,
    ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      loadData();
      setRefreshing(false);
    }, 400);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardLayout
      title="Planning Schedule"
    >
      <div className="planning-schedule-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="schedule-page-header">

          <div>

            <button
              type="button"
              className="schedule-back-button"
              onClick={() =>
                navigate(
                  "/planning/dashboard"
                )
              }
            >
              <ArrowLeft
                size={15}
              />
              Planning Dashboard
            </button>

            <span className="schedule-eyebrow">
              PLANNING & CONTROL
            </span>

            <h2>
              Planning Schedule
            </h2>

            <p>
              Review planned activities against
              actual field progress.
            </p>

          </div>

          <div className="schedule-header-actions">

            <button
              type="button"
              className="schedule-secondary-button"
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
            >
              <RefreshCw
                size={15}
                className={
                  refreshing
                    ? "schedule-spinning"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="schedule-primary-button"
              onClick={() =>
                navigate(
                  "/planning/import"
                )
              }
            >
              <FileSpreadsheet
                size={15}
              />
              Import Schedule
            </button>

          </div>

        </div>

        {/* =================================================
            IMPORT INFORMATION
        ================================================= */}

        <section className="schedule-info-grid">

          <InfoCard
            icon={
              FileSpreadsheet
            }
            label="Source"
            value={
              scheduleInfo.source ||
              "Primavera P6"
            }
          />

          <InfoCard
            icon={
              CalendarDays
            }
            label="Last Imported"
            value={
              scheduleInfo.lastImported ||
              "—"
            }
          />

          <InfoCard
            icon={
              FileSpreadsheet
            }
            label="Activities"
            value={safeNumber(
              scheduleInfo.activities,
              4862
            ).toLocaleString()}
          />

          <InfoCard
            icon={
              BarChart3
            }
            label="WBS"
            value={
              scheduleInfo.wbs ||
              127
            }
          />

          <InfoCard
            icon={
              CheckCircle2
            }
            label="Milestones"
            value={
              scheduleInfo.milestones ||
              84
            }
          />

          <InfoCard
            icon={
              RefreshCw
            }
            label="Relationships"
            value={safeNumber(
              scheduleInfo.relationships,
              6742
            ).toLocaleString()}
          />

        </section>

        {/* =================================================
            PERFORMANCE
        ================================================= */}

        <section className="schedule-performance-card">

          <div className="performance-header">

            <div>

              <span>
                PLANNED VS ACTUAL
              </span>

              <h3>
                Schedule Performance
              </h3>

            </div>

            <div className="performance-summary">

              <div>
                <span>
                  PLANNED
                </span>

                <strong>
                  {summary.planned}%
                </strong>
              </div>

              <div>
                <span>
                  ACTUAL
                </span>

                <strong>
                  {summary.actual}%
                </strong>
              </div>

              <div>
                <span>
                  VARIANCE
                </span>

                <strong
                  className={
                    summary.variance <
                    0
                      ? "negative-value"
                      : "positive-value"
                  }
                >
                  {summary.variance >
                  0
                    ? "+"
                    : ""}
                  {summary.variance}%
                </strong>
              </div>

            </div>

          </div>

          <div className="performance-bars">

            <ProgressComparison
              label="Planned Progress"
              value={
                summary.planned
              }
              type="planned"
            />

            <ProgressComparison
              label="Actual Progress"
              value={
                summary.actual
              }
              type="actual"
            />

          </div>

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="schedule-filter-bar">

          <div className="schedule-search-box">

            <Search
              size={16}
            />

            <input
              type="text"
              value={
                searchTerm
              }
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search activity, ID, WBS, discipline, location..."
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm(
                    ""
                  )
                }
                aria-label="Clear search"
              >
                <X
                  size={14}
                />
              </button>
            )}

          </div>

          <div className="schedule-select-box">

            <Filter
              size={15}
            />

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Warning">
                Warning
              </option>

              <option value="Delayed">
                Delayed
              </option>

              <option value="Not Started">
                Not Started
              </option>
            </select>

          </div>

          <div className="schedule-select-box">

            <BarChart3
              size={15}
            />

            <select
              value={
                wbsFilter
              }
              onChange={(event) =>
                setWbsFilter(
                  event.target.value
                )
              }
            >
              {wbsOptions.map(
                (option) => (
                  <option
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option ===
                    "All"
                      ? "All WBS"
                      : option}
                  </option>
                )
              )}
            </select>

          </div>

          <button
            type="button"
            className={`gantt-toggle ${
              showGantt
                ? "active"
                : ""
            }`}
            onClick={() =>
              setShowGantt(
                (previous) =>
                  !previous
              )
            }
          >
            <BarChart3
              size={15}
            />

            {showGantt
              ? "Hide Gantt"
              : "Show Gantt"}
          </button>

        </section>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="schedule-table-card">

          <div className="schedule-table-header">

            <div>

              <span>
                SCHEDULE ACTIVITIES
              </span>

              <h3>
                Planned & Actual Activity Register
              </h3>

            </div>

            <span className="result-count">
              {
                filteredActivities.length
              }{" "}
              activities shown
            </span>

          </div>

          {filteredActivities.length ===
          0 ? (
            <div className="schedule-empty-state">

              <Search
                size={32}
              />

              <h3>
                No activities found
              </h3>

              <p>
                Try changing your search or
                filters.
              </p>

            </div>
          ) : (
            <div className="schedule-table-scroll">

              <table className="planning-schedule-table">

                <thead>

                  <tr>
                    <th>
                      Activity ID
                    </th>

                    <th>
                      Activity Name
                    </th>

                    <th>
                      WBS
                    </th>

                    <th>
                      Planned Start
                    </th>

                    <th>
                      Planned Finish
                    </th>

                    <th>
                      Planned
                    </th>

                    <th>
                      Actual
                    </th>

                    <th>
                      Variance
                    </th>

                    <th>
                      Status
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredActivities.map(
                    (activity) => {
                      const variance =
                        getVariance(
                          activity.plannedProgress,
                          activity.actualProgress
                        );

                      const status =
                        getStatus(
                          activity.plannedProgress,
                          activity.actualProgress
                        );

                      return (
                        <tr
                          key={
                            activity.activityId
                          }
                        >

                          <td>
                            <strong className="activity-id">
                              {
                                activity.activityId
                              }
                            </strong>
                          </td>

                          <td>
                            <div className="activity-name">
                              <strong>
                                {
                                  activity.name
                                }
                              </strong>

                              <span>
                                {
                                  activity.discipline
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="wbs-value">
                              {
                                activity.wbs
                              }
                            </span>
                          </td>

                          <td>
                            {
                              formatDate(
                                activity.plannedStart
                              )
                            }
                          </td>

                          <td>
                            {
                              formatDate(
                                activity.plannedFinish
                              )
                            }
                          </td>

                          <td>
                            <ProgressCell
                              value={
                                activity.plannedProgress
                              }
                              type="planned"
                            />
                          </td>

                          <td>
                            <ProgressCell
                              value={
                                activity.actualProgress
                              }
                              type="actual"
                            />
                          </td>

                          <td>
                            <span
                              className={`variance-badge ${
                                variance <
                                0
                                  ? "negative"
                                  : variance >
                                    0
                                  ? "positive"
                                  : "neutral"
                              }`}
                            >
                              {variance >
                              0
                                ? "+"
                                : ""}
                              {variance}%
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${getStatusClass(
                                status
                              )}`}
                            >
                              {
                                status
                              }
                            </span>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =================================================
            GANTT
        ================================================= */}

        {showGantt &&
          filteredActivities.length >
            0 && (
          <section className="gantt-card">

            <div className="gantt-header">

              <div>

                <span>
                  SCHEDULE VISUALIZATION
                </span>

                <h3>
                  Gantt View
                </h3>

                <p>
                  Planned activity windows with current
                  actual progress.
                </p>

              </div>

              <div className="gantt-legend">

                <span>
                  <i className="legend-planned" />
                  Planned
                </span>

                <span>
                  <i className="legend-actual" />
                  Actual
                </span>

              </div>

            </div>

            <div className="gantt-scroll">

              <div className="gantt-min-width">

                <div className="gantt-date-row">

                  <div className="gantt-name-column">
                    ACTIVITY
                  </div>

                  <div className="gantt-day-grid">

                    {ganttDayLabels.map(
                      (date, index) => (
                        <div
                          key={
                            `${date.toISOString()}-${index}`
                          }
                        >
                          {date.getDate()}
                        </div>
                      )
                    )}

                  </div>

                </div>

                {filteredActivities.map(
                  (activity) => {
                    const start =
                      getDayValue(
                        activity.plannedStart
                      );

                    const finish =
                      getDayValue(
                        activity.plannedFinish
                      );

                    if (
                      !start ||
                      !finish
                    ) {
                      return null;
                    }

                    const leftDays =
                      Math.max(
                        0,
                        Math.round(
                          (start -
                            ganttDates.start) /
                            86400000
                        )
                      );

                    const duration =
                      Math.max(
                        1,
                        Math.round(
                          (finish -
                            start) /
                            86400000
                        ) + 1
                      );

                    const left =
                      (leftDays /
                        ganttTotalDays) *
                      100;

                    const width =
                      (duration /
                        ganttTotalDays) *
                      100;

                    const actualRatio =
                      Math.min(
                        1,
                        Math.max(
                          0,
                          safeNumber(
                            activity.actualProgress
                          ) / 100
                        )
                      );

                    return (
                      <div
                        className="gantt-data-row"
                        key={
                          activity.activityId
                        }
                      >

                        <div className="gantt-name-column">

                          <strong>
                            {
                              activity.activityId
                            }
                          </strong>

                          <span>
                            {
                              activity.name
                            }
                          </span>

                        </div>

                        <div className="gantt-track">

                          <div
                            className="gantt-planned"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                            }}
                          >

                            <div
                              className="gantt-actual"
                              style={{
                                width: `${
                                  actualRatio *
                                  100
                                }%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </section>
        )}

      </div>
    </DashboardLayout>
  );
};

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="schedule-info-card">

      <div className="schedule-info-icon">
        <Icon size={16} />
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
};

/* =========================================================
   PROGRESS COMPARISON
========================================================= */

const ProgressComparison = ({
  label,
  value,
  type,
}) => {
  return (
    <div className="comparison-item">

      <div className="comparison-top">

        <span>
          {label}
        </span>

        <strong>
          {value}%
        </strong>

      </div>

      <div className="comparison-track">

        <div
          className={
            type === "planned"
              ? "comparison-fill planned"
              : "comparison-fill actual"
          }
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
};

/* =========================================================
   TABLE PROGRESS
========================================================= */

const ProgressCell = ({
  value,
  type,
}) => {
  const number =
    safeNumber(value);

  return (
    <div className="table-progress">

      <strong>
        {number}%
      </strong>

      <div className="table-progress-track">

        <div
          className={
            type === "planned"
              ? "table-progress-fill planned"
              : "table-progress-fill actual"
          }
          style={{
            width: `${Math.min(
              100,
              Math.max(0, number)
            )}%`,
          }}
        />

      </div>

    </div>
  );
};

export default PlanningSchedule;