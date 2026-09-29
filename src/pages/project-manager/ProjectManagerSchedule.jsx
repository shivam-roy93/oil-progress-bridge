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

import "./ProjectManagerSchedule.css";

/* =========================================================
   STORAGE
========================================================= */

const SCHEDULE_STORAGE_KEY =
  "progressBridgeScheduleImport";

const FIELD_EVENTS_STORAGE_KEY =
  "progressBridgeFieldEvents";

/* =========================================================
   DEFAULT SCHEDULE INFO
========================================================= */

const DEFAULT_SCHEDULE_INFO = {
  projectName: "Refinery Expansion Project",
  source: "Primavera P6",
  lastImported: "25 Sep 2026",
  activities: 4862,
  wbs: 127,
  milestones: 84,
  relationships: 6742,
};

/* =========================================================
   ACTIVITY DATA
========================================================= */

const BASE_ACTIVITIES = [
  {
    id: "L6-CIV-021",
    name: "Foundation Work",
    discipline: "Civil",
    wbs: "Civil > Foundation",
    plannedStart: "2026-09-10",
    plannedFinish: "2026-09-25",
    plannedProgress: 80,
    actualProgress: 65,
    status: "Delayed",
  },
  {
    id: "L6-CIV-022",
    name: "Earthwork Excavation",
    discipline: "Civil",
    wbs: "Civil > Earthwork",
    plannedStart: "2026-09-12",
    plannedFinish: "2026-09-29",
    plannedProgress: 70,
    actualProgress: 62,
    status: "Warning",
  },
  {
    id: "L6-CIV-023",
    name: "Drainage Work",
    discipline: "Civil",
    wbs: "Civil > Drainage",
    plannedStart: "2026-09-14",
    plannedFinish: "2026-09-30",
    plannedProgress: 75,
    actualProgress: 74,
    status: "In Progress",
  },
  {
    id: "L6-PIP-024",
    name: "Erect Line 24-XX",
    discipline: "Piping",
    wbs: "Piping > Erection",
    plannedStart: "2026-09-18",
    plannedFinish: "2026-10-01",
    plannedProgress: 45,
    actualProgress: 74,
    status: "In Progress",
  },
  {
    id: "L6-PIP-025",
    name: "Spool Erection",
    discipline: "Piping",
    wbs: "Piping > Fabrication",
    plannedStart: "2026-09-20",
    plannedFinish: "2026-10-04",
    plannedProgress: 50,
    actualProgress: 42,
    status: "Warning",
  },
  {
    id: "L6-ELE-017",
    name: "Cable Laying",
    discipline: "Electrical",
    wbs: "Electrical > Cable",
    plannedStart: "2026-09-21",
    plannedFinish: "2026-10-02",
    plannedProgress: 40,
    actualProgress: 35,
    status: "Warning",
  },
  {
    id: "L6-INS-012",
    name: "Instrument Installation",
    discipline: "Instrumentation",
    wbs: "Instrumentation",
    plannedStart: "2026-09-23",
    plannedFinish: "2026-10-04",
    plannedProgress: 38,
    actualProgress: 31,
    status: "Warning",
  },
  {
    id: "L6-MEC-008",
    name: "Equipment Installation",
    discipline: "Mechanical",
    wbs: "Mechanical > Installation",
    plannedStart: "2026-09-25",
    plannedFinish: "2026-10-03",
    plannedProgress: 70,
    actualProgress: 64,
    status: "Warning",
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

const getStatus = (
  planned,
  actual
) => {
  const variance =
    getVariance(
      planned,
      actual
    );

  if (
    safeNumber(actual) >=
    100
  ) {
    return "Completed";
  }

  if (
    variance <= -10
  ) {
    return "Delayed";
  }

  if (
    variance < 0
  ) {
    return "Warning";
  }

  return "In Progress";
};

const getDayDate = (
  value
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    getDayDate(value);

  if (!date) {
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

/* =========================================================
   PAGE
========================================================= */

const ProjectManagerSchedule =
  () => {
    const navigate =
      useNavigate();

    const [
      scheduleInfo,
      setScheduleInfo,
    ] = useState(
      DEFAULT_SCHEDULE_INFO
    );

    const [
      fieldEvents,
      setFieldEvents,
    ] = useState([]);

    const [
      searchTerm,
      setSearchTerm,
    ] = useState("");

    const [
      statusFilter,
      setStatusFilter,
    ] = useState("All");

    const [
      wbsFilter,
      setWbsFilter,
    ] = useState("All");

    const [
      showGantt,
      setShowGantt,
    ] = useState(true);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    /* =======================================================
       LOAD DATA
    ======================================================= */

    const loadData = () => {
      const imported =
        readStorage(
          SCHEDULE_STORAGE_KEY,
          null
        );

      const events =
        readStorage(
          FIELD_EVENTS_STORAGE_KEY,
          []
        );

      setScheduleInfo({
        ...DEFAULT_SCHEDULE_INFO,
        ...(imported || {}),
      });

      setFieldEvents(
        Array.isArray(events)
          ? events
          : []
      );
    };

    useEffect(() => {
      loadData();
    }, []);

    /* =======================================================
       MERGE FIELD EVENTS
    ======================================================= */

    const activities =
      useMemo(() => {
        return BASE_ACTIVITIES.map(
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
                activity.actualProgress
              );

            return {
              ...activity,

              actualProgress:
                actual,

              status:
                getStatus(
                  activity.plannedProgress,
                  actual
                ),
            };
          }
        );
      }, [fieldEvents]);

    /* =======================================================
       WBS OPTIONS
    ======================================================= */

    const wbsOptions =
      useMemo(() => {
        return [
          "All",
          ...new Set(
            activities
              .map(
                (item) =>
                  item.wbs
              )
              .filter(Boolean)
          ),
        ];
      }, [activities]);

    /* =======================================================
       FILTERED
    ======================================================= */

    const filteredActivities =
      useMemo(() => {
        const query =
          searchTerm
            .trim()
            .toLowerCase();

        return activities.filter(
          (activity) => {
            const status =
              getStatus(
                activity.plannedProgress,
                activity.actualProgress
              );

            const text = [
              activity.id,
              activity.name,
              activity.discipline,
              activity.wbs,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            const matchesSearch =
              !query ||
              text.includes(
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
       GANTT RANGE
    ======================================================= */

    const ganttRange =
      useMemo(() => {
        const dates =
          activities.flatMap(
            (activity) => [
              getDayDate(
                activity.plannedStart
              ),
              getDayDate(
                activity.plannedFinish
              ),
            ]
          );

        const valid =
          dates.filter(Boolean);

        if (
          valid.length ===
          0
        ) {
          return {
            start: new Date(
              "2026-09-08"
            ),
            end: new Date(
              "2026-10-06"
            ),
          };
        }

        const start =
          new Date(
            Math.min(
              ...valid.map(
                (date) =>
                  date.getTime()
              )
            )
          );

        const end =
          new Date(
            Math.max(
              ...valid.map(
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

    const ganttDays =
      Math.max(
        1,
        Math.round(
          (ganttRange.end -
            ganttRange.start) /
            86400000
        ) + 1
      );

    const dateLabels =
      useMemo(() => {
        return Array.from(
          {
            length:
              ganttDays,
          },
          (_, index) => {
            const date =
              new Date(
                ganttRange.start
              );

            date.setDate(
              date.getDate() +
                index
            );

            return date;
          }
        );
      }, [
        ganttRange,
        ganttDays,
      ]);

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
        title="Project Schedule"
      >
        <div className="pm-schedule-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="pm-schedule-header">

            <div>

              <button
                type="button"
                className="pm-schedule-back"
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

              <span className="pm-schedule-eyebrow">
                PROJECT MANAGEMENT
              </span>

              <h2>
                Project Schedule
              </h2>

              <p>
                Review the current project schedule and
                compare planned activity windows with field
                progress.
              </p>

            </div>

            <div className="pm-schedule-actions">

              <button
                type="button"
                className="pm-schedule-secondary"
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
                      ? "pm-schedule-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

            </div>

          </div>

          {/* =================================================
              SCHEDULE SOURCE
          ================================================= */}

          <section className="pm-schedule-source-card">

            <div className="pm-source-icon">
              <FileSpreadsheet
                size={21}
              />
            </div>

            <div className="pm-source-main">

              <span>
                SCHEDULE SOURCE
              </span>

              <h3>
                Primavera P6
              </h3>

              <p>
                Current imported project baseline.
              </p>

            </div>

            <div className="pm-source-meta">

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
                  PROJECT
                </span>

                <strong>
                  {
                    scheduleInfo.projectName ||
                    "Refinery Expansion Project"
                  }
                </strong>

              </div>

            </div>

          </section>

          {/* =================================================
              KPI
          ================================================= */}

          <section className="pm-schedule-kpi-grid">

            <ScheduleKpi
              icon={
                FileSpreadsheet
              }
              label="Activities"
              value={safeNumber(
                scheduleInfo.activities,
                4862
              ).toLocaleString()}
              helper="Schedule activities"
            />

            <ScheduleKpi
              icon={
                BarChart3
              }
              label="WBS"
              value={
                scheduleInfo.wbs ||
                127
              }
              helper="Work breakdown structures"
            />

            <ScheduleKpi
              icon={
                CheckCircle2
              }
              label="Milestones"
              value={
                scheduleInfo.milestones ||
                84
              }
              helper="Project milestones"
            />

            <ScheduleKpi
              icon={
                RefreshCw
              }
              label="Relationships"
              value={safeNumber(
                scheduleInfo.relationships,
                6742
              ).toLocaleString()}
              helper="Activity relationships"
            />

          </section>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="pm-schedule-filter-bar">

            <div className="pm-schedule-search">

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
                >
                  <X
                    size={14}
                  />
                </button>
              )}

            </div>

            <div className="pm-schedule-select">

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

              </select>

            </div>

            <div className="pm-schedule-select">

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
              className={`pm-gantt-toggle ${
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
              ACTIVITY TABLE
          ================================================= */}

          <section className="pm-schedule-table-card">

            <div className="pm-schedule-card-header">

              <div>

                <span>
                  SCHEDULE REGISTER
                </span>

                <h3>
                  Project Activities
                </h3>

                <p>
                  Planned and actual progress for representative
                  schedule activities.
                </p>

              </div>

              <span className="pm-schedule-result">
                {
                  filteredActivities.length
                }{" "}
                activities shown
              </span>

            </div>

            {filteredActivities.length ===
            0 ? (
              <div className="pm-schedule-empty">

                <Search
                  size={32}
                />

                <h3>
                  No activities found
                </h3>

                <p>
                  Try changing your search or filters.
                </p>

              </div>
            ) : (
              <div className="pm-schedule-table-scroll">

                <table className="pm-schedule-table">

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
                        Planned Progress
                      </th>

                      <th>
                        Actual Progress
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
                              activity.id
                            }
                          >

                            <td>

                              <strong className="pm-schedule-id">
                                {
                                  activity.id
                                }
                              </strong>

                            </td>

                            <td>

                              <div className="pm-schedule-activity-name">

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

                              <span className="pm-schedule-wbs">
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

                              <MiniProgress
                                value={
                                  activity.plannedProgress
                                }
                                variant="planned"
                              />

                            </td>

                            <td>

                              <MiniProgress
                                value={
                                  activity.actualProgress
                                }
                                variant="actual"
                              />

                            </td>

                            <td>

                              <span
                                className={`pm-schedule-variance ${
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
                                {
                                  variance
                                }%
                              </span>

                            </td>

                            <td>

                              <span
                                className={`pm-schedule-status ${getStatusClass(
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
            <section className="pm-gantt-card">

              <div className="pm-schedule-card-header">

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

                <div className="pm-gantt-legend">

                  <span>
                    <i className="pm-gantt-planned" />
                    Planned
                  </span>

                  <span>
                    <i className="pm-gantt-actual" />
                    Actual
                  </span>

                </div>

              </div>

              <div className="pm-gantt-scroll">

                <div className="pm-gantt-min-width">

                  <div className="pm-gantt-date-row">

                    <div className="pm-gantt-name-column">
                      ACTIVITY
                    </div>

                    <div className="pm-gantt-days">

                      {dateLabels.map(
                        (date, index) => (
                          <div
                            key={`${date.toISOString()}-${index}`}
                          >
                            <span>
                              {
                                date.getDate()
                              }
                            </span>

                            <small>
                              {date.toLocaleDateString(
                                "en-IN",
                                {
                                  month:
                                    "short",
                                }
                              )}
                            </small>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                  {filteredActivities.map(
                    (activity) => {
                      const start =
                        getDayDate(
                          activity.plannedStart
                        );

                      const finish =
                        getDayDate(
                          activity.plannedFinish
                        );

                      if (
                        !start ||
                        !finish
                      ) {
                        return null;
                      }

                      const offset =
                        Math.max(
                          0,
                          Math.round(
                            (start -
                              ganttRange.start) /
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
                        (offset /
                          ganttDays) *
                        100;

                      const width =
                        (duration /
                          ganttDays) *
                        100;

                      const actualWidth =
                        Math.min(
                          100,
                          Math.max(
                            0,
                            safeNumber(
                              activity.actualProgress
                            )
                          )
                        );

                      return (
                        <div
                          className="pm-gantt-data-row"
                          key={
                            activity.id
                          }
                        >

                          <div className="pm-gantt-name-column">

                            <strong>
                              {
                                activity.id
                              }
                            </strong>

                            <span>
                              {
                                activity.name
                              }
                            </span>

                          </div>

                          <div className="pm-gantt-track">

                            <div
                              className="pm-gantt-bar"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                              }}
                            >

                              <div
                                className="pm-gantt-actual-bar"
                                style={{
                                  width: `${actualWidth}%`,
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
   KPI
========================================================= */

const ScheduleKpi = ({
  icon: Icon,
  label,
  value,
  helper,
}) => {
  return (
    <div className="pm-schedule-kpi">

      <div className="pm-schedule-kpi-icon">
        <Icon size={18} />
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
   MINI PROGRESS
========================================================= */

const MiniProgress = ({
  value,
  variant,
}) => {
  const safeValue =
    Math.min(
      100,
      Math.max(
        0,
        safeNumber(value)
      )
    );

  return (
    <div className="pm-mini-progress">

      <strong>
        {safeValue}%
      </strong>

      <div className="pm-mini-progress-track">

        <div
          className={`pm-mini-progress-fill ${variant}`}
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
};

/* =========================================================
   STATUS CLASS
========================================================= */

const getStatusClass = (
  status
) => {
  switch (status) {
    case "Completed":
      return "completed";

    case "Delayed":
      return "delayed";

    case "Warning":
      return "warning";

    case "In Progress":
      return "progress";

    default:
      return "notstarted";
  }
};

export default ProjectManagerSchedule;