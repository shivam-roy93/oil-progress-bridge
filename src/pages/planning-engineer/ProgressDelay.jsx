import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

import "./ProgressDelay.css";

/* =========================================================
   STORAGE
========================================================= */

const FIELD_EVENTS_STORAGE_KEY =
  "progressBridgeFieldEvents";

const SCHEDULE_STORAGE_KEY =
  "progressBridgeScheduleImport";

/* =========================================================
   PROJECT TOTALS
========================================================= */

const PROJECT_TOTALS = {
  planned: 72,
  actual: 67,
  variance: -5,
  delayed: 23,
  critical: 7,
  averageVariance: -8,
  scheduleRisk: "Medium",
};

/* =========================================================
   PROGRESS TREND
========================================================= */

const PROGRESS_TREND = [
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

/* =========================================================
   ATTENTION ACTIVITIES
========================================================= */

const BASE_ATTENTION_ACTIVITIES = [
  {
    id: "A101",
    activityId: "L6-CIV-021",
    name: "Foundation Work",
    discipline: "Civil",
    wbs: "Civil > Foundation",
    plannedProgress: 80,
    actualProgress: 65,
    variance: -15,
    daysBehind: 5,
    status: "Delayed",
    severity: "Critical",
    plannedStart: "2026-09-10",
    plannedFinish: "2026-09-25",
    location: "Km 12+000 - Km 12+500",
    latestUpdate:
      "RCC foundation completed up to column area.",
    evidenceCount: 3,
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    matchConfidence: null,
  },
  {
    id: "A104",
    activityId: "L6-PIP-024",
    name: "Erect Line 24-XX",
    discipline: "Piping",
    wbs: "Piping > Erection",
    plannedProgress: 50,
    actualProgress: 42,
    variance: -8,
    daysBehind: 3,
    status: "Delayed",
    severity: "High",
    plannedStart: "2026-09-18",
    plannedFinish: "2026-10-01",
    location: "Unit-02 / Pipe Rack",
    latestUpdate:
      "Spool 24 erection field update received.",
    evidenceCount: 2,
    updatedBy: "Ramesh Kumar",
    updatedOn: "26 Sep 2026",
    matchConfidence: 96,
  },
  {
    id: "A108",
    activityId: "L6-MEC-008",
    name: "Equipment Installation",
    discipline: "Mechanical",
    wbs: "Mechanical > Installation",
    plannedProgress: 70,
    actualProgress: 64,
    variance: -6,
    daysBehind: 2,
    status: "Warning",
    severity: "Medium",
    plannedStart: "2026-09-25",
    plannedFinish: "2026-10-03",
    location: "Equipment Yard",
    latestUpdate:
      "Equipment installation continues with available resources.",
    evidenceCount: 2,
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    matchConfidence: null,
  },
  {
    id: "A106",
    activityId: "L6-ELE-017",
    name: "Cable Laying",
    discipline: "Electrical",
    wbs: "Electrical > Cable",
    plannedProgress: 40,
    actualProgress: 35,
    variance: -5,
    daysBehind: 2,
    status: "Warning",
    severity: "Warning",
    plannedStart: "2026-09-21",
    plannedFinish: "2026-10-02",
    location: "Substation-A",
    latestUpdate:
      "Cable laying continued in the substation area.",
    evidenceCount: 1,
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    matchConfidence: null,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const readStorage = (
  key,
  fallback
) => {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const safeNumber = (
  value,
  fallback = 0
) => {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const getVariance = (
  planned,
  actual
) => {
  return (
    safeNumber(actual) -
    safeNumber(planned)
  );
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getStatusClass = (
  status
) => {
  switch (status) {
    case "Critical":
      return "delay-status-critical";

    case "High":
      return "delay-status-high";

    case "Medium":
      return "delay-status-medium";

    case "Warning":
      return "delay-status-warning";

    case "Delayed":
      return "delay-status-delayed";

    default:
      return "delay-status-healthy";
  }
};

/* =========================================================
   PAGE
========================================================= */

const ProgressDelay = () => {
  const navigate =
    useNavigate();

  const [
    fieldEvents,
    setFieldEvents,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedActivity,
    setSelectedActivity,
  ] = useState(null);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    scheduleInfo,
    setScheduleInfo,
  ] = useState({
    source: "Primavera P6",
    lastImported:
      "25 Sep 2026",
  });

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = () => {
    const events =
      readStorage(
        FIELD_EVENTS_STORAGE_KEY,
        []
      );

    const importedSchedule =
      readStorage(
        SCHEDULE_STORAGE_KEY,
        null
      );

    setFieldEvents(
      Array.isArray(events)
        ? events
        : []
    );

    if (
      importedSchedule
    ) {
      setScheduleInfo({
        source:
          importedSchedule.source ||
          "Primavera P6",

        lastImported:
          importedSchedule.lastImported ||
          "25 Sep 2026",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =======================================================
     MERGE LATEST FIELD UPDATE
  ======================================================= */

  const attentionActivities =
    useMemo(() => {
      return BASE_ATTENTION_ACTIVITIES.map(
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
                    b.submittedAt ||
                      0
                  ) -
                  new Date(
                    a.submittedAt ||
                      0
                  )
              );

          const latestEvent =
            matchingEvents[0];

          if (
            !latestEvent
          ) {
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

            variance,

            status:
              variance <= -11
                ? "Delayed"
                : variance < 0
                ? "Delayed"
                : "Warning",

            severity:
              variance <= -11
                ? "Critical"
                : variance <= -6
                ? "High"
                : "Medium",

            latestUpdate:
              latestEvent.progressNotes ||
              latestEvent.fieldDescription ||
              latestEvent.remarks ||
              activity.latestUpdate,

            evidenceCount:
              Array.isArray(
                latestEvent.evidence
              )
                ? latestEvent.evidence
                    .length
                : activity.evidenceCount,

            updatedBy:
              latestEvent.submittedBy ||
              activity.updatedBy,

            updatedOn:
              latestEvent.submittedAt
                ? formatDate(
                    latestEvent.submittedAt
                  )
                : activity.updatedOn,

            matchConfidence:
              latestEvent.confidence ??
              activity.matchConfidence,
          };
        }
      );
    }, [fieldEvents]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredActivities =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return attentionActivities;
      }

      return attentionActivities.filter(
        (activity) => {
          const text = [
            activity.activityId,
            activity.name,
            activity.discipline,
            activity.wbs,
            activity.location,
            activity.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(
            query
          );
        }
      );
    }, [
      attentionActivities,
      searchTerm,
    ]);

  /* =======================================================
     LATEST FIELD UPDATE
  ======================================================= */

  const latestFieldUpdate =
    useMemo(() => {
      if (
        fieldEvents.length ===
        0
      ) {
        return {
          activityName:
            "Foundation Work",
          actualProgress: 65,
          evidenceCount: 3,
          updatedBy:
            "Site Engineer",
          updatedAt:
            "2026-09-26T10:15:00+05:30",
          description:
            "RCC foundation completed up to column area.",
        };
      }

      const latest =
        [
          ...fieldEvents,
        ].sort(
          (a, b) =>
            new Date(
              b.submittedAt ||
                0
            ) -
            new Date(
              a.submittedAt ||
                0
            )
        )[0];

      return {
        activityName:
          latest.activityName ||
          latest.activityId ||
          "Field Activity",

        actualProgress:
          safeNumber(
            latest.actualProgress,
            0
          ),

        evidenceCount:
          Array.isArray(
            latest.evidence
          )
            ? latest.evidence.length
            : safeNumber(
                latest.evidenceCount,
                0
              ),

        updatedBy:
          latest.submittedBy ||
          "Site Supervisor",

        updatedAt:
          latest.submittedAt,

        description:
          latest.progressNotes ||
          latest.fieldDescription ||
          latest.remarks ||
          "Field update received.",
      };
    }, [fieldEvents]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    () => {
      setIsRefreshing(
        true
      );

      window.setTimeout(
        () => {
          loadData();
          setIsRefreshing(
            false
          );
        },
        400
      );
    };

  /* =======================================================
     OPEN DETAILS
  ======================================================= */

  const handleOpenDetails =
    (activity) => {
      setSelectedActivity(
        activity
      );
    };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeDetails =
    () => {
      setSelectedActivity(
        null
      );
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardLayout
      title="Progress & Delay"
    >
      <div className="progress-delay-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="delay-page-header">

          <div>

            <button
              type="button"
              className="delay-back-button"
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

            <span className="delay-eyebrow">
              PLANNING & CONTROL
            </span>

            <h2>
              Progress & Delay Analysis
            </h2>

            <p>
              Compare planned progress with actual
              field execution and identify activities
              requiring attention.
            </p>

          </div>

          <div className="delay-header-actions">

            <button
              type="button"
              className="delay-secondary-button"
              onClick={
                handleRefresh
              }
              disabled={
                isRefreshing
              }
            >
              <RefreshCw
                size={15}
                className={
                  isRefreshing
                    ? "delay-spin"
                    : ""
                }
              />

              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="delay-secondary-button"
              onClick={() =>
                navigate(
                  "/planning/schedule"
                )
              }
            >
              <FileText
                size={15}
              />
              View Schedule
            </button>

          </div>

        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="delay-kpi-grid">

          <DelayKpi
            icon={
              BarChart3
            }
            label="Planned"
            value={`${PROJECT_TOTALS.planned}%`}
            helper="Current schedule plan"
            tone="planned"
          />

          <DelayKpi
            icon={
              CheckCircle2
            }
            label="Actual"
            value={`${PROJECT_TOTALS.actual}%`}
            helper="Latest field progress"
            tone="actual"
          />

          <DelayKpi
            icon={
              AlertTriangle
            }
            label="Variance"
            value={`${PROJECT_TOTALS.variance}%`}
            helper="Planned vs actual"
            tone="negative"
          />

          <DelayKpi
            icon={
              Clock3
            }
            label="Delayed Activities"
            value={
              PROJECT_TOTALS.delayed
            }
            helper="Require attention"
            tone="warning"
          />

        </section>

        {/* =================================================
            SUMMARY STRIP
        ================================================= */}

        <section className="delay-summary-strip">

          <div>

            <span>
              SCHEDULE SOURCE
            </span>

            <strong>
              {scheduleInfo.source}
            </strong>

          </div>

          <div>

            <span>
              LAST IMPORTED
            </span>

            <strong>
              {
                scheduleInfo.lastImported
              }
            </strong>

          </div>

          <div>

            <span>
              CRITICAL ACTIVITIES
            </span>

            <strong className="critical-number">
              {
                PROJECT_TOTALS.critical
              }
            </strong>

          </div>

          <div>

            <span>
              AVERAGE VARIANCE
            </span>

            <strong className="negative-text">
              {
                PROJECT_TOTALS.averageVariance
              }%
            </strong>

          </div>

          <div>

            <span>
              SCHEDULE RISK
            </span>

            <strong className="risk-medium">
              {
                PROJECT_TOTALS.scheduleRisk
              }
            </strong>

          </div>

        </section>

        {/* =================================================
            PLANNED VS ACTUAL CHART
        ================================================= */}

        <section className="delay-chart-card">

          <div className="delay-card-header">

            <div>

              <span>
                PLANNED VS ACTUAL PROGRESS
              </span>

              <h3>
                Progress Trend
              </h3>

              <p>
                Weekly planned progress compared
                with actual field execution.
              </p>

            </div>

            <div className="chart-legend">

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

          <div className="delay-chart">

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart
                data={
                  PROGRESS_TREND
                }
                margin={{
                  top: 15,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  stroke="#e8edf2"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="week"
                  tick={{
                    fill: "#8193a5",
                    fontSize: 10,
                  }}
                  axisLine={{
                    stroke:
                      "#dfe6ec",
                  }}
                  tickLine={false}
                />

                <YAxis
                  domain={[
                    0,
                    80,
                  ]}
                  tick={{
                    fill: "#8193a5",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(
                    value
                  ) =>
                    `${value}%`
                  }
                />

                <Tooltip
                  contentStyle={{
                    border:
                      "1px solid #dfe7ef",
                    borderRadius:
                      "8px",
                    fontSize:
                      "10px",
                    boxShadow:
                      "0 5px 18px rgba(24,50,77,.08)",
                  }}
                  formatter={(
                    value
                  ) =>
                    `${value}%`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="planned"
                  stroke="#8ea7c1"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2f6fed"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="delay-search-bar">

          <div className="delay-search-input">

            <Search
              size={16}
            />

            <input
              type="text"
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target
                    .value
                )
              }
              placeholder="Search activity, ID, WBS, discipline..."
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

          <span>
            {
              filteredActivities.length
            }{" "}
            attention items shown
          </span>

        </section>

        {/* =================================================
            ATTENTION TABLE
        ================================================= */}

        <section className="delay-table-card">

          <div className="delay-card-header">

            <div>

              <span>
                ACTIVITIES REQUIRING ATTENTION
              </span>

              <h3>
                Delayed Activities
              </h3>

              <p>
                Review activities falling behind the
                current planned schedule.
              </p>

            </div>

            <div className="delayed-count-badge">
              {
                PROJECT_TOTALS.delayed
              } delayed
            </div>

          </div>

          {filteredActivities.length ===
          0 ? (
            <div className="delay-empty-state">

              <CheckCircle2
                size={30}
              />

              <h3>
                No matching activities
              </h3>

              <p>
                Try a different search term.
              </p>

            </div>
          ) : (
            <div className="delay-table-scroll">

              <table className="delay-table">

                <thead>

                  <tr>

                    <th>
                      Activity
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
                      Days Behind
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredActivities.map(
                    (activity) => (
                      <tr
                        key={
                          activity.id
                        }
                      >

                        <td>

                          <div className="delay-activity-cell">

                            <strong>
                              {
                                activity.name
                              }
                            </strong>

                            <span>
                              {
                                activity.activityId
                              }{" "}
                              ·{" "}
                              {
                                activity.discipline
                              }
                            </span>

                          </div>

                        </td>

                        <td>
                          {
                            activity.plannedProgress
                          }%
                        </td>

                        <td>
                          {
                            activity.actualProgress
                          }%
                        </td>

                        <td>

                          <span className="table-negative">
                            {activity.variance >
                            0
                              ? "+"
                              : ""}
                            {
                              activity.variance
                            }%
                          </span>

                        </td>

                        <td>

                          <strong className="days-behind">
                            {
                              activity.daysBehind
                            }{" "}
                            days
                          </strong>

                        </td>

                        <td>

                          <span
                            className={`delay-status-badge ${getStatusClass(
                              activity.severity
                            )}`}
                          >
                            {
                              activity.severity
                            }
                          </span>

                        </td>

                        <td>

                          <button
                            type="button"
                            className="view-details-button"
                            onClick={() =>
                              handleOpenDetails(
                                activity
                              )
                            }
                          >
                            VIEW DETAILS
                            <ArrowRight
                              size={13}
                            />
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =================================================
            LATEST FIELD UPDATE
        ================================================= */}

        <section className="latest-update-card">

          <div className="delay-card-header">

            <div>

              <span>
                LATEST FIELD UPDATE
              </span>

              <h3>
                Site Execution Update
              </h3>

            </div>

            <div className="field-update-status">
              <CheckCircle2
                size={14}
              />
              RECEIVED
            </div>

          </div>

          <div className="latest-update-content">

            <div className="latest-update-icon">
              <BarChart3
                size={20}
              />
            </div>

            <div className="latest-update-main">

              <strong>
                {
                  latestFieldUpdate.activityName
                }
              </strong>

              <p>
                {
                  latestFieldUpdate.description
                }
              </p>

              <span>
                Updated by{" "}
                {
                  latestFieldUpdate.updatedBy
                }{" "}
                ·{" "}
                {
                  latestFieldUpdate.updatedAt
                    ? formatDate(
                        latestFieldUpdate.updatedAt
                      )
                    : "Today"
                }
              </span>

            </div>

            <div className="latest-update-progress">

              <span>
                ACTUAL PROGRESS
              </span>

              <strong>
                {
                  latestFieldUpdate.actualProgress
                }%
              </strong>

              <div className="latest-progress-track">

                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        latestFieldUpdate.actualProgress
                      )
                    )}%`,
                  }}
                />

              </div>

            </div>

            <div className="latest-evidence">

              <FileText
                size={15}
              />

              {
                latestFieldUpdate.evidenceCount
              }{" "}
              photos

            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          ACTIVITY DETAILS MODAL
      ===================================================== */}

      {selectedActivity && (
        <div
          className="activity-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDetails();
            }
          }}
        >

          <div className="activity-modal">

            <div className="activity-modal-header">

              <div>

                <span>
                  ACTIVITY DETAILS
                </span>

                <h2>
                  {
                    selectedActivity.name
                  }
                </h2>

                <p>
                  {
                    selectedActivity.activityId
                  }{" "}
                  ·{" "}
                  {
                    selectedActivity.discipline
                  }
                </p>

              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={
                  closeDetails
                }
                aria-label="Close activity details"
              >
                <X
                  size={18}
                />
              </button>

            </div>

            <div className="activity-modal-body">

              {/* ACTIVITY INFORMATION */}

              <div className="modal-section">

                <div className="modal-section-title">

                  <FileText
                    size={16}
                  />

                  <h3>
                    Activity Information
                  </h3>

                </div>

                <div className="modal-info-grid">

                  <ModalInfo
                    label="Activity ID"
                    value={
                      selectedActivity.activityId
                    }
                  />

                  <ModalInfo
                    label="Activity Name"
                    value={
                      selectedActivity.name
                    }
                  />

                  <ModalInfo
                    label="WBS"
                    value={
                      selectedActivity.wbs
                    }
                  />

                  <ModalInfo
                    label="Discipline"
                    value={
                      selectedActivity.discipline
                    }
                  />

                  <ModalInfo
                    label="Location"
                    value={
                      selectedActivity.location
                    }
                  />

                  <ModalInfo
                    label="Status"
                    value={
                      selectedActivity.status
                    }
                  />

                </div>

              </div>

              {/* PROGRESS */}

              <div className="modal-section">

                <div className="modal-section-title">

                  <BarChart3
                    size={16}
                  />

                  <h3>
                    Planned vs Actual
                  </h3>

                </div>

                <div className="modal-progress-grid">

                  <div>

                    <span>
                      PLANNED PROGRESS
                    </span>

                    <strong>
                      {
                        selectedActivity.plannedProgress
                      }%
                    </strong>

                  </div>

                  <div>

                    <span>
                      ACTUAL PROGRESS
                    </span>

                    <strong>
                      {
                        selectedActivity.actualProgress
                      }%
                    </strong>

                  </div>

                  <div>

                    <span>
                      VARIANCE
                    </span>

                    <strong className="negative-text">
                      {
                        selectedActivity.variance
                      }%
                    </strong>

                  </div>

                  <div>

                    <span>
                      DAYS BEHIND
                    </span>

                    <strong>
                      {
                        selectedActivity.daysBehind
                      }{" "}
                      days
                    </strong>

                  </div>

                </div>

                <div className="modal-progress-track">

                  <div
                    className="modal-planned-line"
                    style={{
                      width: `${selectedActivity.plannedProgress}%`,
                    }}
                  />

                  <div
                    className="modal-actual-line"
                    style={{
                      width: `${selectedActivity.actualProgress}%`,
                    }}
                  />

                </div>

              </div>

              {/* DATES */}

              <div className="modal-section">

                <div className="modal-section-title">

                  <CalendarDays
                    size={16}
                  />

                  <h3>
                    Schedule Dates
                  </h3>

                </div>

                <div className="modal-info-grid">

                  <ModalInfo
                    label="Planned Start"
                    value={formatDate(
                      selectedActivity.plannedStart
                    )}
                  />

                  <ModalInfo
                    label="Planned Finish"
                    value={formatDate(
                      selectedActivity.plannedFinish
                    )}
                  />

                </div>

              </div>

              {/* FIELD UPDATE */}

              <div className="modal-section">

                <div className="modal-section-title">

                  <CheckCircle2
                    size={16}
                  />

                  <h3>
                    Latest Field Update
                  </h3>

                </div>

                <div className="modal-field-update">

                  <p>
                    {
                      selectedActivity.latestUpdate
                    }
                  </p>

                  <div className="modal-field-meta">

                    <span>
                      Updated by{" "}
                      {
                        selectedActivity.updatedBy
                      }
                    </span>

                    <span>
                      {
                        selectedActivity.updatedOn
                      }
                    </span>

                  </div>

                </div>

              </div>

              {/* EVIDENCE */}

              <div className="modal-section">

                <div className="modal-section-title">

                  <FileText
                    size={16}
                  />

                  <h3>
                    Evidence & Matching
                  </h3>

                </div>

                <div className="modal-info-grid">

                  <ModalInfo
                    label="Evidence"
                    value={`${selectedActivity.evidenceCount} photos`}
                  />

                  <ModalInfo
                    label="Match Confidence"
                    value={
                      selectedActivity.matchConfidence
                        ? `${selectedActivity.matchConfidence}%`
                        : "—"
                    }
                  />

                  <ModalInfo
                    label="Severity"
                    value={
                      selectedActivity.severity
                    }
                  />

                </div>

              </div>

            </div>

            <div className="activity-modal-footer">

              <button
                type="button"
                className="delay-secondary-button"
                onClick={
                  closeDetails
                }
              >
                CLOSE
              </button>

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
};

/* =========================================================
   KPI
========================================================= */

const DelayKpi = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}) => {
  return (
    <div
      className={`delay-kpi-card delay-kpi-${tone}`}
    >

      <div className="delay-kpi-icon">
        <Icon size={19} />
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {helper}
        </small>

      </div>

    </div>
  );
};

/* =========================================================
   MODAL INFO
========================================================= */

const ModalInfo = ({
  label,
  value,
}) => {
  return (
    <div className="modal-info-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
};

export default ProgressDelay;