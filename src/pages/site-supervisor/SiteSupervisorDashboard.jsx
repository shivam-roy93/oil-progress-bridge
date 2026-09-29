import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
} from "lucide-react";

import { useProject } from "../../context/projectContext.jsx";
import DashboardLayout from "../../components/layout/DashboardLayout";

import "./SiteSupervisorDashboard.css";

const SiteSupervisorDashboard = () => {
  const { projectState } = useProject();

  const activities = projectState.activities || [];

  const runningActivities = activities.filter(
    (activity) =>
      activity.actualProgress > 0 &&
      activity.actualProgress < 100
  );

  const pendingActivities = activities.filter(
    (activity) => activity.actualProgress === 0
  );

  const delayedActivities = activities.filter(
    (activity) => activity.variance < 0
  );

  const todayActivities = activities.slice(0, 5);

  return (
    <DashboardLayout title="Site Supervisor Dashboard">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">FIELD EXECUTION</p>
          <h2>Good morning, Site Supervisor</h2>
          <p className="page-description">
            Track today's assigned activities and report actual
            field progress.
          </p>
        </div>

        <button type="button" className="primary-action">
          <Plus size={18} />
          Quick Capture
        </button>
      </div>

      {/* Project information */}
      <section className="project-info-card">
        <div className="project-info-main">
          <div className="project-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>ACTIVE PROJECT</span>
            <h3>
              {projectState.selectedProject?.name ||
                "Refinery Expansion Project"}
            </h3>
          </div>
        </div>

        <div className="project-info-item">
          <MapPin size={17} />
          <div>
            <span>LOCATION</span>
            <strong>
              {projectState.selectedProject?.location ||
                "Area-A"}
            </strong>
          </div>
        </div>

        <div className="project-info-item">
          <Clock3 size={17} />
          <div>
            <span>LAST SYNC</span>
            <strong>Today, 10:30 AM</strong>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={19} />
          </div>

          <span className="stat-label">RUNNING</span>

          <strong className="stat-value">
            {runningActivities.length}
          </strong>

          <span className="stat-meta">
            Active field activities
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock3 size={19} />
          </div>

          <span className="stat-label">PENDING</span>

          <strong className="stat-value">
            {pendingActivities.length}
          </strong>

          <span className="stat-meta">
            Yet to start
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <AlertTriangle size={19} />
          </div>

          <span className="stat-label">DELAYED</span>

          <strong className="stat-value">
            {delayedActivities.length}
          </strong>

          <span className="stat-meta">
            Need attention
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <span className="stat-label">TODAY</span>

          <strong className="stat-value">
            {todayActivities.length}
          </strong>

          <span className="stat-meta">
            Activities assigned
          </span>
        </div>
      </section>

      {/* Today's activities */}
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">FIELD WORK</p>
            <h3>Today's Activities</h3>
          </div>

          <span className="section-count">
            {todayActivities.length} activities
          </span>
        </div>

        <div className="activity-list">
          {todayActivities.map((activity) => (
            <div
              key={activity.id}
              className="activity-card"
            >
              <div className="activity-card-main">
                <div className="activity-status-dot"></div>

                <div>
                  <span className="activity-id">
                    {activity.activityId}
                  </span>

                  <h4>{activity.name}</h4>

                  <p>
                    {activity.location} ·{" "}
                    {activity.discipline}
                  </p>
                </div>
              </div>

              <div className="activity-progress">
                <div className="activity-progress-header">
                  <span>Progress</span>
                  <strong>
                    {activity.actualProgress}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${activity.actualProgress}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div
                className={`activity-status status-${activity.status.toLowerCase()}`}
              >
                {activity.status}
              </div>

              <button
                type="button"
                className="activity-update-button"
              >
                Update
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick capture */}
      <section className="quick-capture-card">
        <div>
          <p className="section-eyebrow">FIELD UPDATE</p>
          <h3>Capture today's progress</h3>
          <p>
            Record actual progress, add evidence, and report
            site issues against an assigned activity.
          </p>
        </div>

        <button type="button" className="secondary-action">
          <Plus size={17} />
          Start Capture
        </button>
      </section>
    </DashboardLayout>
  );
};

export default SiteSupervisorDashboard;