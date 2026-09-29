import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useProject } from "../../context/projectContext";
import "./MyActivities.css";

const MyActivities = () => {
  const navigate = useNavigate();
  const { projectState } = useProject();

  const activities = projectState?.activities || [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const getStatus = (activity) => {
    const progress = Number(activity.actualProgress ?? 0);
    const variance = Number(activity.variance ?? 0);

    if (progress >= 100) return "Completed";
    if (variance < 0) return "Delayed";
    if (progress > 0) return "Running";
    return "Pending";
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        String(activity.id || "")
          .toLowerCase()
          .includes(query) ||
        String(activity.name || "")
          .toLowerCase()
          .includes(query) ||
        String(activity.location || "")
          .toLowerCase()
          .includes(query) ||
        String(activity.discipline || "")
          .toLowerCase()
          .includes(query);

      const status = getStatus(activity);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activities, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: activities.length,
      running: activities.filter(
        (item) => getStatus(item) === "Running"
      ).length,
      pending: activities.filter(
        (item) => getStatus(item) === "Pending"
      ).length,
      delayed: activities.filter(
        (item) => getStatus(item) === "Delayed"
      ).length,
      completed: activities.filter(
        (item) => getStatus(item) === "Completed"
      ).length,
    };
  }, [activities]);

  return (
    <DashboardLayout title="My Activities">
      <div className="my-activities-page">

        {/* HEADER */}
        <div className="activities-page-header">
          <div>
            <p className="page-eyebrow">
              FIELD EXECUTION
            </p>

            <h1>My Activities</h1>

            <p>
              View today's assigned activities and update
              actual field progress.
            </p>
          </div>

          <button
            type="button"
            className="primary-action"
            onClick={() =>
              navigate("/site-supervisor/capture")
            }
          >
            <Activity size={17} />
            Capture Progress
          </button>
        </div>

        {/* SUMMARY */}
        <div className="activity-summary-grid">

          <div className="activity-summary-card">
            <div className="summary-icon neutral">
              <Activity size={18} />
            </div>

            <span>TOTAL ACTIVITIES</span>

            <strong>{counts.all}</strong>

            <p>Assigned to you</p>
          </div>

          <div className="activity-summary-card">
            <div className="summary-icon blue">
              <Clock3 size={18} />
            </div>

            <span>RUNNING</span>

            <strong>{counts.running}</strong>

            <p>Currently active</p>
          </div>

          <div className="activity-summary-card">
            <div className="summary-icon warning">
              <AlertTriangle size={18} />
            </div>

            <span>DELAYED</span>

            <strong>{counts.delayed}</strong>

            <p>Need attention</p>
          </div>

          <div className="activity-summary-card">
            <div className="summary-icon success">
              <CheckCircle2 size={18} />
            </div>

            <span>COMPLETED</span>

            <strong>{counts.completed}</strong>

            <p>Finished activities</p>
          </div>

        </div>

        {/* FILTERS */}
        <div className="activities-toolbar">

          <div className="activity-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search activity, ID, location..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="activity-filter">
            <SlidersHorizontal size={16} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Running">Running</option>
              <option value="Pending">Pending</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

        </div>

        {/* ACTIVITY LIST */}
        <section className="activities-section">

          <div className="section-heading">
            <div>
              <p>ASSIGNED WORK</p>

              <h2>Today's Activities</h2>
            </div>

            <span>
              {filteredActivities.length} activities
            </span>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="empty-activities">
              <Activity size={30} />

              <h3>No activities found</h3>

              <p>
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="activities-list">

              {filteredActivities.map((activity) => {
                const progress = Number(
                  activity.actualProgress ?? 0
                );

                const plannedProgress = Number(
                  activity.plannedProgress ?? 0
                );

                const variance =
                  Number(activity.variance ?? 0);

                const status = getStatus(activity);

                return (
                  <article
                    className="activity-row"
                    key={activity.id}
                  >

                    {/* MAIN */}
                    <div className="activity-main">

                      <div className="activity-status-dot" />

                      <div className="activity-main-content">

                        <div className="activity-id">
                          {activity.id}
                        </div>

                        <h3>
                          {activity.name ||
                            "Unnamed Activity"}
                        </h3>

                        <div className="activity-meta">

                          <span>
                            <MapPin size={13} />
                            {activity.location ||
                              "Site location"}
                          </span>

                          <span>
                            <Activity size={13} />
                            {activity.discipline ||
                              "General"}
                          </span>

                          {activity.plannedFinish && (
                            <span>
                              <CalendarDays size={13} />
                              Finish:{" "}
                              {activity.plannedFinish}
                            </span>
                          )}

                        </div>

                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="activity-progress">

                      <div className="progress-heading">
                        <span>ACTUAL PROGRESS</span>

                        <strong>
                          {progress}%
                        </strong>
                      </div>

                      <div className="activity-progress-track">
                        <div
                          className={`activity-progress-fill ${
                            status.toLowerCase()
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, progress)
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="progress-comparison">
                        <span>
                          Planned:{" "}
                          {plannedProgress}%
                        </span>

                        <span
                          className={
                            variance < 0
                              ? "negative"
                              : variance > 0
                              ? "positive"
                              : ""
                          }
                        >
                          Variance:{" "}
                          {variance > 0
                            ? `+${variance}%`
                            : `${variance}%`}
                        </span>
                      </div>

                    </div>

                    {/* STATUS */}
                    <div className="activity-status-column">

                      <span
                        className={`activity-status-badge ${status.toLowerCase()}`}
                      >
                        {status}
                      </span>

                    </div>

                    {/* ACTION */}
                    <div className="activity-action">

                      <button
                        type="button"
                        className="update-activity-button"
                        onClick={() =>
                          navigate(
                            "/site-supervisor/capture"
                          )
                        }
                      >
                        Update
                        <ArrowRight size={15} />
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </DashboardLayout>
  );
};

export default MyActivities;