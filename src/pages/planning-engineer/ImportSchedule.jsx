import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

import "./ImportSchedule.css";

/* =========================================================
   CONSTANTS
========================================================= */

const SCHEDULE_STORAGE_KEY =
  "progressBridgeScheduleImport";

const SUPPORTED_EXTENSIONS = [
  ".xer",
  ".xml",
  ".xlsx",
  ".csv",
];

const PREVIEW_ACTIVITIES = [
  {
    activityId: "L6-CIV-021",
    activityName: "Foundation Work",
    wbs: "Civil > Foundation",
    start: "10 Sep 2026",
    finish: "25 Sep 2026",
  },
  {
    activityId: "L6-CIV-022",
    activityName: "Earthwork Excavation",
    wbs: "Civil > Earthwork",
    start: "12 Sep 2026",
    finish: "29 Sep 2026",
  },
  {
    activityId: "L6-CIV-023",
    activityName: "Drainage Work",
    wbs: "Civil > Drainage",
    start: "14 Sep 2026",
    finish: "30 Sep 2026",
  },
  {
    activityId: "L6-PIP-024",
    activityName: "Erect Line 24-XX",
    wbs: "Piping > Erection",
    start: "18 Sep 2026",
    finish: "01 Oct 2026",
  },
  {
    activityId: "L6-PIP-025",
    activityName: "Spool Erection",
    wbs: "Piping > Fabrication",
    start: "20 Sep 2026",
    finish: "04 Oct 2026",
  },
  {
    activityId: "L6-ELE-017",
    activityName: "Cable Laying",
    wbs: "Electrical > Cable",
    start: "21 Sep 2026",
    finish: "02 Oct 2026",
  },
  {
    activityId: "L6-INS-012",
    activityName: "Instrument Installation",
    wbs: "Instrumentation",
    start: "23 Sep 2026",
    finish: "04 Oct 2026",
  },
  {
    activityId: "L6-MEC-008",
    activityName: "Equipment Installation",
    wbs: "Mechanical > Installation",
    start: "25 Sep 2026",
    finish: "03 Oct 2026",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const formatFileSize = (bytes) => {
  if (!bytes) {
    return "0 KB";
  }

  const mb = bytes / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  return `${Math.max(
    1,
    Math.round(bytes / 1024)
  )} KB`;
};

const getExtension = (fileName = "") => {
  const lastDot =
    fileName.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return fileName
    .slice(lastDot)
    .toLowerCase();
};

const readScheduleState = () => {
  try {
    const raw =
      localStorage.getItem(
        SCHEDULE_STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const formatImportedDate = (
  isoDate
) => {
  if (!isoDate) {
    return "—";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
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
   DEFAULT IMPORT STATE
========================================================= */

const DEFAULT_IMPORT = {
  projectName:
    "Refinery Expansion Project",

  source: "Primavera P6",

  lastImported:
    "25 Sep 2026",

  activities: 4862,

  wbs: 127,

  milestones: 84,

  relationships: 6742,

  plannedProgress: 72,

  actualProgress: 67,

  variance: -5,
};

/* =========================================================
   PAGE
========================================================= */

const ImportSchedule = () => {
  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);

  /* -------------------------------------------------------
     FILE
  ------------------------------------------------------- */

  const [selectedFile, setSelectedFile] =
    useState(null);

  /* -------------------------------------------------------
     FLOW STATE
  ------------------------------------------------------- */

  const [uploadState, setUploadState] =
    useState("idle");

  /*
    idle
    validating
    validated
    imported
  */

  const [showPreview, setShowPreview] =
    useState(false);

  /* -------------------------------------------------------
     DRAG STATE
  ------------------------------------------------------- */

  const [isDragging, setIsDragging] =
    useState(false);

  /* -------------------------------------------------------
     ERROR / SUCCESS
  ------------------------------------------------------- */

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* -------------------------------------------------------
     IMPORT DATA
  ------------------------------------------------------- */

  const [importResult, setImportResult] =
    useState(DEFAULT_IMPORT);

  /* =======================================================
     FILE VALIDATION
  ======================================================= */

  const validateFile = (file) => {
    if (!file) {
      setErrorMessage(
        "Please select a schedule file."
      );
      return false;
    }

    const extension =
      getExtension(file.name);

    if (
      !SUPPORTED_EXTENSIONS.includes(
        extension
      )
    ) {
      setErrorMessage(
        "Unsupported file type. Please select a .XER, .XML, .XLSX, or .CSV file."
      );

      return false;
    }

    setErrorMessage("");

    return true;
  };

  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFileSelect = (
    file
  ) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setUploadState("idle");
    setShowPreview(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleInputChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    handleFileSelect(file);

    event.target.value = "";
  };

  /* =======================================================
     BROWSE
  ======================================================= */

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  /* =======================================================
     DRAG / DROP
  ======================================================= */

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    setIsDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    handleFileSelect(file);
  };

  /* =======================================================
     SIMULATED VALIDATION
  ======================================================= */

  const handleUploadAndValidate =
    () => {
      if (!selectedFile) {
        setErrorMessage(
          "Please select a schedule file before continuing."
        );

        return;
      }

      if (
        !validateFile(
          selectedFile
        )
      ) {
        return;
      }

      setErrorMessage("");
      setSuccessMessage("");
      setShowPreview(false);
      setUploadState(
        "validating"
      );

      /*
        IMPORTANT:
        No Primavera parser is used.
        This is intentionally simulated
        for the frontend MVP.
      */

      window.setTimeout(
        () => {
          setImportResult({
            ...DEFAULT_IMPORT,
            fileName:
              selectedFile.name,
            fileSize:
              selectedFile.size,
            fileType:
              getExtension(
                selectedFile.name
              ),
          });

          setUploadState(
            "validated"
          );
        },
        1000
      );
    };

  /* =======================================================
     PREVIEW
  ======================================================= */

  const handlePreview = () => {
    if (
      uploadState !==
      "validated"
    ) {
      return;
    }

    setShowPreview(
      (previous) =>
        !previous
    );
  };

  /* =======================================================
     CONFIRM IMPORT
  ======================================================= */

  const handleConfirmImport =
    () => {
      if (
        uploadState !==
        "validated"
      ) {
        return;
      }

      const importedAt =
        new Date().toISOString();

      const savedState = {
        ...importResult,

        projectName:
          "Refinery Expansion Project",

        source:
          "Primavera P6",

        lastImported:
          formatImportedDate(
            importedAt
          ),

        importedAt,

        fileName:
          selectedFile?.name ||
          importResult.fileName,

        fileSize:
          selectedFile?.size ||
          importResult.fileSize,

        fileType:
          selectedFile
            ? getExtension(
                selectedFile.name
              )
            : importResult.fileType,

        status:
          "VALIDATED",

        validationStatus:
          "VALIDATED",

        activities:
          4862,

        wbs:
          127,

        milestones:
          84,

        relationships:
          6742,

        plannedProgress:
          72,

        actualProgress:
          67,

        variance:
          -5,
      };

      localStorage.setItem(
        SCHEDULE_STORAGE_KEY,
        JSON.stringify(
          savedState
        )
      );

      setImportResult(
        savedState
      );

      setUploadState(
        "imported"
      );

      setShowPreview(
        false
      );

      setSuccessMessage(
        "Schedule imported successfully."
      );
    };

  /* =======================================================
     REMOVE FILE
  ======================================================= */

  const clearSelectedFile =
    () => {
      setSelectedFile(
        null
      );

      setUploadState(
        "idle"
      );

      setShowPreview(
        false
      );

      setErrorMessage("");
      setSuccessMessage("");
    };

  /* =======================================================
     EXISTING IMPORT
  ======================================================= */

  const existingImport =
    useMemo(
      () =>
        readScheduleState(),
      []
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <DashboardLayout
      title="Import Schedule"
    >
      <div className="import-schedule-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="import-page-header">

          <div>

            <button
              type="button"
              className="import-back-button"
              onClick={() =>
                navigate(
                  "/planning/dashboard"
                )
              }
            >
              <ArrowLeft size={15} />
              Planning Dashboard
            </button>

            <span className="import-eyebrow">
              PLANNING & CONTROL
            </span>

            <h2>
              Import Project Schedule
            </h2>

            <p>
              Upload a project schedule and validate
              it before making it available to the
              planning workflow.
            </p>

          </div>

        </div>

        {/* =================================================
            EXISTING IMPORT
        ================================================= */}

        {existingImport &&
          uploadState ===
            "idle" && (
          <div className="existing-import-banner">

            <div className="existing-import-icon">
              <CheckCircle2
                size={18}
              />
            </div>

            <div>

              <strong>
                Schedule already imported
              </strong>

              <span>
                {existingImport.fileName ||
                  "Imported schedule"}{" "}
                ·{" "}
                {existingImport.lastImported ||
                  "Previous import"}
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/planning/schedule"
                )
              }
            >
              View Schedule
              <ArrowRight
                size={15}
              />
            </button>

          </div>
        )}

        {/* =================================================
            UPLOAD CARD
        ================================================= */}

        <section className="import-card">

          <div className="import-card-header">

            <div className="import-card-icon">
              <FileSpreadsheet
                size={21}
              />
            </div>

            <div>

              <span>
                SCHEDULE SOURCE
              </span>

              <h3>
                Upload Primavera P6 Schedule
              </h3>

              <p>
                Supported formats: .XER, .XML, .XLSX,
                .CSV
              </p>

            </div>

          </div>

          {/* =================================================
              DROP AREA
          ================================================= */}

          {!selectedFile ? (
            <div
              className={`schedule-drop-area ${
                isDragging
                  ? "dragging"
                  : ""
              }`}
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={
                handleDrop
              }
            >

              <div className="schedule-drop-icon">
                <Upload size={26} />
              </div>

              <h3>
                Drop your schedule file here
              </h3>

              <p>
                or choose a file from your computer
              </p>

              <button
                type="button"
                className="browse-file-button"
                onClick={
                  openFilePicker
                }
              >
                <FolderOpen
                  size={16}
                />
                Browse Files
              </button>

              <span className="supported-formats">
                .XER · .XML · .XLSX · .CSV
              </span>

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept=".xer,.xml,.xlsx,.csv"
                onChange={
                  handleInputChange
                }
                hidden
              />

            </div>
          ) : (
            <div className="selected-file-area">

              <div className="selected-file-icon">
                <FileText
                  size={22}
                />
              </div>

              <div className="selected-file-info">

                <span>
                  SELECTED FILE
                </span>

                <strong>
                  {selectedFile.name}
                </strong>

                <small>
                  {formatFileSize(
                    selectedFile.size
                  )}{" "}
                  ·{" "}
                  {getExtension(
                    selectedFile.name
                  ).toUpperCase()}
                </small>

              </div>

              <button
                type="button"
                className="remove-file-button"
                onClick={
                  clearSelectedFile
                }
                aria-label="Remove selected schedule file"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage && (
            <div className="import-message error">

              <AlertCircle
                size={17}
              />

              <span>
                {errorMessage}
              </span>

            </div>
          )}

          {/* =================================================
              VALIDATING
          ================================================= */}

          {uploadState ===
            "validating" && (
            <div className="validation-loading">

              <RefreshCw
                size={20}
                className="import-spin"
              />

              <div>

                <strong>
                  Validating schedule...
                </strong>

                <span>
                  Checking file structure and schedule
                  metadata.
                </span>

              </div>

            </div>
          )}

          {/* =================================================
              ACTION
          ================================================= */}

          {selectedFile &&
            uploadState ===
              "idle" && (
            <div className="import-action-row">

              <div className="import-action-note">

                <ShieldIcon />

                <span>
                  Primavera parsing is simulated in this
                  frontend prototype.
                </span>

              </div>

              <button
                type="button"
                className="import-primary-button"
                onClick={
                  handleUploadAndValidate
                }
              >
                Upload & Validate
                <ArrowRight
                  size={16}
                />
              </button>

            </div>
          )}

        </section>

        {/* =================================================
            VALIDATION RESULT
        ================================================= */}

        {uploadState ===
          "validated" && (
          <section className="validation-card">

            <div className="validation-success-header">

              <div className="validation-check">
                <CheckCircle2
                  size={23}
                />
              </div>

              <div>

                <span>
                  VALIDATION COMPLETE
                </span>

                <h3>
                  File Validated
                </h3>

                <p>
                  The schedule passed the simulated
                  frontend validation.
                </p>

              </div>

              <span className="validated-badge">
                VALIDATED
              </span>

            </div>

            {/* =================================================
                METRICS
            ================================================= */}

            <div className="validation-metrics">

              <ValidationMetric
                label="Project"
                value={
                  importResult.projectName
                }
              />

              <ValidationMetric
                label="Source"
                value={
                  importResult.source
                }
              />

              <ValidationMetric
                label="Activities"
                value="4,862"
              />

              <ValidationMetric
                label="WBS"
                value="127"
              />

              <ValidationMetric
                label="Milestones"
                value="84"
              />

              <ValidationMetric
                label="Relationships"
                value="6,742"
              />

            </div>

            {/* =================================================
                FILE DETAILS
            ================================================= */}

            <div className="validated-file-row">

              <FileSpreadsheet
                size={17}
              />

              <div>

                <strong>
                  {
                    importResult.fileName
                  }
                </strong>

                <span>
                  {formatFileSize(
                    importResult.fileSize
                  )}{" "}
                  ·{" "}
                  {
                    importResult.fileType?.toUpperCase()
                  }
                </span>

              </div>

            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="validation-actions">

              <button
                type="button"
                className="import-secondary-button"
                onClick={
                  handlePreview
                }
              >
                <FileText
                  size={16}
                />

                {showPreview
                  ? "Hide Schedule Preview"
                  : "Preview Schedule"}
              </button>

              <button
                type="button"
                className="import-primary-button"
                onClick={
                  handleConfirmImport
                }
              >
                Confirm Import
                <CheckCircle2
                  size={16}
                />
              </button>

            </div>

            {/* =================================================
                PREVIEW
            ================================================= */}

            {showPreview && (
              <div className="schedule-preview">

                <div className="preview-header">

                  <div>

                    <span>
                      SCHEDULE PREVIEW
                    </span>

                    <h3>
                      Sample Activity View
                    </h3>

                    <p>
                      Showing representative schedule
                      rows for the prototype.
                    </p>

                  </div>

                  <span className="preview-count">
                    8 of 4,862 activities
                  </span>

                </div>

                <div className="schedule-table-wrapper">

                  <table className="schedule-preview-table">

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
                          Start
                        </th>

                        <th>
                          Finish
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {PREVIEW_ACTIVITIES.map(
                        (activity) => (
                          <tr
                            key={
                              activity.activityId
                            }
                          >

                            <td>
                              <strong>
                                {
                                  activity.activityId
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                activity.activityName
                              }
                            </td>

                            <td>
                              {
                                activity.wbs
                              }
                            </td>

                            <td>
                              {
                                activity.start
                              }
                            </td>

                            <td>
                              {
                                activity.finish
                              }
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

          </section>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {uploadState ===
          "imported" && (
          <section className="import-success-card">

            <div className="success-check-icon">
              <CheckCircle2
                size={34}
              />
            </div>

            <span>
              IMPORT COMPLETE
            </span>

            <h2>
              Schedule Imported Successfully
            </h2>

            <p>
              The validated schedule is now available
              to the Planning Engineer schedule and
              analysis screens.
            </p>

            <div className="success-import-summary">

              <div>

                <span>
                  PROJECT
                </span>

                <strong>
                  {
                    importResult.projectName
                  }
                </strong>

              </div>

              <div>

                <span>
                  SOURCE
                </span>

                <strong>
                  {
                    importResult.source
                  }
                </strong>

              </div>

              <div>

                <span>
                  IMPORTED
                </span>

                <strong>
                  {
                    importResult.lastImported
                  }
                </strong>

              </div>

              <div>

                <span>
                  ACTIVITIES
                </span>

                <strong>
                  4,862
                </strong>

              </div>

            </div>

            {successMessage && (
              <div className="import-message success">

                <CheckCircle2
                  size={17}
                />

                <span>
                  {successMessage}
                </span>

              </div>
            )}

            <div className="success-actions">

              <button
                type="button"
                className="import-secondary-button"
                onClick={() =>
                  navigate(
                    "/planning/dashboard"
                  )
                }
              >
                Back to Dashboard
              </button>

              <button
                type="button"
                className="import-primary-button"
                onClick={() =>
                  navigate(
                    "/planning/schedule"
                  )
                }
              >
                Open Schedule
                <ArrowRight
                  size={16}
                />
              </button>

            </div>

          </section>
        )}

      </div>
    </DashboardLayout>
  );
};

/* =========================================================
   VALIDATION METRIC
========================================================= */

const ValidationMetric = ({
  label,
  value,
}) => {
  return (
    <div className="validation-metric">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
};

/* =========================================================
   SMALL ICON
========================================================= */

const ShieldIcon = () => {
  return (
    <span className="shield-mini">
      <CheckCircle2
        size={14}
      />
    </span>
  );
};

export default ImportSchedule;