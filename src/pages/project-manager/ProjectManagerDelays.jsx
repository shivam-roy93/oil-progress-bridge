import { useEffect, useMemo, useState } from "react";

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
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

import "./ProjectManagerDelays.css";

/* =========================================================
   STORAGE
========================================================= */

const FIELD_EVENTS_STORAGE_KEY =
  "progressBridgeFieldEvents";

const SCHEDULE_STORAGE_KEY =
  "progressBridgeScheduleImport";

/* =========================================================
   PROJECT DELAY SUMMARY
========================================================= */

const PROJECT_DELAY_SUMMARY = {
  delayedActivities: 23,
  criticalActivities: 7,
  averageVariance: -8,
  scheduleRisk: "Medium",
};

/* =========================================================
   BASE DELAYED ACTIVITIES
========================================================= */

const BASE_DELAYED_ACTIVITIES = [
  {
    id: "L6-CIV-021",
    name: "Foundation Work",
    discipline: "Civil",
    wbs: "Civil > Foundation",
    planned: 80,
    actual: 65,
    variance: -15,
    daysBehind: 5,
    severity: "Critical",
    status: "Delayed",
    plannedStart: "10 Sep 2026",
    plannedFinish: "25 Sep 2026",
    location: "Km 12+000 - Km 12+500",
    description:
      "RCC foundation completed up to column area.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 3,
  },

  {
    id: "L6-PIP-024",
    name: "Pipe Installation",
    discipline: "Piping",
    wbs: "Piping > Main Pipe",
    planned: 50,
    actual: 42,
    variance: -8,
    daysBehind: 3,
    severity: "High",
    status: "Delayed",
    plannedStart: "15 Sep 2026",
    plannedFinish: "05 Oct 2026",
    location: "Unit-02 / Pipe Rack",
    description:
      "Pipe installation is progressing below the current planned schedule.",
    updatedBy: "Ramesh Kumar",
    updatedOn: "26 Sep 2026",
    evidenceCount: 2,
  },

  {
    id: "L6-ELE-017",
    name: "Cable Installation",
    discipline: "Electrical",
    wbs: "Electrical > Cable",
    planned: 40,
    actual: 35,
    variance: -5,
    daysBehind: 2,
    severity: "Medium",
    status: "Warning",
    plannedStart: "20 Sep 2026",
    plannedFinish: "10 Oct 2026",
    location: "Substation-A",
    description:
      "Cable laying continued in the substation area.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 1,
  },

  {
    id: "L6-MEC-008",
    name: "Equipment Installation",
    discipline: "Mechanical",
    wbs: "Mechanical > Equipment",
    planned: 70,
    actual: 64,
    variance: -6,
    daysBehind: 2,
    severity: "Medium",
    status: "Warning",
    plannedStart: "18 Sep 2026",
    plannedFinish: "20 Oct 2026",
    location: "Equipment Yard",
    description:
      "Equipment installation continues with available resources.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 2,
  },

  {
    id: "L6-INS-012",
    name: "Instrument Installation",
    discipline: "Instrumentation",
    wbs: "Instrumentation",
    planned: 68,
    actual: 61,
    variance: -7,
    daysBehind: 3,
    severity: "High",
    status: "Delayed",
    plannedStart: "23 Sep 2026",
    plannedFinish: "04 Oct 2026",
    location: "Control Area",
    description:
      "Instrument mounting and installation are progressing below plan.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 1,
  },

  {
    id: "L6-PIP-025",
    name: "Spool Erection",
    discipline: "Piping",
    wbs: "Piping > Fabrication",
    planned: 50,
    actual: 42,
    variance: -8,
    daysBehind: 3,
    severity: "High",
    status: "Delayed",
    plannedStart: "20 Sep 2026",
    plannedFinish: "04 Oct 2026",
    location: "Pipe Fabrication Yard",
    description:
      "Spool preparation and erection are progressing below the planned rate.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 1,
  },

  {
    id: "L6-CIV-022",
    name: "Earthwork Excavation",
    discipline: "Civil",
    wbs: "Civil > Earthwork",
    planned: 70,
    actual: 62,
    variance: -8,
    daysBehind: 3,
    severity: "High",
    status: "Delayed",
    plannedStart: "12 Sep 2026",
    plannedFinish: "29 Sep 2026",
    location: "Km 12+000 - Km 12+500",
    description:
      "Excavation continues across the eastern section.",
    updatedBy: "Site Engineer",
    updatedOn: "26 Sep 2026",
    evidenceCount: 2,
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

const calculateVariance = (
  planned,
  actual
) => {
  return (
    safeNumber(actual) -
    safeNumber(planned)
  );
};

const getStatus = (
  variance
) => {
  if (variance <= -7) {
    return "Delayed";
  }

  if (variance < 0) {
    return "Warning";
  }

  return "On Track";
};

const getSeverity = (
  variance
) => {
  if (variance <= -11) {
    return "Critical";
  }

  if (variance <= -7) {
    return "High";
  }

  if (variance < 0) {
    return "Medium";
  }

  return "Low";
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
    return value;
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

/* =========================================================
   PAGE
========================================================= */

const ProjectManagerDelays =
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

    const [
      searchTerm,
      setSearchTerm,
    ] = useState("");

    const [
      selectedActivity,
      setSelectedActivity,
    ] = useState(null);

    /* =======================================================
       LOAD
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
       MERGE FIELD EVENT DATA
    ======================================================= */

    const delayedActivities =
      useMemo(() => {
        return BASE_DELAYED_ACTIVITIES.map(
          (activity) => {
            const matchingEvents =
              fieldEvents
                .filter(
                  (event) =>
                    event &&
                    event.activityId ===
                      activity.id
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

            const latest =
              matchingEvents[0];

            if (!latest) {
              return activity;
            }

            const actual =
              safeNumber(
                latest.actualProgress,
                activity.actual
              );

            const variance =
              calculateVariance(
                activity.planned,
                actual
              );

            return {
              ...activity,

              actual,

              variance,

              status:
                getStatus(
                  variance
                ),

              severity:
                getSeverity(
                  variance
                ),

              description:
                latest.progressNotes ||
                latest.fieldDescription ||
                latest.remarks ||
                activity.description,

              updatedBy:
                latest.submittedBy ||
                activity.updatedBy,

              updatedOn:
                latest.submittedAt
                  ? formatDate(
                      latest.submittedAt
                    )
                  : activity.updatedOn,

              evidenceCount:
                Array.isArray(
                  latest.evidence
                )
                  ? latest.evidence
                      .length
                  : activity.evidenceCount,
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
          return delayedActivities;
        }

        return delayedActivities.filter(
          (activity) => {
            const searchable = [
              activity.id,
              activity.name,
              activity.discipline,
              activity.wbs,
              activity.location,
              activity.status,
              activity.severity,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );
      }, [
        delayedActivities,
        searchTerm,
      ]);

    /* =======================================================
       CRITICAL ACTIVITIES
    ======================================================= */

    const criticalActivities =
      useMemo(() => {
        return delayedActivities
          .filter(
            (activity) =>
              activity.severity ===
                "Critical" ||
              activity.severity ===
                "High"
          )
          .sort(
            (a, b) =>
              a.variance -
              b.variance
          )
          .slice(0, 4);
      }, [delayedActivities]);

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

    /* =======================================================
       VIEW DETAILS
    ======================================================= */

    const handleViewDetails =
      (activity) => {
        setSelectedActivity(
          activity
        );
      };

    return (
      <DashboardLayout
        title="Delay Monitor"
      >
        <div className="pm-delays-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="pm-delays-header">

            <div>

              <button
                type="button"
                className="pm-delays-back"
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

              <span className="pm-delays-eyebrow">
                PROJECT MANAGEMENT
              </span>

              <h2>
                Delay Monitor
              </h2>

              <p>
                Monitor delayed activities, schedule
                variance and critical execution risks.
              </p>

            </div>

            <div className="pm-delays-actions">

              <button
                type="button"
                className="pm-delays-secondary"
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
                      ? "pm-delay-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <button
                type="button"
                className="pm-delays-secondary"
                onClick={() =>
                  navigate(
                    "/pm/schedule"
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
              KPI
          ================================================= */}

          <section className="pm-delay-kpi-grid">

            <DelayKpi
              icon={
                Clock3
              }
              label="Delayed Activities"
              value={
                PROJECT_DELAY_SUMMARY.delayedActivities
              }
              helper="Activities requiring attention"
              tone="warning"
            />

            <DelayKpi
              icon={
                AlertTriangle
              }
              label="Critical Activities"
              value={
                PROJECT_DELAY_SUMMARY.criticalActivities
              }
              helper="High-priority delays"
              tone="critical"
            />

            <DelayKpi
              icon={
                BarChart3
              }
              label="Average Variance"
              value={`${PROJECT_DELAY_SUMMARY.averageVariance}%`}
              helper="Average schedule variance"
              tone="negative"
            />

            <DelayKpi
              icon={
                AlertTriangle
              }
              label="Schedule Risk"
              value={
                PROJECT_DELAY_SUMMARY.scheduleRisk
              }
              helper="Current project risk"
              tone="medium"
            />

          </section>

          {/* =================================================
              PROJECT CONTEXT
          ================================================= */}

          <section className="pm-delay-context">

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

            <div>

              <span>
                OVERALL PROGRESS
              </span>

              <strong>
                67%
              </strong>

            </div>

            <div>

              <span>
                PLANNED PROGRESS
              </span>

              <strong>
                72%
              </strong>

            </div>

            <div>

              <span>
                PROJECT VARIANCE
              </span>

              <strong className="pm-delay-negative">
                -5%
              </strong>

            </div>

          </section>

          {/* =================================================
              DELAYED TABLE
          ================================================= */}

          <section className="pm-delay-table-card">

            <div className="pm-delay-card-header">

              <div>

                <span>
                  DELAYED ACTIVITIES
                </span>

                <h3>
                  Activities Requiring Attention
                </h3>

                <p>
                  Current activities behind the planned
                  schedule.
                </p>

              </div>

              <span className="pm-delay-total-badge">
                {
                  PROJECT_DELAY_SUMMARY.delayedActivities
                }{" "}
                delayed
              </span>

            </div>

            {/* SEARCH */}

            <div className="pm-delay-search-row">

              <div className="pm-delay-search">

                <SearchIcon />

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
                activities shown
              </span>

            </div>

            {filteredActivities.length ===
            0 ? (
              <div className="pm-delay-empty">

                <CheckCircle2
                  size={32}
                />

                <h3>
                  No matching delayed activities
                </h3>

                <p>
                  Try another search term.
                </p>

              </div>
            ) : (
              <div className="pm-delay-table-scroll">

                <table className="pm-delay-table">

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
                        Severity
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

                            <div className="pm-delay-activity">

                              <strong>
                                {
                                  activity.name
                                }
                              </strong>

                              <span>
                                {
                                  activity.id
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
                              activity.planned
                            }%
                          </td>

                          <td>
                            {
                              activity.actual
                            }%
                          </td>

                          <td>

                            <strong className="pm-delay-variance">
                              {activity.variance >
                              0
                                ? "+"
                                : ""}
                              {
                                activity.variance
                              }%
                            </strong>

                          </td>

                          <td>

                            <strong className="pm-days-behind">
                              {
                                activity.daysBehind
                              }{" "}
                              days
                            </strong>

                          </td>

                          <td>

                            <span
                              className={`pm-delay-severity ${activity.severity.toLowerCase()}`}
                            >
                              {
                                activity.severity
                              }
                            </span>

                          </td>

                          <td>

                            <span
                              className={`pm-delay-status ${activity.status
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )}`}
                            >
                              {
                                activity.status
                              }
                            </span>

                          </td>

                          <td>

                            <button
                              type="button"
                              className="pm-delay-view-button"
                              onClick={() =>
                                handleViewDetails(
                                  activity
                                )
                              }
                            >
                              View Details

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
              CRITICAL DELAYS
          ================================================= */}

          <section className="pm-critical-delays-card">

            <div className="pm-delay-card-header">

              <div>

                <span>
                  CRITICAL DELAYS
                </span>

                <h3>
                  Priority Activities
                </h3>

                <p>
                  Major delayed activities requiring close
                  management attention.
                </p>

              </div>

              <div className="pm-critical-count">

                <AlertTriangle
                  size={14}
                />

                {
                  PROJECT_DELAY_SUMMARY.criticalActivities
                }{" "}
                critical

              </div>

            </div>

            <div className="pm-critical-grid">

              {criticalActivities.map(
                (activity) => (
                  <div
                    className="pm-critical-card"
                    key={
                      activity.id
                    }
                  >

                    <div className="pm-critical-top">

                      <div className="pm-critical-icon">
                        <AlertTriangle
                          size={17}
                        />
                      </div>

                      <span
                        className={`pm-delay-severity ${activity.severity.toLowerCase()}`}
                      >
                        {
                          activity.severity
                        }
                      </span>

                    </div>

                    <span className="pm-critical-id">
                      {
                        activity.id
                      }
                    </span>

                    <h4>
                      {
                        activity.name
                      }
                    </h4>

                    <div className="pm-critical-stats">

                      <div>

                        <span>
                          VARIANCE
                        </span>

                        <strong>
                          {
                            activity.variance
                          }%
                        </strong>

                      </div>

                      <div>

                        <span>
                          DAYS BEHIND
                        </span>

                        <strong>
                          {
                            activity.daysBehind
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          STATUS
                        </span>

                        <strong>
                          {
                            activity.status
                          }
                        </strong>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="pm-critical-view"
                      onClick={() =>
                        handleViewDetails(
                          activity
                        )
                      }
                    >
                      View Details

                      <ArrowRight
                        size={13}
                      />
                    </button>

                  </div>
                )
              )}

            </div>

          </section>

          {/* =================================================
              FOOTER NOTE
          ================================================= */}

          <section className="pm-delay-footer-note">

            <CheckCircle2
              size={15}
            />

            <span>
              Delay information is based on the current
              project schedule and latest available field
              updates.
            </span>

          </section>

        </div>

        {/* =====================================================
            ACTIVITY DETAILS MODAL
        ===================================================== */}

        {selectedActivity && (
          <div
            className="pm-delay-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedActivity(
                  null
                );
              }
            }}
          >

            <div className="pm-delay-modal">

              {/* HEADER */}

              <div className="pm-delay-modal-header">

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
                      selectedActivity.id
                    }{" "}
                    ·{" "}
                    {
                      selectedActivity.discipline
                    }
                  </p>

                </div>

                <button
                  type="button"
                  className="pm-delay-modal-close"
                  onClick={() =>
                    setSelectedActivity(
                      null
                    )
                  }
                >
                  <X
                    size={18}
                  />
                </button>

              </div>

              <div className="pm-delay-modal-body">

                {/* ACTIVITY INFORMATION */}

                <section className="pm-modal-section">

                  <div className="pm-modal-heading">

                    <FileText
                      size={16}
                    />

                    <h3>
                      Activity Information
                    </h3>

                  </div>

                  <div className="pm-modal-grid">

                    <ModalInfo
                      label="Activity ID"
                      value={
                        selectedActivity.id
                      }
                    />

                    <ModalInfo
                      label="Activity Name"
                      value={
                        selectedActivity.name
                      }
                    />

                    <ModalInfo
                      label="Discipline"
                      value={
                        selectedActivity.discipline
                      }
                    />

                    <ModalInfo
                      label="WBS"
                      value={
                        selectedActivity.wbs
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

                </section>

                {/* DELAY METRICS */}

                <section className="pm-modal-section">

                  <div className="pm-modal-heading">

                    <BarChart3
                      size={16}
                    />

                    <h3>
                      Delay Metrics
                    </h3>

                  </div>

                  <div className="pm-modal-metrics">

                    <div>

                      <span>
                        PLANNED
                      </span>

                      <strong>
                        {
                          selectedActivity.planned
                        }%
                      </strong>

                    </div>

                    <div>

                      <span>
                        ACTUAL
                      </span>

                      <strong>
                        {
                          selectedActivity.actual
                        }%
                      </strong>

                    </div>

                    <div>

                      <span>
                        VARIANCE
                      </span>

                      <strong className="pm-modal-negative">
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

                  <div className="pm-modal-progress">

                    <div
                      className="pm-modal-planned"
                      style={{
                        width: `${selectedActivity.planned}%`,
                      }}
                    />

                    <div
                      className="pm-modal-actual"
                      style={{
                        width: `${selectedActivity.actual}%`,
                      }}
                    />

                  </div>

                </section>

                {/* SCHEDULE DATES */}

                <section className="pm-modal-section">

                  <div className="pm-modal-heading">

                    <CalendarDays
                      size={16}
                    />

                    <h3>
                      Schedule Dates
                    </h3>

                  </div>

                  <div className="pm-modal-grid">

                    <ModalInfo
                      label="Planned Start"
                      value={
                        selectedActivity.plannedStart
                      }
                    />

                    <ModalInfo
                      label="Planned Finish"
                      value={
                        selectedActivity.plannedFinish
                      }
                    />

                  </div>

                </section>

                {/* FIELD UPDATE */}

                <section className="pm-modal-section">

                  <div className="pm-modal-heading">

                    <CheckCircle2
                      size={16}
                    />

                    <h3>
                      Latest Field Update
                    </h3>

                  </div>

                  <div className="pm-modal-update">

                    <p>
                      {
                        selectedActivity.description
                      }
                    </p>

                    <div>

                      <span>
                        Updated by{" "}
                        <strong>
                          {
                            selectedActivity.updatedBy
                          }
                        </strong>
                      </span>

                      <span>
                        {
                          selectedActivity.updatedOn
                        }
                      </span>

                    </div>

                  </div>

                </section>

                {/* EVIDENCE / SEVERITY */}

                <section className="pm-modal-section">

                  <div className="pm-modal-heading">

                    <FileText
                      size={16}
                    />

                    <h3>
                      Evidence & Severity
                    </h3>

                  </div>

                  <div className="pm-modal-grid">

                    <ModalInfo
                      label="Evidence"
                      value={`${selectedActivity.evidenceCount} photos`}
                    />

                    <ModalInfo
                      label="Severity"
                      value={
                        selectedActivity.severity
                      }
                    />

                  </div>

                </section>

              </div>

              <div className="pm-delay-modal-footer">

                <button
                  type="button"
                  className="pm-delays-secondary"
                  onClick={() =>
                    setSelectedActivity(
                      null
                    )
                  }
                >
                  Close
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
      className={`pm-delay-kpi pm-delay-kpi-${tone}`}
    >

      <div className="pm-delay-kpi-icon">
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
   SEARCH ICON
========================================================= */

const SearchIcon = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <line
        x1="16.5"
        y1="16.5"
        x2="21"
        y2="21"
      />
    </svg>
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
    <div className="pm-modal-info">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
};

export default ProjectManagerDelays;