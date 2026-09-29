import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  ArrowRight,
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

import "./ProjectManagerDashboard.css";

/* =========================================================
   STORAGE
========================================================= */

const FIELD_EVENTS_STORAGE_KEY =
  "progressBridgeFieldEvents";

const SCHEDULE_STORAGE_KEY =
  "progressBridgeScheduleImport";

/* =========================================================
   PROJECT SUMMARY
========================================================= */

const PROJECT_SUMMARY = {
  overallProgress: 67,
  plannedProgress: 72,
  variance: -5,
  delayedActivities: 23,
  criticalActivities: 7,
};

/* =========================================================
   PROGRESS TREND
========================================================= */

const progressTrend = [
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
   DELAYED ACTIVITIES
========================================================= */

const delayedActivities = [
  {
    id: "L6-CIV-021",
    name: "Foundation Work",
    planned: 80,
    actual: 65,
    variance: -15,
    status: "Delayed",
  },
  {
    id: "L6-PIP-024",
    name: "Pipe Installation",
    planned: 50,
    actual: 42,
    variance: -8,
    status: "Delayed",
  },
  {
    id: "L6-ELE-017",
    name: "Cable Installation",
    planned: 40,
    actual: 35,
    variance: -5,
    status: "Warning",
  },
  {
    id: "L6-MEC-008",
    name: "Equipment Installation",
    planned: 70,
    actual: 64,
    variance: -6,
    status: "Delayed",
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

    const value =
      JSON.parse(raw);

    return value;
  } catch {
    return fallback;
  }
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "Today";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Today";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ProjectManagerDashboard =
  () => {
    const navigate =
      useNavigate();

    const [
      fieldEvents,
      setFieldEvents,
    ] = useState([]);

    const [
      scheduleInfo,
      setScheduleInfo,
    ] = useState({
      source: "Primavera P6",
      lastImported:
        "25 Sep 2026",
    });

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    /* =======================================================
       LOAD SHARED STATE
    ======================================================= */

    const loadData = () => {
      const events =
        readStorage(
          FIELD_EVENTS_STORAGE_KEY,
          []
        );

      const imported =
        readStorage(
          SCHEDULE_STORAGE_KEY,
          null
        );

      setFieldEvents(
        Array.isArray(events)
          ? events
          : []
      );

      if (imported) {
        setScheduleInfo({
          source:
            imported.source ||
            "Primavera P6",

          lastImported:
            imported.lastImported ||
            "25 Sep 2026",
        });
      }
    };

    useEffect(() => {
      loadData();
    }, []);

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
          };
        }

        const sorted =
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
          );

        const latest =
          sorted[0];

        return {
          activityName:
            latest.activityName ||
            latest.activityId ||
            "Field Activity",

          actualProgress:
            Number(
              latest.actualProgress
            ) || 0,

          evidenceCount:
            Array.isArray(
              latest.evidence
            )
              ? latest.evidence.length
              : Number(
                  latest.evidenceCount
                ) || 0,

          updatedBy:
            latest.submittedBy ||
            "Site Supervisor",

          updatedAt:
            latest.submittedAt,
        };
      }, [fieldEvents]);

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

    return (
      <DashboardLayout
        title="Project Overview"
      >
        <div className="pm-dashboard-page">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="pm-dashboard-header">

            <div>

              <span className="pm-eyebrow">
                PROJECT MANAGEMENT
              </span>

              <h2>
                Project Overview
              </h2>

              <p>
                Monitor overall project health,
                execution progress and schedule performance.
              </p>

            </div>

            <div className="pm-dashboard-actions">

              <button
                type="button"
                className="pm-secondary-button"
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
                      ? "pm-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <button
                type="button"
                className="pm-primary-button"
                onClick={() =>
                  navigate(
                    "/pm/progress"
                  )
                }
              >
                <BarChart3
                  size={15}
                />

                View Progress

                <ArrowRight
                  size={14}
                />
              </button>

            </div>

          </div>

          {/* =================================================
              PROJECT CONTEXT
          ================================================= */}

          <section className="pm-project-context">

            <div>

              <span>
                PROJECT
              </span>

              <strong>
                Refinery Expansion Project
              </strong>

            </div>

            <div>

              <span>
                PACKAGE
              </span>

              <strong>
                Package 2
              </strong>

            </div>

            <div>

              <span>
                SITE
              </span>

              <strong>
                Area-A
              </strong>

            </div>

            <div>

              <span>
                SCHEDULE SOURCE
              </span>

              <strong>
                {
                  scheduleInfo.source
                }
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

          </section>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="pm-kpi-grid">

            <PmKpi
              icon={
                BarChart3
              }
              label="Overall Progress"
              value={`${PROJECT_SUMMARY.overallProgress}%`}
              helper="Current actual project progress"
              tone="blue"
            />

            <PmKpi
              icon={
                AlertTriangle
              }
              label="Planned vs Actual"
              value={`${PROJECT_SUMMARY.variance}%`}
              helper="Current schedule variance"
              tone="negative"
            />

            <PmKpi
              icon={
                Clock3
              }
              label="Delayed Activities"
              value={
                PROJECT_SUMMARY.delayedActivities
              }
              helper="Activities requiring attention"
              tone="warning"
            />

            <PmKpi
              icon={
                AlertTriangle
              }
              label="Critical Activities"
              value={
                PROJECT_SUMMARY.criticalActivities
              }
              helper="High-priority activities"
              tone="critical"
            />

          </section>

          {/* =================================================
              PROGRESS SUMMARY
          ================================================= */}

          <section className="pm-progress-summary">

            <div className="pm-card-title-row">

              <div>

                <span>
                  CURRENT PROJECT PERFORMANCE
                </span>

                <h3>
                  Planned vs Actual Progress
                </h3>

              </div>

              <span className="pm-status-pill">
                Schedule variance{" "}
                {PROJECT_SUMMARY.variance}%
              </span>

            </div>

            <div className="pm-progress-comparison">

              <div className="pm-comparison-item">

                <div className="pm-comparison-label">

                  <span>
                    Planned Progress
                  </span>

                  <strong>
                    {
                      PROJECT_SUMMARY.plannedProgress
                    }%
                  </strong>

                </div>

                <div className="pm-progress-track">

                  <div
                    className="pm-progress-fill planned"
                    style={{
                      width: `${PROJECT_SUMMARY.plannedProgress}%`,
                    }}
                  />

                </div>

              </div>

              <div className="pm-comparison-item">

                <div className="pm-comparison-label">

                  <span>
                    Actual Progress
                  </span>

                  <strong>
                    {
                      PROJECT_SUMMARY.overallProgress
                    }%
                  </strong>

                </div>

                <div className="pm-progress-track">

                  <div
                    className="pm-progress-fill actual"
                    style={{
                      width: `${PROJECT_SUMMARY.overallProgress}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              CHART
          ================================================= */}

          <section className="pm-chart-card">

            <div className="pm-card-title-row">

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

              <div className="pm-chart-legend">

                <span>
                  <i className="pm-planned-dot" />
                  Planned
                </span>

                <span>
                  <i className="pm-actual-dot" />
                  Actual
                </span>

              </div>

            </div>

            <div className="pm-chart">

              <ResponsiveContainer
                width="100%"
                height={310}
              >
                <LineChart
                  data={
                    progressTrend
                  }
                  margin={{
                    top: 15,
                    right: 18,
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
              BOTTOM GRID
          ================================================= */}

          <div className="pm-bottom-grid">

            {/* ===============================================
                DELAYED ACTIVITIES
            =============================================== */}

            <section className="pm-delayed-card">

              <div className="pm-card-title-row">

                <div>

                  <span>
                    ACTIVITIES REQUIRING ATTENTION
                  </span>

                  <h3>
                    Delayed Activities
                  </h3>

                </div>

                <button
                  type="button"
                  className="pm-text-button"
                  onClick={() =>
                    navigate(
                      "/pm/delays"
                    )
                  }
                >
                  View Delays
                  <ArrowRight
                    size={13}
                  />
                </button>

              </div>

              <div className="pm-delayed-table-wrap">

                <table className="pm-delayed-table">

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
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {delayedActivities.map(
                      (activity) => (
                        <tr
                          key={
                            activity.id
                          }
                        >

                          <td>

                            <div className="pm-activity-name">

                              <strong>
                                {
                                  activity.name
                                }
                              </strong>

                              <span>
                                {
                                  activity.id
                                }
                              </span>

                            </div>

                          </td>

                          <td>
                            {
                              activity.planned
                            }%
                          </td>

                          <td>
                            {
                              activity.actual
                            }%
                          </td>

                          <td>

                            <span className="pm-negative-variance">
                              {
                                activity.variance
                              }%
                            </span>

                          </td>

                          <td>

                            <span
                              className={`pm-status-badge ${
                                activity.status ===
                                "Warning"
                                  ? "warning"
                                  : "delayed"
                              }`}
                            >
                              {
                                activity.status
                              }
                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ===============================================
                LATEST FIELD UPDATE
            =============================================== */}

            <section className="pm-field-update-card">

              <div className="pm-card-title-row">

                <div>

                  <span>
                    LATEST FIELD UPDATE
                  </span>

                  <h3>
                    Site Execution
                  </h3>

                </div>

                <CheckCircle2
                  size={19}
                  className="pm-green-icon"
                />

              </div>

              <div className="pm-field-update-main">

                <div className="pm-field-update-icon">
                  <BarChart3
                    size={20}
                  />
                </div>

                <div>

                  <strong>
                    {
                      latestFieldUpdate.activityName
                    }
                  </strong>

                  <p>
                    Actual progress updated to{" "}
                    <strong>
                      {
                        latestFieldUpdate.actualProgress
                      }%
                    </strong>
                  </p>

                  <span>
                    Updated by{" "}
                    {
                      latestFieldUpdate.updatedBy
                    }
                  </span>

                </div>

              </div>

              <div className="pm-field-update-progress">

                <div>

                  <span>
                    ACTUAL PROGRESS
                  </span>

                  <strong>
                    {
                      latestFieldUpdate.actualProgress
                    }%
                  </strong>

                </div>

                <div className="pm-progress-track">

                  <div
                    className="pm-progress-fill actual"
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

              <div className="pm-field-update-footer">

                <span>
                  <FileText
                    size={14}
                  />
                  {
                    latestFieldUpdate.evidenceCount
                  }{" "}
                  photos
                </span>

                <span>
                  {formatDateTime(
                    latestFieldUpdate.updatedAt
                  )}
                </span>

              </div>

            </section>

          </div>

          {/* =================================================
              QUICK NAVIGATION
          ================================================= */}

          <section className="pm-quick-links">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/pm/progress"
                )
              }
            >
              <BarChart3
                size={17}
              />

              <div>
                <strong>
                  Project Progress
                </strong>

                <span>
                  Overall and discipline-wise performance
                </span>
              </div>

              <ArrowRight
                size={15}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/pm/schedule"
                )
              }
            >
              <Clock3
                size={17}
              />

              <div>
                <strong>
                  Project Schedule
                </strong>

                <span>
                  Review current project schedule
                </span>
              </div>

              <ArrowRight
                size={15}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/pm/delays"
                )
              }
            >
              <AlertTriangle
                size={17}
              />

              <div>
                <strong>
                  Delay Monitor
                </strong>

                <span>
                  Review delayed and critical activities
                </span>
              </div>

              <ArrowRight
                size={15}
              />
            </button>

          </section>

        </div>
      </DashboardLayout>
    );
  };

/* =========================================================
   KPI COMPONENT
========================================================= */

const PmKpi = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}) => {
  return (
    <div
      className={`pm-kpi-card pm-kpi-${tone}`}
    >

      <div className="pm-kpi-icon">
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

export default ProjectManagerDashboard;