import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  RefreshCw,
  Search,
  UserCircle,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

import "./ReviewFieldMatches.css";

/* =========================================================
   STORAGE
========================================================= */

const PLANNER_REVIEW_STORAGE_KEY =
  "progressBridgePlannerReviews";

const FIELD_EVENT_STORAGE_KEY =
  "progressBridgeFieldEvents";

/* =========================================================
   SCHEDULE CANDIDATES
========================================================= */

const CANDIDATE_ACTIVITIES = [
  {
    id: "L6-CIV-021",
    name: "Foundation Work",
    discipline: "Civil",
    location:
      "Km 12+000 - Km 12+500",
    wbs: "Civil > Foundation",
    plannedProgress: 80,
    plannedStart:
      "10 Sep 2026",
    plannedFinish:
      "25 Sep 2026",
  },

  {
    id: "L6-CIV-022",
    name: "Earthwork Excavation",
    discipline: "Civil",
    location:
      "Km 12+000 - Km 12+500",
    wbs: "Civil > Earthwork",
    plannedProgress: 70,
    plannedStart:
      "12 Sep 2026",
    plannedFinish:
      "29 Sep 2026",
  },

  {
    id: "L6-CIV-023",
    name: "Drainage Work",
    discipline: "Civil",
    location:
      "Area-A North Zone",
    wbs: "Civil > Drainage",
    plannedProgress: 75,
    plannedStart:
      "14 Sep 2026",
    plannedFinish:
      "30 Sep 2026",
  },

  {
    id: "L6-PIP-024",
    name: "Erect Line 24-XX",
    discipline: "Piping",
    location:
      "Unit-02 / Pipe Rack",
    wbs: "Piping > Erection",
    plannedProgress: 45,
    plannedStart:
      "18 Sep 2026",
    plannedFinish:
      "01 Oct 2026",
  },

  {
    id: "L6-PIP-025",
    name: "Spool Erection",
    discipline: "Piping",
    location:
      "Pipe Fabrication Yard",
    wbs: "Piping > Fabrication",
    plannedProgress: 50,
    plannedStart:
      "20 Sep 2026",
    plannedFinish:
      "04 Oct 2026",
  },

  {
    id: "L6-ELE-017",
    name: "Cable Laying",
    discipline: "Electrical",
    location:
      "Substation-A",
    wbs: "Electrical > Cable",
    plannedProgress: 40,
    plannedStart:
      "21 Sep 2026",
    plannedFinish:
      "02 Oct 2026",
  },

  {
    id: "L6-INS-012",
    name: "Instrument Installation",
    discipline:
      "Instrumentation",
    location:
      "Control Area",
    wbs: "Instrumentation",
    plannedProgress: 38,
    plannedStart:
      "23 Sep 2026",
    plannedFinish:
      "04 Oct 2026",
  },

  {
    id: "L6-MEC-008",
    name: "Equipment Installation",
    discipline:
      "Mechanical",
    location:
      "Equipment Yard",
    wbs:
      "Mechanical > Installation",
    plannedProgress: 70,
    plannedStart:
      "25 Sep 2026",
    plannedFinish:
      "03 Oct 2026",
  },
];

/* =========================================================
   DEMO PENDING ITEM
========================================================= */

const DEMO_REVIEW_ITEM = {
  id: "PR-DEMO-001",

  fieldDescription:
    "Foundation work near Tank 3 started.",

  submittedBy:
    "Ramesh Kumar",

  submittedAt:
    "2026-09-26T17:20:00+05:30",

  suggestedActivityId:
    null,

  suggestedActivityName:
    null,

  confidence: 42,

  matchStatus:
    "PENDING_REVIEW",

  candidateActivities: [
    {
      id: "L6-CIV-021",
      name: "Foundation Work",
      discipline: "Civil",
      location:
        "Km 12+000 - Km 12+500",
    },

    {
      id: "L6-CIV-022",
      name: "Earthwork Excavation",
      discipline: "Civil",
      location:
        "Km 12+000 - Km 12+500",
    },

    {
      id: "L6-CIV-023",
      name: "Drainage Work",
      discipline: "Civil",
      location:
        "Area-A North Zone",
    },
  ],

  plannerDecision: null,
  reviewedBy: null,
  reviewedAt: null,
};

/* =========================================================
   HELPERS
========================================================= */

const readStorageArray = (
  key
) => {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
};

const saveStorageArray = (
  key,
  value
) => {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
};

const formatDateTime = (
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

const getConfidenceClass =
  (confidence) => {
    if (
      confidence >= 90
    ) {
      return "confidence-high";
    }

    if (
      confidence >= 70
    ) {
      return "confidence-medium";
    }

    return "confidence-low";
  };

const getConfidenceLabel =
  (confidence) => {
    if (
      confidence >= 90
    ) {
      return "High Confidence";
    }

    if (
      confidence >= 70
    ) {
      return "Medium Confidence";
    }

    return "Low Confidence";
  };

/* =========================================================
   PAGE
========================================================= */

const ReviewFieldMatches =
  () => {
    const navigate =
      useNavigate();

    const [
      reviews,
      setReviews,
    ] = useState([]);

    const [
      selectedReview,
      setSelectedReview,
    ] = useState(null);

    const [
      selectedActivityId,
      setSelectedActivityId,
    ] = useState("");

    const [
      searchTerm,
      setSearchTerm,
    ] = useState("");

    const [
      statusFilter,
      setStatusFilter,
    ] = useState(
      "Pending Review"
    );

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    const [
      actionMessage,
      setActionMessage,
    ] = useState("");

    /* =======================================================
       LOAD REVIEWS
    ======================================================= */

    const loadReviews = () => {
      const stored =
        readStorageArray(
          PLANNER_REVIEW_STORAGE_KEY
        );

      /*
        The demo item ensures the page can be
        demonstrated even before a low-confidence
        Site Supervisor submission has been created.
      */

      if (
        stored.length === 0
      ) {
        const initialDemo = [
          DEMO_REVIEW_ITEM,
        ];

        saveStorageArray(
          PLANNER_REVIEW_STORAGE_KEY,
          initialDemo
        );

        setReviews(
          initialDemo
        );

        return;
      }

      setReviews(
        stored
      );
    };

    useEffect(() => {
      loadReviews();
    }, []);

    /* =======================================================
       COUNTS
    ======================================================= */

    const pendingCount =
      reviews.filter(
        (review) =>
          review.matchStatus ===
            "PENDING_REVIEW" &&
          !review.plannerDecision
      ).length;

    const reviewedCount =
      reviews.filter(
        (review) =>
          Boolean(
            review.plannerDecision
          )
      ).length;

    const confirmedCount =
      reviews.filter(
        (review) =>
          review.plannerDecision ===
          "CONFIRMED"
      ).length;

    const rejectedCount =
      reviews.filter(
        (review) =>
          review.plannerDecision ===
          "REJECTED"
      ).length;

    /* =======================================================
       FILTER
    ======================================================= */

    const filteredReviews =
      useMemo(() => {
        const query =
          searchTerm
            .trim()
            .toLowerCase();

        return reviews.filter(
          (review) => {
            const isPending =
              review.matchStatus ===
                "PENDING_REVIEW" &&
              !review.plannerDecision;

            const isReviewed =
              Boolean(
                review.plannerDecision
              );

            const matchesStatus =
              statusFilter ===
                "All" ||
              (statusFilter ===
                "Pending Review" &&
                isPending) ||
              (statusFilter ===
                "Reviewed" &&
                isReviewed);

            const searchable = [
              review.fieldDescription,
              review.submittedBy,
              review.suggestedActivityId,
              review.suggestedActivityName,
              review.matchStatus,
              review.plannerDecision,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return (
              matchesStatus &&
              (
                !query ||
                searchable.includes(
                  query
                )
              )
            );
          }
        );
      }, [
        reviews,
        searchTerm,
        statusFilter,
      ]);

    /* =======================================================
       OPEN REVIEW
    ======================================================= */

    const openReview =
      (review) => {
        setSelectedReview(
          review
        );

        setSelectedActivityId(
          review.selectedActivityId ||
            review.suggestedActivityId ||
            ""
        );

        setActionMessage("");
      };

    /* =======================================================
       CLOSE REVIEW
    ======================================================= */

    const closeReview =
      () => {
        setSelectedReview(
          null
        );

        setSelectedActivityId(
          ""
        );

        setActionMessage("");
      };

    /* =======================================================
       CANDIDATES
    ======================================================= */

    const getCandidates =
      (review) => {
        const ids =
          Array.isArray(
            review.candidateActivities
          )
            ? review.candidateActivities.map(
                (candidate) =>
                  candidate.id
              )
            : [];

        const storedCandidates =
          CANDIDATE_ACTIVITIES.filter(
            (activity) =>
              ids.includes(
                activity.id
              )
          );

        if (
          storedCandidates.length >
          0
        ) {
          return storedCandidates;
        }

        return CANDIDATE_ACTIVITIES;
      };

    /* =======================================================
       UPDATE REVIEW STORAGE
    ======================================================= */

    const updateReview =
      (
        reviewId,
        changes
      ) => {
        const existing =
          readStorageArray(
            PLANNER_REVIEW_STORAGE_KEY
          );

        const updated =
          existing.map(
            (item) =>
              item.id === reviewId
                ? {
                    ...item,
                    ...changes,
                  }
                : item
          );

        saveStorageArray(
          PLANNER_REVIEW_STORAGE_KEY,
          updated
        );

        setReviews(
          updated
        );

        return updated;
      };

    /* =======================================================
       CONFIRM MATCH
    ======================================================= */

    const confirmMatch =
      () => {
        if (
          !selectedReview
        ) {
          return;
        }

        if (
          !selectedActivityId
        ) {
          alert(
            "Please select the schedule activity that matches this field entry."
          );

          return;
        }

        const activity =
          CANDIDATE_ACTIVITIES.find(
            (item) =>
              item.id ===
              selectedActivityId
          );

        if (!activity) {
          alert(
            "Selected schedule activity could not be found."
          );

          return;
        }

        const reviewedAt =
          new Date().toISOString();

        updateReview(
          selectedReview.id,
          {
            selectedActivityId:
              activity.id,

            selectedActivityName:
              activity.name,

            linkedActivityId:
              activity.id,

            linkedActivityName:
              activity.name,

            matchStatus:
              "MATCHED",

            plannerDecision:
              "CONFIRMED",

            reviewedBy:
              "Arjun Mehta",

            reviewedAt,
          }
        );

        /*
          Also update an existing field event
          when one with the same review ID exists.
        */

        const fieldEvents =
          readStorageArray(
            FIELD_EVENT_STORAGE_KEY
          );

        if (
          fieldEvents.length > 0
        ) {
          const updatedEvents =
            fieldEvents.map(
              (event) => {
                if (
                  event.plannerReviewId !==
                    selectedReview.id &&
                  event.id !==
                    selectedReview.fieldEventId
                ) {
                  return event;
                }

                return {
                  ...event,

                  activityId:
                    activity.id,

                  activityName:
                    activity.name,

                  matchStatus:
                    "MATCHED",

                  linkedActivityId:
                    activity.id,

                  plannerDecision:
                    "CONFIRMED",

                  reviewedBy:
                    "Arjun Mehta",

                  reviewedAt,
                };
              }
            );

          saveStorageArray(
            FIELD_EVENT_STORAGE_KEY,
            updatedEvents
          );
        }

        setActionMessage(
          `Match confirmed: ${activity.id} — ${activity.name}`
        );

        window.setTimeout(
          () => {
            closeReview();
          },
          700
        );
      };

    /* =======================================================
       REJECT
    ======================================================= */

    const rejectReview =
      () => {
        if (
          !selectedReview
        ) {
          return;
        }

        const reviewedAt =
          new Date().toISOString();

        updateReview(
          selectedReview.id,
          {
            matchStatus:
              "REJECTED",

            plannerDecision:
              "REJECTED",

            selectedActivityId:
              null,

            selectedActivityName:
              null,

            linkedActivityId:
              null,

            linkedActivityName:
              null,

            reviewedBy:
              "Arjun Mehta",

            reviewedAt,
          }
        );

        setActionMessage(
          "Field entry rejected and recorded in the review history."
        );

        window.setTimeout(
          () => {
            closeReview();
          },
          700
        );
      };

    /* =======================================================
       SELECT ANOTHER
    ======================================================= */

    const selectAnother =
      () => {
        if (
          !selectedReview
        ) {
          return;
        }

        if (
          !selectedActivityId
        ) {
          alert(
            "Select a schedule activity first."
          );

          return;
        }

        const activity =
          CANDIDATE_ACTIVITIES.find(
            (item) =>
              item.id ===
              selectedActivityId
          );

        if (!activity) {
          return;
        }

        const reviewedAt =
          new Date().toISOString();

        updateReview(
          selectedReview.id,
          {
            selectedActivityId:
              activity.id,

            selectedActivityName:
              activity.name,

            linkedActivityId:
              activity.id,

            linkedActivityName:
              activity.name,

            matchStatus:
              "MATCHED",

            plannerDecision:
              "CONFIRMED",

            plannerAction:
              "SELECTED_ANOTHER",

            reviewedBy:
              "Arjun Mehta",

            reviewedAt,
          }
        );

        setActionMessage(
          `Activity changed and confirmed: ${activity.id}`
        );

        window.setTimeout(
          () => {
            closeReview();
          },
          700
        );
      };

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
            loadReviews();
            setRefreshing(
              false
            );
          },
          400
        );
      };

    return (
      <DashboardLayout
        title="Review Field Matches"
      >
        <div className="review-matches-page">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="review-matches-header">

            <div>

              <button
                type="button"
                className="review-back-button"
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

              <span className="review-eyebrow">
                PLANNING & CONTROL
              </span>

              <h2>
                Review Field Matches
              </h2>

              <p>
                Resolve field updates that could not be
                confidently linked to the project schedule.
              </p>

            </div>

            <div className="review-header-actions">

              <button
                type="button"
                className="review-secondary-button"
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
                      ? "review-spin"
                      : ""
                  }
                />
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <button
                type="button"
                className="review-secondary-button"
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
              KPI
          ================================================= */}

          <section className="review-kpi-grid">

            <ReviewKpi
              icon={
                AlertTriangle
              }
              label="Pending Review"
              value={
                pendingCount
              }
              helper="Needs planner action"
              tone="warning"
            />

            <ReviewKpi
              icon={
                CheckCircle2
              }
              label="Confirmed"
              value={
                confirmedCount
              }
              helper="Matched to schedule"
              tone="success"
            />

            <ReviewKpi
              icon={
                Clock3
              }
              label="Reviewed"
              value={
                reviewedCount
              }
              helper="Processed entries"
              tone="blue"
            />

            <ReviewKpi
              icon={
                X
              }
              label="Rejected"
              value={
                rejectedCount
              }
              helper="Not linked"
              tone="danger"
            />

          </section>

          {/* =================================================
              INFORMATION BANNER
          ================================================= */}

          <section className="review-info-banner">

            <div className="review-info-icon">
              <AlertTriangle
                size={18}
              />
            </div>

            <div>

              <strong>
                Why are these entries here?
              </strong>

              <p>
                These field reports were captured by the
                Site Supervisor but did not meet the
                confidence threshold for automatic
                schedule matching. Review the field
                description and choose the correct
                scheduled activity.
              </p>

            </div>

          </section>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="review-filter-bar">

            <div className="review-search">

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
                placeholder="Search field description, activity, supervisor..."
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
                  <X size={14} />
                </button>
              )}

            </div>

            <div className="review-filter-select">

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

                <option value="Pending Review">
                  Pending Review
                </option>

                <option value="Reviewed">
                  Reviewed
                </option>

                <option value="All">
                  All Entries
                </option>

              </select>

            </div>

            <span className="review-result-count">
              {
                filteredReviews.length
              }{" "}
              entries
            </span>

          </section>

          {/* =================================================
              REVIEW LIST
          ================================================= */}

          <section className="review-list-card">

            <div className="review-list-header">

              <div>

                <span>
                  FIELD MATCH QUEUE
                </span>

                <h3>
                  Entries Requiring Planner Review
                </h3>

              </div>

              <div className="queue-count">
                {pendingCount}
                {" "}
                pending
              </div>

            </div>

            {filteredReviews.length ===
            0 ? (
              <div className="review-empty-state">

                <CheckCircle2
                  size={34}
                />

                <h3>
                  No review items
                </h3>

                <p>
                  There are no entries matching
                  the selected filter.
                </p>

              </div>
            ) : (
              <div className="review-list">

                {filteredReviews.map(
                  (review) => {
                    const confidence =
                      Number(
                        review.confidence
                      ) || 0;

                    const isPending =
                      review.matchStatus ===
                        "PENDING_REVIEW" &&
                      !review.plannerDecision;

                    return (
                      <div
                        className="review-list-item"
                        key={
                          review.id
                        }
                      >

                        <div className="review-item-status">

                          <div
                            className={`review-status-icon ${
                              isPending
                                ? "pending"
                                : review.plannerDecision ===
                                  "CONFIRMED"
                                ? "confirmed"
                                : "rejected"
                            }`}
                          >
                            {isPending ? (
                              <AlertTriangle
                                size={18}
                              />
                            ) : review.plannerDecision ===
                              "CONFIRMED" ? (
                              <Check
                                size={18}
                              />
                            ) : (
                              <X
                                size={18}
                              />
                            )}
                          </div>

                        </div>

                        <div className="review-item-main">

                          <div className="review-item-top">

                            <span className="review-item-id">
                              {
                                review.id
                              }
                            </span>

                            <span
                              className={`review-state-badge ${
                                isPending
                                  ? "pending"
                                  : review.plannerDecision ===
                                    "CONFIRMED"
                                  ? "confirmed"
                                  : "rejected"
                              }`}
                            >
                              {isPending
                                ? "PENDING REVIEW"
                                : review.plannerDecision ===
                                  "CONFIRMED"
                                ? "MATCHED"
                                : "REJECTED"}
                            </span>

                          </div>

                          <h3>
                            {
                              review.fieldDescription
                            }
                          </h3>

                          <div className="review-meta">

                            <span>
                              <UserCircle
                                size={13}
                              />
                              {
                                review.submittedBy ||
                                "Site Supervisor"
                              }
                            </span>

                            <span>
                              <Clock3
                                size={13}
                              />
                              {
                                formatDateTime(
                                  review.submittedAt
                                )
                              }
                            </span>

                          </div>

                        </div>

                        <div className="review-item-match">

                          <span>
                            SUGGESTED ACTIVITY
                          </span>

                          {review.suggestedActivityId ? (
                            <>
                              <strong>
                                {
                                  review.suggestedActivityId
                                }
                              </strong>

                              <p>
                                {
                                  review.suggestedActivityName
                                }
                              </p>
                            </>
                          ) : (
                            <>
                              <strong>
                                No confident match
                              </strong>

                              <p>
                                Planner selection required
                              </p>
                            </>
                          )}

                        </div>

                        <div className="review-item-confidence">

                          <span>
                            CONFIDENCE
                          </span>

                          <strong
                            className={getConfidenceClass(
                              confidence
                            )}
                          >
                            {
                              confidence
                            }%
                          </strong>

                          <small>
                            {
                              getConfidenceLabel(
                                confidence
                              )
                            }
                          </small>

                        </div>

                        <div className="review-item-action">

                          <button
                            type="button"
                            className={
                              isPending
                                ? "review-primary-button"
                                : "review-secondary-button"
                            }
                            onClick={() =>
                              openReview(
                                review
                              )
                            }
                          >
                            {isPending
                              ? "Review Match"
                              : "View Review"}

                            <ArrowRight
                              size={14}
                            />
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </section>

        </div>

        {/* =====================================================
            DETAIL MODAL
        ===================================================== */}

        {selectedReview && (
          <div
            className="review-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeReview();
              }
            }}
          >

            <div className="review-modal">

              {/* HEADER */}

              <div className="review-modal-header">

                <div>

                  <span>
                    PLANNER REVIEW
                  </span>

                  <h2>
                    Activity Match Review
                  </h2>

                  <p>
                    {
                      selectedReview.id
                    }
                  </p>

                </div>

                <button
                  type="button"
                  className="modal-close-button"
                  onClick={
                    closeReview
                  }
                >
                  <X
                    size={18}
                  />
                </button>

              </div>

              {/* BODY */}

              <div className="review-modal-body">

                {/* FIELD ENTRY */}

                <section className="modal-review-section">

                  <div className="modal-section-heading">

                    <FileText
                      size={17}
                    />

                    <div>

                      <span>
                        FIELD ENTRY
                      </span>

                      <h3>
                        What was reported?
                      </h3>

                    </div>

                  </div>

                  <div className="field-entry-box">

                    <p>
                      {
                        selectedReview.fieldDescription
                      }
                    </p>

                    <div>

                      <span>
                        Submitted by{" "}
                        <strong>
                          {
                            selectedReview.submittedBy
                          }
                        </strong>
                      </span>

                      <span>
                        {
                          formatDateTime(
                            selectedReview.submittedAt
                          )
                        }
                      </span>

                    </div>

                  </div>

                </section>

                {/* CURRENT MATCH */}

                <section className="modal-review-section">

                  <div className="modal-section-heading">

                    <BarChartIcon />

                    <div>

                      <span>
                        CURRENT MATCH
                      </span>

                      <h3>
                        Matching Information
                      </h3>

                    </div>

                  </div>

                  <div className="current-match-grid">

                    <div>

                      <span>
                        SUGGESTED ACTIVITY
                      </span>

                      <strong>
                        {
                          selectedReview
                            .suggestedActivityId ||
                          "No confident match"
                        }
                      </strong>

                    </div>

                    <div>

                      <span>
                        CONFIDENCE
                      </span>

                      <strong
                        className={getConfidenceClass(
                          Number(
                            selectedReview.confidence
                          ) || 0
                        )}
                      >
                        {
                          selectedReview.confidence
                        }%
                      </strong>

                    </div>

                    <div>

                      <span>
                        MATCH STATUS
                      </span>

                      <strong>
                        {
                          selectedReview.matchStatus
                        }
                      </strong>

                    </div>

                  </div>

                </section>

                {/* ACTIVITY SELECTION */}

                {(!selectedReview.plannerDecision ||
                  selectedReview.plannerDecision ===
                    null) && (
                  <section className="modal-review-section">

                    <div className="modal-section-heading">

                      <ChevronDown
                        size={17}
                      />

                      <div>

                        <span>
                          SCHEDULE ACTIVITIES
                        </span>

                        <h3>
                          Select the correct activity
                        </h3>

                      </div>

                    </div>

                    <div className="candidate-list">

                      {getCandidates(
                        selectedReview
                      ).map(
                        (activity) => (
                          <label
                            key={
                              activity.id
                            }
                            className={`candidate-card ${
                              selectedActivityId ===
                              activity.id
                                ? "selected"
                                : ""
                            }`}
                          >

                            <input
                              type="radio"
                              name="plannerActivity"
                              value={
                                activity.id
                              }
                              checked={
                                selectedActivityId ===
                                activity.id
                              }
                              onChange={(event) =>
                                setSelectedActivityId(
                                  event.target.value
                                )
                              }
                            />

                            <div className="candidate-check">
                              <Check
                                size={13}
                              />
                            </div>

                            <div className="candidate-copy">

                              <strong>
                                {
                                  activity.id
                                }
                              </strong>

                              <h4>
                                {
                                  activity.name
                                }
                              </h4>

                              <span>
                                {
                                  activity.discipline
                                }{" "}
                                ·{" "}
                                {
                                  activity.location
                                }
                              </span>

                            </div>

                            <div className="candidate-planned">

                              <span>
                                PLANNED
                              </span>

                              <strong>
                                {
                                  activity.plannedProgress
                                }%
                              </strong>

                            </div>

                          </label>
                        )
                      )}

                    </div>

                  </section>
                )}

                {/* REVIEW RESULT */}

                {selectedReview.plannerDecision && (
                  <section className="review-result-box">

                    {selectedReview.plannerDecision ===
                    "CONFIRMED" ? (
                      <CheckCircle2
                        size={20}
                      />
                    ) : (
                      <AlertTriangle
                        size={20}
                      />
                    )}

                    <div>

                      <strong>
                        {selectedReview.plannerDecision ===
                        "CONFIRMED"
                          ? "Match confirmed"
                          : "Entry rejected"}
                      </strong>

                      <span>
                        {selectedReview.linkedActivityId
                          ? `${selectedReview.linkedActivityId} — ${selectedReview.linkedActivityName}`
                          : "No schedule activity linked."}
                      </span>

                    </div>

                  </section>
                )}

                {actionMessage && (
                  <div className="review-action-message">

                    <CheckCircle2
                      size={16}
                    />

                    {actionMessage}

                  </div>
                )}

              </div>

              {/* FOOTER */}

              <div className="review-modal-footer">

                <button
                  type="button"
                  className="review-secondary-button"
                  onClick={
                    closeReview
                  }
                >
                  Close
                </button>

                {(!selectedReview.plannerDecision ||
                  selectedReview.plannerDecision ===
                    null) && (
                  <>
                    <button
                      type="button"
                      className="review-danger-button"
                      onClick={
                        rejectReview
                      }
                    >
                      <X size={15} />
                      Reject
                    </button>

                    <button
                      type="button"
                      className="review-secondary-button"
                      onClick={
                        selectAnother
                      }
                    >
                      Select Another
                    </button>

                    <button
                      type="button"
                      className="review-primary-button"
                      onClick={
                        confirmMatch
                      }
                    >
                      <Check
                        size={15}
                      />
                      Confirm Match
                    </button>
                  </>
                )}

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

const ReviewKpi = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}) => {
  return (
    <div
      className={`review-kpi-card review-kpi-${tone}`}
    >

      <div className="review-kpi-icon">
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
   BAR CHART ICON
========================================================= */

const BarChartIcon = () => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="10"
      />
      <line
        x1="18"
        y1="20"
        x2="18"
        y2="4"
      />
      <line
        x1="6"
        y1="20"
        x2="6"
        y2="16"
      />
    </svg>
  );
};

export default ReviewFieldMatches;