import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Upload,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { activities as mockActivities } from "../../data/mockData.js";

import "./PlanningEngineerDashboard.css";

const SCHEDULE_STORAGE_KEY =
  "progressBridgeScheduleImport";

const FIELD_EVENTS_STORAGE_KEY =
  "progressBridgeFieldEvents";

const PLANNER_REVIEW_STORAGE_KEY =
  "progressBridgePlannerReviews";

const DEFAULT_SCHEDULE = {
  projectName: "Refinery Expansion Project",
  source: "Primavera P6",
  lastImported: "25 Sep 2026",
  activities: 4862,
  wbs: 127,
  milestones: 84,
  relationships: 6742,
  plannedProgress: 72,
  actualProgress: 67,
  variance: -5,
};

/* =========================================================
   HELPERS
========================================================= */

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const formatTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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

const getFieldEvents = () => {
  const events = readStorage(
    FIELD_EVENTS_STORAGE_KEY,
    []
  );

  return Array.isArray(events)
    ? events
    : [];
};

const getPlannerReviews = () => {
  const reviews = readStorage(
    PLANNER_REVIEW_STORAGE_KEY,
    []
  );

  return Array.isArray(reviews)
    ? reviews
    : [];
};

/* =========================================================
   PAGE
========================================================= */

const PlanningEngineerDashboard = () => {
  const navigate = useNavigate();

  const [schedule, setSchedule] =
    useState(DEFAULT_SCHEDULE);

  const [fieldEvents, setFieldEvents] =
    useState([]);

  const [plannerReviews, setPlannerReviews] =
    useState([]);

  const [refreshing, setRefreshing] =
    useState(false);

  /* -------------------------------------------------------
     LOAD SHARED DATA
  ------------------------------------------------------- */

  const loadDashboardData = () => {
    const savedSchedule = readStorage(
      SCHEDULE_STORAGE_KEY,
      null
    );

    const savedEvents =
      getFieldEvents();

    const savedReviews =
      getPlannerReviews();

    if (savedSchedule) {
      setSchedule({
        ...DEFAULT_SCHEDULE,
        ...savedSchedule,
      });
    } else {
      setSchedule(DEFAULT_SCHEDULE);
    }

    setFieldEvents(savedEvents);
    setPlannerReviews(savedReviews);
  };

  useEffect(() => {
    loadDashboardData();

    const handleStorage = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  /* -------------------------------------------------------
     REFRESH
  ------------------------------------------------------- */

  const refreshDashboard = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      loadDashboardData();
      setRefreshing(false);
    }, 500);
  };

  /* -------------------------------------------------------
     FIELD UPDATES
  ------------------------------------------------------- */

  const recentFieldUpdates = useMemo(() => {
    if (fieldEvents.length === 0) {
      return [
        {
          id: "demo-1",
          activityName: "Foundation Work",
          actualProgress: 65,
          submittedAt: "2026-09-26T10:15:00+05:30",
          submittedBy: "Site Engineer",
          evidenceCount: 3,
        },
        {
          id: "demo-2",
          activityName: "Pipe Installation",
          actualProgress: 42,
          submittedAt: "2026-09-26T09:40:00+05:30",
          submittedBy: "Site Engineer",
          evidenceCount: 2,
        },
        {
          id: "demo-3",
          activityName: "Cable Installation",
          actualProgress: 35,
          submittedAt: "2026-09-26T08:55:00+05:30",
          submittedBy: "Site Engineer",
          evidenceCount: 1,
        },
      ];
    }

    return [...fieldEvents]
      .sort(
        (a, b) =>
          new Date(
            b.submittedAt || 0
          ) -
          new Date(
            a.submittedAt || 0
          )
      )
      .slice(0, 3)
      .map((event) => ({
        ...event,
        activityName:
          event.activityName ||
          event.activityId ||
          "Field Update",
        actualProgress:
          Number(
            event.actualProgress
          ) || 0,
        evidenceCount:
          Number(
            event.evidenceCount
          ) ||
          (Array.isArray(
            event.evidence
          )
            ? event.evidence.length
            : 0),
      }));
  }, [fieldEvents]);

  /* -------------------------------------------------------
     PENDING MATCHES
  ------------------------------------------------------- */

  const pendingReviewCount =
    plannerReviews.filter(
      (review) =>
        review.matchStatus ===
          "PENDING_REVIEW" &&
        !review.plannerDecision
    ).length;

  /* -------------------------------------------------------
     ACTIVITY ATTENTION
  ------------------------------------------------------- */

  const attentionActivities =
    useMemo(() => {
      const source =
        Array.isArray(
          mockActivities
        )
          ? mockActivities
          : [];

      return source
        .filter((activity) => {
          const planned =
            Number(
              activity.plannedProgress
            ) || 0;

          const actual =
            Number(
              activity.actualProgress
            ) || 0;

          return (
            actual < planned ||
            String(
              activity.status || ""
            ).toLowerCase() ===
              "delayed"
          );
        })
        .slice(0, 4);
    }, []);

  return (
    <DashboardLayout title="Planning Dashboard">
      <div className="planning-dashboard-page">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="planning-page-header">

          <div>

            <span className="planning-eyebrow">
              PLANNING & CONTROL
            </span>

            <h2>
              Planning Dashboard
            </h2>

            <p>
              Monitor schedule status, field updates,
              and activities requiring planning attention.
            </p>

          </div>

          <div className="planning-header-actions">

            <button
              type="button"
              className="planning-secondary-button"
              onClick={
                refreshDashboard
              }
              disabled={
                refreshing
              }
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "spinning"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="planning-primary-button"
              onClick={() =>
                navigate(
                  "/planning/import"
                )
              }
            >
              <Upload size={16} />
              Import Schedule
            </button>

          </div>

        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="planning-kpi-grid">

          <PlanningKpi
            icon={FileSpreadsheet}
            label="Total Activities"
            value={schedule.activities.toLocaleString()}
            helper="Schedule activities"
            tone="blue"
          />

          <PlanningKpi
            icon={CheckCircle2}
            label="Updated Activities"
            value={schedule.activities
              ? "4,521"
              : "0"}
            helper="Updated from field"
            tone="green"
          />

          <PlanningKpi
            icon={AlertTriangle}
            label="Delayed Activities"
            value="341"
            helper="Require attention"
            tone="amber"
          />

          <PlanningKpi
            icon={Zap}
            label="Critical Activities"
            value="23"
            helper="High priority"
            tone="red"
          />

        </section>

        {/* =================================================
            SCHEDULE STATUS
        ================================================= */}

        <section className="planning-section-grid">

          <div className="planning-card schedule-status-card">

            <div className="planning-card-header">

              <div>

                <span>
                  SCHEDULE STATUS
                </span>

                <h3>
                  Planned vs Actual
                </h3>

              </div>

              <div className="schedule-source-badge">
                <FileSpreadsheet
                  size={15}
                />

                {schedule.source}
              </div>

            </div>

            <div className="schedule-progress-block">

              <div className="planning-progress-row">

                <div className="planning-progress-label">
                  <span>
                    Planned Progress
                  </span>

                  <strong>
                    {schedule.plannedProgress}%
                  </strong>
                </div>

                <div className="planning-progress-track">
                  <div
                    className="planning-progress-fill planned"
                    style={{
                      width: `${schedule.plannedProgress}%`,
                    }}
                  />
                </div>

              </div>

              <div className="planning-progress-row">

                <div className="planning-progress-label">
                  <span>
                    Actual Progress
                  </span>

                  <strong>
                    {schedule.actualProgress}%
                  </strong>
                </div>

                <div className="planning-progress-track">
                  <div
                    className="planning-progress-fill actual"
                    style={{
                      width: `${schedule.actualProgress}%`,
                    }}
                  />
                </div>

              </div>

              <div className="schedule-variance-box">

                <div>
                  <span>
                    VARIANCE
                  </span>

                  <strong>
                    {schedule.variance > 0
                      ? "+"
                      : ""}
                    {schedule.variance}%
                  </strong>
                </div>

                <p>
                  Actual progress compared with the
                  current planned schedule.
                </p>

              </div>

            </div>

            <div className="schedule-metrics">

              <div>
                <span>
                  ACTIVITIES
                </span>

                <strong>
                  {schedule.activities.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>
                  WBS
                </span>

                <strong>
                  {schedule.wbs}
                </strong>
              </div>

              <div>
                <span>
                  MILESTONES
                </span>

                <strong>
                  {schedule.milestones}
                </strong>
              </div>

              <div>
                <span>
                  RELATIONSHIPS
                </span>

                <strong>
                  {schedule.relationships.toLocaleString()}
                </strong>
              </div>

            </div>

          </div>

          {/* =================================================
              LAST IMPORT
          ================================================= */}

          <div className="planning-card last-import-card">

            <div className="planning-card-header">

              <div>

                <span>
                  LAST SCHEDULE IMPORT
                </span>

                <h3>
                  Import Information
                </h3>

              </div>

              <CalendarDays
                size={19}
              />

            </div>

            <div className="last-import-project">

              <div className="last-import-icon">
                <FileSpreadsheet
                  size={21}
                />
              </div>

              <div>

                <span>
                  PROJECT
                </span>

                <strong>
                  {schedule.projectName}
                </strong>

              </div>

            </div>

            <div className="import-info-grid">

              <div>
                <span>
                  SOURCE
                </span>

                <strong>
                  {schedule.source}
                </strong>
              </div>

              <div>
                <span>
                  LAST IMPORTED
                </span>

                <strong>
                  {schedule.lastImported}
                </strong>
              </div>

              <div>
                <span>
                  FILE STATUS
                </span>

                <strong className="status-online">
                  <CheckCircle2
                    size={14}
                  />
                  Validated
                </strong>
              </div>

              <div>
                <span>
                  REVIEW QUEUE
                </span>

                <strong
                  className={
                    pendingReviewCount >
                    0
                      ? "status-warning"
                      : "status-online"
                  }
                >
                  {pendingReviewCount}
                  {" "}
                  pending
                </strong>
              </div>

            </div>

            <button
              type="button"
              className="planning-text-button"
              onClick={() =>
                navigate(
                  "/planning/import"
                )
              }
            >
              View Schedule Import
              <ArrowRight
                size={15}
              />
            </button>

          </div>

        </section>

        {/* =================================================
            RECENT FIELD UPDATES
        ================================================= */}

        <section className="planning-card">

          <div className="planning-card-header">

            <div>

              <span>
                RECENT FIELD UPDATES
              </span>

              <h3>
                Latest Site Execution
              </h3>

            </div>

            <button
              type="button"
              className="planning-text-button"
              onClick={() =>
                navigate(
                  "/planning/progress-delay"
                )
              }
            >
              View Analysis
              <ArrowRight
                size={15}
              />
            </button>

          </div>

          <div className="field-updates-list">

            {recentFieldUpdates.map(
              (update) => (
                <div
                  key={update.id}
                  className="field-update-row"
                >

                  <div className="field-update-icon">
                    <BarChart3
                      size={17}
                    />
                  </div>

                  <div className="field-update-main">

                    <strong>
                      {
                        update.activityName
                      }
                    </strong>

                    <span>
                      Updated by{" "}
                      {
                        update.submittedBy ||
                        update.updatedBy ||
                        "Site Supervisor"
                      }
                      {" "}
                      ·{" "}
                      {formatDate(
                        update.submittedAt
                      )}
                      {" "}
                      {formatTime(
                        update.submittedAt
                      )}
                    </span>

                  </div>

                  <div className="field-update-progress">

                    <div className="field-update-progress-top">

                      <span>
                        Actual Progress
                      </span>

                      <strong>
                        {
                          update.actualProgress
                        }%
                      </strong>

                    </div>

                    <div className="field-update-track">

                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              update.actualProgress
                            )
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="field-update-evidence">

                    <FileText
                      size={14}
                    />

                    {
                      update.evidenceCount
                    }{" "}
                    evidence

                  </div>

                </div>
              )
            )}

          </div>

        </section>

        {/* =================================================
            ATTENTION + REVIEW QUEUE
        ================================================= */}

        <section className="planning-bottom-grid">

          <div className="planning-card">

            <div className="planning-card-header">

              <div>

                <span>
                  ACTIVITIES REQUIRING ATTENTION
                </span>

                <h3>
                  Schedule Exceptions
                </h3>

              </div>

              <div className="attention-count">
                23
              </div>

            </div>

            {attentionActivities.length >
            0 ? (
              <div className="attention-list">

                {attentionActivities.map(
                  (activity) => {
                    const planned =
                      Number(
                        activity.plannedProgress
                      ) || 0;

                    const actual =
                      Number(
                        activity.actualProgress
                      ) || 0;

                    const variance =
                      actual -
                      planned;

                    return (
                      <div
                        className="attention-row"
                        key={
                          activity.id ||
                          activity.activityId
                        }
                      >

                        <div className="attention-status-dot" />

                        <div className="attention-main">

                          <strong>
                            {
                              activity.name
                            }
                          </strong>

                          <span>
                            {
                              activity.activityId ||
                              activity.id
                            }{" "}
                            ·{" "}
                            {
                              activity.discipline ||
                              "—"
                            }
                          </span>

                        </div>

                        <div className="attention-variance">

                          <span>
                            Variance
                          </span>

                          <strong>
                            {variance > 0
                              ? "+"
                              : ""}
                            {variance}%
                          </strong>

                        </div>

                        <span className="attention-status">
                          {variance <= -11
                            ? "Critical"
                            : variance <= -6
                            ? "High"
                            : "Warning"}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="planning-empty-state">
                <CheckCircle2
                  size={28}
                />

                <p>
                  No activities currently require
                  planning attention.
                </p>
              </div>
            )}

            <button
              type="button"
              className="planning-text-button"
              onClick={() =>
                navigate(
                  "/planning/progress-delay"
                )
              }
            >
              View Progress & Delay
              <ArrowRight
                size={15}
              />
            </button>

          </div>

          {/* REVIEW QUEUE */}

          <div className="planning-card review-queue-card">

            <div className="planning-card-header">

              <div>

                <span>
                  FIELD MATCH REVIEW
                </span>

                <h3>
                  Planner Review Queue
                </h3>

              </div>

              <ClipboardCheck
                size={19}
              />

            </div>

            <div className="review-queue-count">

              <strong>
                {pendingReviewCount}
              </strong>

              <div>

                <span>
                  Pending matches
                </span>

                <p>
                  Uncertain field activities waiting
                  for planning review.
                </p>

              </div>

            </div>

            <div className="review-queue-message">

              {pendingReviewCount > 0 ? (
                <>
                  <AlertTriangle
                    size={17}
                  />

                  <span>
                    Review candidate schedule activities
                    and confirm the correct mapping.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={17}
                  />

                  <span>
                    No pending field matches at the
                    moment.
                  </span>
                </>
              )}

            </div>

            <button
              type="button"
              className={
                pendingReviewCount > 0
                  ? "planning-primary-button full"
                  : "planning-secondary-button full"
              }
              onClick={() =>
                navigate(
                  "/planning/review"
                )
              }
            >
              Review Field Matches
              <ArrowRight
                size={15}
              />
            </button>

          </div>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="planning-quick-actions">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/planning/import"
              )
            }
          >
            <Upload size={18} />

            <div>
              <strong>
                Import Schedule
              </strong>

              <span>
                Upload and validate a schedule file
              </span>
            </div>

            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/planning/schedule"
              )
            }
          >
            <FileSpreadsheet
              size={18}
            />

            <div>
              <strong>
                Open Schedule
              </strong>

              <span>
                Browse planned and actual activities
              </span>
            </div>

            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/planning/progress-delay"
              )
            }
          >
            <BarChart3 size={18} />

            <div>
              <strong>
                Progress & Delay
              </strong>

              <span>
                Analyze variance and delayed work
              </span>
            </div>

            <ArrowRight size={16} />
          </button>

        </section>

      </div>
    </DashboardLayout>
  );
};

/* =========================================================
   KPI CARD
========================================================= */

const PlanningKpi = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}) => {
  return (
    <div
      className={`planning-kpi-card planning-kpi-${tone}`}
    >
      <div className="planning-kpi-icon">
        <Icon size={20} />
      </div>

      <div className="planning-kpi-content">

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

export default PlanningEngineerDashboard;