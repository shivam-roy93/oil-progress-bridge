import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Image as ImageIcon,
  MapPin,
  UserCircle,
  XCircle,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { activities as mockActivities } from "../../data/mockData.js";

import "./MyReports.css";

const REPORT_STORAGE_KEY = "progressBridgeFieldEvents";
const ISSUE_STORAGE_KEY = "progressBridgeIssues";

/* =========================================================
   STORAGE
========================================================= */

const readStorageArray = (key) => {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* =========================================================
   DATE HELPERS
========================================================= */

const safeDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = safeDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  const date = safeDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateTime = (value) => {
  const date = safeDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* =========================================================
   FIELD HELPERS
   These support multiple versions of the saved event.
========================================================= */

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return "";
};

const normalizeEvidence = (evidence) => {
  if (!Array.isArray(evidence)) {
    return [];
  }

  return evidence.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `evidence-${index}`,
        src: item,
        name: `Photo ${index + 1}`,
      };
    }

    if (item && typeof item === "object") {
      return {
        ...item,
        id:
          item.id ||
          `evidence-${index}`,
        src: firstValue(
          item.src,
          item.preview,
          item.previewUrl,
          item.dataUrl,
          item.url,
          item.image,
          item.base64
        ),
        name:
          item.name ||
          item.fileName ||
          `Photo ${index + 1}`,
      };
    }

    return {
      id: `evidence-${index}`,
      src: "",
      name: `Photo ${index + 1}`,
    };
  });
};

const normalizeReport = (raw) => {
  if (!raw) {
    return null;
  }

  const evidence = normalizeEvidence(
    firstValue(
      raw.evidence,
      raw.photos,
      raw.images,
      []
    )
  );

  const normalizedActivityId = firstValue(
    raw.activityId,
    raw.activityID,
    raw.linkedActivityId,
    raw.activity?.activityId,
    raw.activity?.id
  );

  const normalizedActivityName = firstValue(
    raw.activityName,
    raw.linkedActivityName,
    raw.activity?.name,
    raw.activity
  );

  const normalizedStart = firstValue(
    raw.actualStart,
    raw.startTime,
    raw.startedAt,
    raw.activityStart,
    raw.startTimestamp
  );

  const normalizedEnd = firstValue(
    raw.actualEnd,
    raw.endTime,
    raw.endedAt,
    raw.activityEnd,
    raw.endTimestamp
  );

  const normalizedDescription = firstValue(
    raw.fieldDescription,
    raw.description,
    raw.fieldEntry,
    raw.transcript,
    raw.voiceText,
    raw.remarks
  );

  const normalizedConfidence = firstValue(
    raw.confidence,
    raw.matchConfidence,
    raw.confidenceScore
  );

  const normalizedMatchStatus = firstValue(
    raw.matchStatus,
    raw.match_status,
    raw.mappingStatus,
    raw.status === "MATCHED"
      ? "MATCHED"
      : ""
  );

  const normalizedSubmittedAt = firstValue(
    raw.submittedAt,
    raw.submissionTime,
    raw.createdAt,
    raw.updatedAt
  );

  const normalizedSubmittedBy = firstValue(
    raw.submittedBy,
    raw.reportedBy,
    raw.createdBy,
    raw.userName,
    "Ramesh Kumar"
  );

  const normalizedQuantity = firstValue(
    raw.quantity,
    raw.actualQuantity,
    raw.progressQuantity
  );

  const normalizedUnit = firstValue(
    raw.unit,
    raw.quantityUnit
  );

  const normalizedLocation = firstValue(
    raw.location,
    raw.chainage,
    raw.locationChainage
  );

  const normalizedRemarks = firstValue(
    raw.remarks,
    raw.notes,
    raw.comment
  );

  const normalizedStatus = firstValue(
    raw.status,
    raw.activityStatus,
    raw.progressStatus,
    "Submitted"
  );

  return {
    ...raw,

    id: firstValue(
      raw.id,
      raw.eventId,
      `report-${Date.now()}`
    ),

    activityId: normalizedActivityId,
    activityName: normalizedActivityName,

    discipline: firstValue(
      raw.discipline,
      raw.activity?.discipline,
      "—"
    ),

    fieldDescription: normalizedDescription,

    status: normalizedStatus,

    plannedStart: firstValue(
      raw.plannedStart,
      raw.activity?.plannedStart
    ),

    plannedFinish: firstValue(
      raw.plannedFinish,
      raw.activity?.plannedFinish
    ),

    actualStart: normalizedStart,
    actualEnd: normalizedEnd,

    actualDuration: firstValue(
      raw.actualDuration,
      raw.duration,
      ""
    ),

    quantity: normalizedQuantity,
    unit: normalizedUnit,
    location: normalizedLocation,
    remarks: normalizedRemarks,

    evidence,

    source: firstValue(
      raw.source,
      raw.captureMethod,
      raw.method,
      "Manual"
    ),

    confidence: normalizedConfidence,
    matchStatus: normalizedMatchStatus,

    submittedBy: normalizedSubmittedBy,
    submittedAt: normalizedSubmittedAt,
  };
};

/* =========================================================
   STATUS
========================================================= */

const getDisplayStatus = (status = "") => {
  const value = String(status).toLowerCase();

  if (
    value.includes("complete") ||
    value.includes("completed")
  ) {
    return "Completed";
  }

  if (
    value.includes("start") ||
    value.includes("progress") ||
    value.includes("running") ||
    value.includes("in progress")
  ) {
    return "Started";
  }

  if (
    value.includes("issue") ||
    value.includes("delay")
  ) {
    return "Issue";
  }

  return "Submitted";
};

const getStatusIcon = (status) => {
  if (status === "Completed") {
    return CheckCircle2;
  }

  if (status === "Issue") {
    return AlertTriangle;
  }

  return Clock3;
};

const getStatusClass = (status) => {
  if (status === "Completed") {
    return "report-status-completed";
  }

  if (status === "Issue") {
    return "report-status-issue";
  }

  return "report-status-started";
};

/* =========================================================
   DEMO FALLBACK
========================================================= */

const demoReports = [
  {
    id: "demo-report-1",
    activityId: "L6-CIV-021",
    activityName: "Earthwork Excavation",
    discipline: "Civil",
    fieldDescription:
      "Earthwork excavation progressed in the designated chainage.",
    status: "Started",
    actualStart: "2026-09-26T08:40:00+05:30",
    actualEnd: "",
    quantity: 120,
    unit: "m³",
    location: "Km 12+000 – Km 12+500",
    remarks:
      "Excavation continued as planned.",
    evidence: [],
    source: "Manual",
    confidence: 94,
    matchStatus: "MATCHED",
    submittedBy: "Ramesh Kumar",
    submittedAt:
      "2026-09-26T08:42:00+05:30",
  },

  {
    id: "demo-report-2",
    activityId: "L6-CIV-023",
    activityName: "Drainage Work",
    discipline: "Civil",
    fieldDescription:
      "Drainage work completed in the north zone.",
    status: "Completed",
    actualStart: "2026-09-26T10:15:00+05:30",
    actualEnd: "2026-09-26T11:20:00+05:30",
    quantity: 85,
    unit: "m",
    location: "Area-A North Zone",
    remarks:
      "Drainage section completed.",
    evidence: [],
    source: "Voice",
    confidence: 91,
    matchStatus: "MATCHED",
    submittedBy: "Ramesh Kumar",
    submittedAt:
      "2026-09-26T11:21:00+05:30",
  },

  {
    id: "demo-report-3",
    activityId: "L6-PIP-024",
    activityName: "Erect Line 24-XX",
    discipline: "Piping",
    fieldDescription: "Spool 24 erected.",
    status: "Started",
    actualStart:
      "2026-09-26T14:05:00+05:30",
    actualEnd: "",
    quantity: 50,
    unit: "m³",
    location: "Km 12+500",
    remarks:
      "Spool erection completed in the designated area.",
    evidence: [],
    source: "Voice",
    confidence: 92,
    matchStatus: "MATCHED",
    submittedBy: "Ramesh Kumar",
    submittedAt:
      "2026-09-26T14:15:00+05:30",
  },
];

/* =========================================================
   MAIN REPORTS PAGE
========================================================= */

const MyReports = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [reports, setReports] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const loadReports = () => {
    const savedReports = readStorageArray(
      REPORT_STORAGE_KEY
    );

    const savedIssues = readStorageArray(
      ISSUE_STORAGE_KEY
    );

    setIssues(savedIssues);

    if (savedReports.length > 0) {
      setReports(
        savedReports
          .map(normalizeReport)
          .filter(Boolean)
      );

      return;
    }

    setReports(
      demoReports.map(normalizeReport)
    );
  };

  useEffect(() => {
    loadReports();

    const handleStorage = () => {
      loadReports();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        loadReports();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) =>
        new Date(
          b.submittedAt ||
            b.actualEnd ||
            b.actualStart ||
            0
        ) -
        new Date(
          a.submittedAt ||
            a.actualEnd ||
            a.actualStart ||
            0
        )
    );
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (!selectedDate) {
      return sortedReports;
    }

    return sortedReports.filter((report) => {
      const dateValue = firstValue(
        report.submittedAt,
        report.actualEnd,
        report.actualStart
      );

      const date = safeDate(dateValue);

      if (!date) {
        return false;
      }

      const localDate =
        date.toLocaleDateString("en-CA");

      return localDate === selectedDate;
    });
  }, [sortedReports, selectedDate]);

  const summary = useMemo(() => {
    const completed = reports.filter(
      (report) =>
        getDisplayStatus(report.status) ===
        "Completed"
    ).length;

    const started = reports.filter(
      (report) =>
        getDisplayStatus(report.status) ===
        "Started"
    ).length;

    return {
      activitiesReported: reports.length,
      completed,
      started,
      issues: issues.length,
    };
  }, [reports, issues]);

  const getActivityDetails = (report) => {
    return (
      mockActivities.find(
        (activity) =>
          activity.activityId ===
            report.activityId ||
          activity.id === report.activityId
      ) || null
    );
  };

  return (
    <DashboardLayout title="My Reports">
      <div className="reports-page">

        {/* HEADER */}
        <div className="reports-page-header">
          <div>
            <span className="reports-eyebrow">
              FIELD EXECUTION
            </span>

            <h2>My Reports</h2>

            <p>
              View submitted field updates and their
              audit history.
            </p>
          </div>

          <div className="reports-header-actions">
            <label className="report-date-filter">
              <CalendarDays size={17} />

              <span>Date</span>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
              />
            </label>
          </div>
        </div>

        {/* SUMMARY */}
        <section className="reports-summary-grid">

          <SummaryCard
            icon={FileText}
            label="Activities Reported"
            value={summary.activitiesReported}
            helper="Field updates submitted"
            tone="neutral"
          />

          <SummaryCard
            icon={CheckCircle2}
            label="Completed"
            value={summary.completed}
            helper="Finished activities"
            tone="success"
          />

          <SummaryCard
            icon={Clock3}
            label="Started"
            value={summary.started}
            helper="Activities started"
            tone="blue"
          />

          <SummaryCard
            icon={AlertTriangle}
            label="Issues"
            value={summary.issues}
            helper="Reported site issues"
            tone="warning"
          />

        </section>

        {/* REPORT LIST */}
        <section className="reports-card">

          <div className="reports-card-header">
            <div>
              <span className="reports-section-label">
                ACTIVITY LOG
              </span>

              <h3>Submitted Reports</h3>

              <p>
                Click any report to view the complete
                activity and audit trail.
              </p>
            </div>

            {selectedDate && (
              <button
                type="button"
                className="clear-date-button"
                onClick={() =>
                  setSelectedDate("")
                }
              >
                <XCircle size={16} />
                Clear date
              </button>
            )}
          </div>

          {filteredReports.length === 0 ? (
            <div className="reports-empty">
              <FileText size={38} />

              <h4>No reports found</h4>

              <p>
                There are no reports matching the
                selected date.
              </p>
            </div>
          ) : (
            <div className="reports-timeline">

              {filteredReports.map((report) => {
                const status =
                  getDisplayStatus(report.status);

                const StatusIcon =
                  getStatusIcon(status);

                return (
                  <button
                    type="button"
                    className="report-timeline-item"
                    key={report.id}
                    onClick={() =>
                      navigate(
                        `/site-supervisor/reports/${report.id}`,
                        {
                          state: {
                            report,
                            activityDetails:
                              getActivityDetails(
                                report
                              ),
                          },
                        }
                      )
                    }
                  >

                    <div className="timeline-time">
                      <strong>
                        {formatTime(
                          report.submittedAt ||
                            report.actualEnd ||
                            report.actualStart
                        )}
                      </strong>

                      <span>
                        {formatDate(
                          report.submittedAt ||
                            report.actualEnd ||
                            report.actualStart
                        )}
                      </span>
                    </div>

                    <div className="timeline-line">

                      <div
                        className={`timeline-icon ${getStatusClass(
                          status
                        )}`}
                      >
                        <StatusIcon size={17} />
                      </div>

                    </div>

                    <div className="timeline-content">

                      <div className="timeline-main">

                        <div>
                          <span className="report-activity-id">
                            {report.activityId ||
                              "FIELD-UPDATE"}
                          </span>

                          <h4>
                            {report.activityName ||
                              "Unnamed Activity"}
                          </h4>
                        </div>

                        <span
                          className={`report-status-badge ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </div>

                      <div className="timeline-meta">

                        <span>
                          <UserCircle size={14} />
                          {report.submittedBy ||
                            currentUser?.name ||
                            "Ramesh Kumar"}
                        </span>

                        <span>
                          <MapPin size={14} />
                          {report.location ||
                            "Location not recorded"}
                        </span>

                        <span>
                          <ImageIcon size={14} />
                          {report.evidence.length}{" "}
                          photos
                        </span>

                      </div>

                      <p className="timeline-description">
                        {report.fieldDescription ||
                          report.remarks ||
                          "Progress update submitted from the field."}
                      </p>

                    </div>

                    <div className="report-open-arrow">
                      →
                    </div>

                  </button>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </DashboardLayout>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}) => {
  return (
    <div
      className={`report-summary-card report-tone-${tone}`}
    >
      <div className="report-summary-icon">
        <Icon size={19} />
      </div>

      <div className="report-summary-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </div>
  );
};

/* =========================================================
   REPORT DETAILS
========================================================= */

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [report, setReport] = useState(null);

  useEffect(() => {
    const savedReports = readStorageArray(
      REPORT_STORAGE_KEY
    );

    let foundReport = savedReports.find(
      (item) =>
        String(item.id) === String(id)
    );

    if (!foundReport) {
      foundReport = demoReports.find(
        (item) =>
          String(item.id) === String(id)
      );
    }

    setReport(
      normalizeReport(foundReport)
    );
  }, [id]);

  if (!report) {
    return (
      <DashboardLayout title="Report Details">
        <div className="report-not-found">

          <XCircle size={42} />

          <h2>Report not found</h2>

          <p>
            The selected report could not be found.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/site-supervisor/reports"
              )
            }
          >
            Back to My Reports
          </button>

        </div>
      </DashboardLayout>
    );
  }

  const status =
    getDisplayStatus(report.status);

  const activityDetails =
    mockActivities.find(
      (activity) =>
        activity.activityId ===
          report.activityId ||
        activity.id === report.activityId
    ) || {};

  const evidenceCount =
    report.evidence.length;

  return (
    <DashboardLayout title="Report Details">

      <div className="report-details-page">

        {/* BACK */}
        <button
          type="button"
          className="back-to-reports"
          onClick={() =>
            navigate(
              "/site-supervisor/reports"
            )
          }
        >
          <ArrowLeft size={17} />
          Back to My Reports
        </button>

        {/* HEADING */}
        <div className="report-details-heading">

          <div>

            <span className="reports-eyebrow">
              REPORT / AUDIT TRAIL
            </span>

            <h2>
              {report.activityName ||
                activityDetails.name ||
                "Activity Report"}
            </h2>

            <p>
              {report.activityId ||
                "FIELD-UPDATE"}{" "}
              ·{" "}
              {report.discipline ||
                activityDetails.discipline ||
                "—"}
            </p>

          </div>

          <span
            className={`report-detail-status ${getStatusClass(
              status
            )}`}
          >
            {status}
          </span>

        </div>

        {/* TOP DETAILS */}
        <div className="report-details-grid">

          {/* FIELD UPDATE */}
          <section className="report-detail-card">

            <div className="report-detail-card-header">

              <div>

                <span className="reports-section-label">
                  FIELD UPDATE
                </span>

                <h3>
                  Progress Information
                </h3>

              </div>

            </div>

            <div className="report-info-grid">

              <InfoItem
                label="Activity"
                value={
                  report.activityName ||
                  activityDetails.name ||
                  "—"
                }
              />

              <InfoItem
                label="Activity ID"
                value={
                  report.activityId || "—"
                }
              />

              <InfoItem
                label="Linked Activity"
                value={
                  report.activityName ||
                  activityDetails.name ||
                  "—"
                }
              />

              <InfoItem
                label="Discipline"
                value={
                  report.discipline ||
                  activityDetails.discipline ||
                  "—"
                }
              />

              <InfoItem
                label="Location"
                value={
                  report.location ||
                  activityDetails.location ||
                  "—"
                }
              />

              <InfoItem
                label="Quantity"
                value={
                  report.quantity !==
                    undefined &&
                  report.quantity !== null &&
                  report.quantity !== ""
                    ? `${report.quantity} ${
                        report.unit || ""
                      }`.trim()
                    : "—"
                }
              />

              <InfoItem
                label="Actual Start"
                value={
                  formatDateTime(
                    report.actualStart
                  )
                }
              />

              <InfoItem
                label="Actual End"
                value={
                  formatDateTime(
                    report.actualEnd
                  )
                }
              />

              <InfoItem
                label="Match Confidence"
                value={
                  report.confidence !==
                    undefined &&
                  report.confidence !==
                    null &&
                  report.confidence !== ""
                    ? `${report.confidence}%`
                    : "—"
                }
              />

              <InfoItem
                label="Match Status"
                value={
                  report.matchStatus
                    ? report.matchStatus
                    : "—"
                }
              />

              <InfoItem
                label="Source"
                value={
                  report.source || "Manual"
                }
              />

              <InfoItem
                label="Evidence"
                value={`${evidenceCount} Photos`}
              />

            </div>

            <div className="report-description-box">

              <span>
                Field Description
              </span>

              <p>
                {report.fieldDescription ||
                  "No field description recorded."}
              </p>

            </div>

            {report.remarks &&
              report.remarks !==
                report.fieldDescription && (
                <div className="report-description-box">

                  <span>
                    Remarks
                  </span>

                  <p>
                    {report.remarks}
                  </p>

                </div>
              )}

          </section>

          {/* AUDIT */}
          <section className="report-detail-card">

            <div className="report-detail-card-header">

              <div>

                <span className="reports-section-label">
                  AUDITABILITY
                </span>

                <h3>
                  Submission Details
                </h3>

              </div>

            </div>

            <div className="audit-list">

              {report.actualStart && (
                <AuditItem
                  time={
                    report.actualStart
                  }
                  title="Activity started"
                />
              )}

              {report.actualEnd && (
                <AuditItem
                  time={report.actualEnd}
                  title="Activity completed"
                />
              )}

              <AuditItem
                time={
                  report.submittedAt
                }
                title="Progress submitted"
              />

            </div>

            <div className="submission-details">

              <InfoItem
                label="Submitted By"
                value={
                  report.submittedBy ||
                  currentUser?.name ||
                  "Ramesh Kumar"
                }
              />

              <InfoItem
                label="Submitted At"
                value={formatDateTime(
                  report.submittedAt
                )}
              />

              <InfoItem
                label="Actual Start"
                value={formatDateTime(
                  report.actualStart
                )}
              />

              <InfoItem
                label="Actual End"
                value={formatDateTime(
                  report.actualEnd
                )}
              />

              <InfoItem
                label="Source"
                value={
                  report.source ||
                  "Manual"
                }
              />

              <InfoItem
                label="Evidence"
                value={`${evidenceCount} Photos`}
              />

              <InfoItem
                label="Match Confidence"
                value={
                  report.confidence !==
                    undefined &&
                  report.confidence !==
                    null &&
                  report.confidence !== ""
                    ? `${report.confidence}%`
                    : "—"
                }
              />

              <InfoItem
                label="Status"
                value={status}
              />

            </div>

          </section>

        </div>

        {/* EVIDENCE */}
        <section className="report-detail-card evidence-detail-card">

          <div className="report-detail-card-header">

            <div>

              <span className="reports-section-label">
                SITE EVIDENCE
              </span>

              <h3>
                Attached Evidence
              </h3>

            </div>

            <span className="evidence-count-pill">
              <ImageIcon size={15} />
              {evidenceCount} Photos
            </span>

          </div>

          {evidenceCount === 0 ? (
            <div className="no-evidence">

              <ImageIcon size={30} />

              <p>
                No photos were attached to this report.
              </p>

            </div>
          ) : (
            <div className="evidence-preview-grid">

              {report.evidence.map(
                (item, index) => (
                  <div
                    className="evidence-preview-item"
                    key={
                      item.id ||
                      `${report.id}-evidence-${index}`
                    }
                  >

                    {item.src ? (
                      <img
                        src={item.src}
                        alt={
                          item.name ||
                          `Evidence ${index + 1}`
                        }
                      />
                    ) : (
                      <div className="evidence-fallback">

                        <ImageIcon
                          size={26}
                        />

                        <span>
                          Preview unavailable
                        </span>

                      </div>
                    )}

                    <span>
                      {item.name ||
                        `Photo ${index + 1}`}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>

    </DashboardLayout>
  );
};

/* =========================================================
   SHARED COMPONENTS
========================================================= */

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div className="info-item">

      <span>{label}</span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
};

const AuditItem = ({
  time,
  title,
}) => {
  return (
    <div className="audit-item">

      <div className="audit-dot"></div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {formatDateTime(time)}
        </span>

      </div>

    </div>
  );
};

export { ReportDetails };

export default MyReports;