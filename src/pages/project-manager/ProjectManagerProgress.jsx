import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
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

import "./ProjectManagerProgress.css";

/* =========================================================
   STORAGE
========================================================= */

const FIELD_EVENTS_STORAGE_KEY =
  "progressBridgeFieldEvents";

/* =========================================================
   PROJECT PROGRESS
========================================================= */

const DEFAULT_PROGRESS = {
  planned: 72,
  actual: 67,
  variance: -5,
};

/* =========================================================
   DISCIPLINE DATA
========================================================= */

const DISCIPLINE_PROGRESS = [
  {
    discipline: "Civil",
    planned: 85,
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
    planned: 68,
    actual: 61,
  },
];

/* =========================================================
   TREND
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
   PAGE
========================================================= */

const ProjectManagerProgress =
  () => {
    const navigate =
      useNavigate();

    const [
      fieldEvents,
      setFieldEvents,
    ] = useState([]);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    const [
      updatedAt,
      setUpdatedAt,
    ] = useState(
      "10:15 AM"
    );

    /* =======================================================
       LOAD SHARED DATA
    ======================================================= */

    const loadData = () => {
      const events =
        readStorage(
          FIELD_EVENTS_STORAGE_KEY,
          []
        );

      setFieldEvents(
        Array.isArray(events)
          ? events
          : []
      );

      if (
        Array.isArray(events) &&
        events.length > 0
      ) {
        const sorted =
          [...events].sort(
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

        setUpdatedAt(
          latest?.submittedAt
            ? new Date(
                latest.submittedAt
              ).toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              )
            : "10:15 AM"
        );
      }
    };

    useEffect(() => {
      loadData();
    }, []);

    /* =======================================================
       LATEST EVENT
    ======================================================= */

    const latestEvent =
      useMemo(() => {
        if (
          fieldEvents.length ===
          0
        ) {
          return {
            activityName:
              "Foundation Work",
            actualProgress: 65,
            submittedBy:
              "Site Engineer",
            submittedAt:
              "2026-09-26T10:15:00+05:30",
          };
        }

        return [
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
      }, [fieldEvents]);

    /* =======================================================
       REFRESH
    ======================================================= */

    const handleRefresh =
      () => {
        setRefreshing(
          true
        );

        window.setTimeout(
          () => {
            loadData();
            setRefreshing(
              false
            );
          },
          400
        );
      };

    return (
      <DashboardLayout
        title="Project Progress"
      >
        <div className="pm-progress-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="pm-progress-header">

            <div>

              <button
                type="button"
                className="pm-progress-back"
                onClick={() =>
                  navigate(
                    "/pm/dashboard"
                  )
                }
              >
                <ArrowLeft
                  size={15}
                />
                Project Overview
              </button>

              <span className="pm-progress-eyebrow">
                PROJECT MANAGEMENT
              </span>

              <h2>
                Project Progress
              </h2>

              <p>
                Monitor overall and discipline-wise execution
                against the current project plan.
              </p>

            </div>

            <button
              type="button"
              className="pm-progress-refresh"
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
                    ? "pm-progress-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <section className="pm-progress-kpi-grid">

            <ProgressKpi
              icon={
                BarChart3
              }
              label="Planned"
              value="72%"
              helper="Current schedule plan"
              tone="planned"
            />

            <ProgressKpi
              icon={
                CheckCircle2
              }
              label="Actual"
              value="67%"
              helper="Latest field progress"
              tone="actual"
            />

            <ProgressKpi
              icon={
                TrendingDown
              }
              label="Variance"
              value="-5%"
              helper="Actual vs planned"
              tone="negative"
            />

          </section>

          {/* =================================================
              OVERALL PROGRESS
          ================================================= */}

          <section className="pm-progress-overall-card">

            <div className="pm-progress-section-header">

              <div>

                <span>
                  OVERALL PROGRESS
                </span>

                <h3>
                  Planned vs Actual
                </h3>

                <p>
                  Current project-level execution against
                  the planned schedule.
                </p>

              </div>

              <div className="pm-progress-variance-pill">
                Variance -5%
              </div>

            </div>

            <div className="pm-overall-layout">

              <div className="pm-overall-number">

                <span>
                  ACTUAL PROJECT PROGRESS
                </span>

                <strong>
                  67%
                </strong>

                <small>
                  5 percentage points behind plan
                </small>

              </div>

              <div className="pm-overall-bars">

                <ProgressBar
                  label="Planned Progress"
                  value={
                    DEFAULT_PROGRESS.planned
                  }
                  variant="planned"
                />

                <ProgressBar
                  label="Actual Progress"
                  value={
                    DEFAULT_PROGRESS.actual
                  }
                  variant="actual"
                />

              </div>

            </div>

          </section>

          {/* =================================================
              DISCIPLINE WISE
          ================================================= */}

          <section className="pm-discipline-card">

            <div className="pm-progress-section-header">

              <div>

                <span>
                  DISCIPLINE-WISE PROGRESS
                </span>

                <h3>
                  Execution by Discipline
                </h3>

                <p>
                  Current actual progress across major
                  engineering disciplines.
                </p>

              </div>

            </div>

            <div className="pm-discipline-list">

              {DISCIPLINE_PROGRESS.map(
                (item) => {
                  const variance =
                    item.actual -
                    item.planned;

                  return (
                    <div
                      className="pm-discipline-row"
                      key={
                        item.discipline
                      }
                    >

                      <div className="pm-discipline-name">

                        <strong>
                          {
                            item.discipline
                          }
                        </strong>

                        <span>
                          Planned{" "}
                          {
                            item.planned
                          }%
                        </span>

                      </div>

                      <div className="pm-discipline-track">

                        <div
                          className="pm-discipline-planned"
                          style={{
                            width: `${item.planned}%`,
                          }}
                        />

                        <div
                          className="pm-discipline-actual"
                          style={{
                            width: `${item.actual}%`,
                          }}
                        />

                      </div>

                      <div className="pm-discipline-values">

                        <strong>
                          {
                            item.actual
                          }%
                        </strong>

                        <span
                          className={
                            variance < 0
                              ? "pm-discipline-negative"
                              : "pm-discipline-positive"
                          }
                        >
                          {variance >
                          0
                            ? "+"
                            : ""}
                          {variance}%
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            <div className="pm-discipline-legend">

              <span>
                <i className="pm-legend-planned" />
                Planned
              </span>

              <span>
                <i className="pm-legend-actual" />
                Actual
              </span>

            </div>

          </section>

          {/* =================================================
              PROGRESS TREND
          ================================================= */}

          <section className="pm-progress-chart-card">

            <div className="pm-progress-section-header">

              <div>

                <span>
                  PROGRESS TREND
                </span>

                <h3>
                  Planned vs Actual Progress
                </h3>

                <p>
                  Weekly project progress trend.
                </p>

              </div>

              <div className="pm-progress-chart-legend">

                <span>
                  <i className="pm-chart-planned" />
                  Planned
                </span>

                <span>
                  <i className="pm-chart-actual" />
                  Actual
                </span>

              </div>

            </div>

            <div className="pm-progress-chart">

              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <LineChart
                  data={
                    PROGRESS_TREND
                  }
                  margin={{
                    top: 15,
                    right: 20,
                    left: 0,
                    bottom: 8,
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
              LATEST EXECUTION SNAPSHOT
          ================================================= */}

          <section className="pm-progress-latest-card">

            <div className="pm-progress-section-header">

              <div>

                <span>
                  LATEST EXECUTION SNAPSHOT
                </span>

                <h3>
                  Most Recent Field Update
                </h3>

              </div>

              <CheckCircle2
                size={18}
                className="pm-progress-success-icon"
              />

            </div>

            <div className="pm-progress-latest-content">

              <div className="pm-progress-latest-icon">
                <BarChart3
                  size={20}
                />
              </div>

              <div className="pm-progress-latest-main">

                <strong>
                  {
                    latestEvent.activityName ||
                    latestEvent.activityId ||
                    "Foundation Work"
                  }
                </strong>

                <p>
                  Actual progress recorded at{" "}
                  <b>
                    {
                      Number(
                        latestEvent.actualProgress
                      ) || 65
                    }%
                  </b>
                </p>

                <span>
                  Updated by{" "}
                  {
                    latestEvent.submittedBy ||
                    "Site Engineer"
                  }{" "}
                  ·{" "}
                  {formatDateTime(
                    latestEvent.submittedAt
                  )}
                </span>

              </div>

              <div className="pm-progress-latest-value">

                <span>
                  PROJECT ACTUAL
                </span>

                <strong>
                  67%
                </strong>

              </div>

            </div>

            <div className="pm-progress-note">

              <TrendingUp
                size={15}
              />

              <span>
                Field updates are reflected through the
                shared frontend project state.
              </span>

              <strong>
                Last sync {updatedAt}
              </strong>

            </div>

          </section>

        </div>
      </DashboardLayout>
    );
  };

/* =========================================================
   KPI
========================================================= */

const ProgressKpi = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}) => {
  return (
    <div
      className={`pm-progress-kpi pm-progress-kpi-${tone}`}
    >

      <div className="pm-progress-kpi-icon">
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
   PROGRESS BAR
========================================================= */

const ProgressBar = ({
  label,
  value,
  variant,
}) => {
  return (
    <div className="pm-progress-bar-item">

      <div className="pm-progress-bar-label">

        <span>
          {label}
        </span>

        <strong>
          {value}%
        </strong>

      </div>

      <div className="pm-overall-track">

        <div
          className={`pm-overall-fill ${variant}`}
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
};

export default ProjectManagerProgress;