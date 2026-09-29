import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  ImagePlus,
  MapPin,
  Mic,
  PenLine,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext.jsx";

import "./CaptureProgress.css";

/* ============================================================
   SCHEDULED ACTIVITIES
============================================================ */

const scheduledActivities = [
  {
    id: "L6-CIV-021",
    name: "Foundation Work",
    discipline: "Civil",
    location: "Km 12+000 - Km 12+500",
    wbs: "Civil > Foundation",
    plannedProgress: 72,
    plannedStart: "2026-09-22",
    plannedFinish: "2026-09-28",
    unit: "m³",
  },

  {
    id: "L6-CIV-022",
    name: "Earthwork Excavation",
    discipline: "Civil",
    location: "Km 12+000 - Km 12+500",
    wbs: "Civil > Earthwork",
    plannedProgress: 66,
    plannedStart: "2026-09-23",
    plannedFinish: "2026-09-29",
    unit: "m³",
  },

  {
    id: "L6-CIV-023",
    name: "Drainage Work",
    discipline: "Civil",
    location: "Area-A North Zone",
    wbs: "Civil > Drainage",
    plannedProgress: 78,
    plannedStart: "2026-09-24",
    plannedFinish: "2026-09-30",
    unit: "m",
  },

  {
    id: "L6-PIP-024",
    name: "Erect Line 24-XX",
    discipline: "Piping",
    location: "Unit-02 / Pipe Rack",
    wbs: "Piping > Erection",
    plannedProgress: 45,
    plannedStart: "2026-09-24",
    plannedFinish: "2026-10-01",
    unit: "Nos.",
  },

  {
    id: "L6-ELE-017",
    name: "Cable Laying",
    discipline: "Electrical",
    location: "Substation-A",
    wbs: "Electrical > Cable",
    plannedProgress: 52,
    plannedStart: "2026-09-25",
    plannedFinish: "2026-10-02",
    unit: "m",
  },

  {
    id: "L6-INS-012",
    name: "Instrument Installation",
    discipline: "Instrumentation",
    location: "Control Area",
    wbs: "Instrumentation",
    plannedProgress: 38,
    plannedStart: "2026-09-26",
    plannedFinish: "2026-10-04",
    unit: "Nos.",
  },

  {
    id: "L6-MEC-008",
    name: "Equipment Installation",
    discipline: "Mechanical",
    location: "Equipment Yard",
    wbs: "Mechanical > Installation",
    plannedProgress: 61,
    plannedStart: "2026-09-25",
    plannedFinish: "2026-10-03",
    unit: "Nos.",
  },
];

const units = [
  "m",
  "m²",
  "m³",
  "Nos.",
  "Tons",
  "%",
];

const issueTypes = [
  "Material Delay",
  "Manpower Constraint",
  "Equipment Breakdown",
  "Safety Concern",
  "Drawing / Design Issue",
  "Weather",
  "Access Restriction",
  "Other",
];

const REPORT_STORAGE_KEY =
  "progressBridgeFieldEvents";

const ISSUE_STORAGE_KEY =
  "progressBridgeIssues";

const PLANNER_STORAGE_KEY =
  "progressBridgePlannerReviews";

/* ============================================================
   HELPERS
============================================================ */

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

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

const calculateDuration = (
  actualStart,
  actualEnd
) => {
  if (!actualStart || !actualEnd) {
    return "—";
  }

  const start = new Date(actualStart);
  const end = new Date(actualEnd);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "—";
  }

  const difference = end - start;

  if (difference < 0) {
    return "—";
  }

  const totalMinutes = Math.floor(
    difference / 60000
  );

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
};

const readStorageArray = (key) => {
  try {
    const stored =
      localStorage.getItem(key);

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
};

const appendToStorageArray = (
  key,
  item
) => {
  const existing =
    readStorageArray(key);

  localStorage.setItem(
    key,
    JSON.stringify([
      ...existing,
      item,
    ])
  );
};

const normalizeConfidence = (
  value
) => {
  const number = Number(value);

  if (
    Number.isNaN(number) ||
    number < 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(number)
  );
};

/* ============================================================
   IMAGE PROCESSING
============================================================ */

const compressImage = (
  file,
  maxDimension = 1280,
  quality = 0.72
) => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        const image =
          new Image();

        image.onload = () => {
          let width =
            image.width;

          let height =
            image.height;

          if (
            width > maxDimension ||
            height > maxDimension
          ) {
            const scale =
              Math.min(
                maxDimension /
                  width,
                maxDimension /
                  height
              );

            width =
              Math.round(
                width * scale
              );

            height =
              Math.round(
                height * scale
              );
          }

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            width;

          canvas.height =
            height;

          const context =
            canvas.getContext(
              "2d"
            );

          if (!context) {
            reject(
              new Error(
                "Canvas is not supported."
              )
            );

            return;
          }

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          resolve(
            canvas.toDataURL(
              "image/jpeg",
              quality
            )
          );
        };

        image.onerror =
          () => {
            reject(
              new Error(
                `Could not decode ${file.name}`
              )
            );
          };

        image.src =
          reader.result;
      };

      reader.onerror =
        () => {
          reject(
            new Error(
              `Could not read ${file.name}`
            )
          );
        };

      reader.readAsDataURL(
        file
      );
    }
  );
};

/* ============================================================
   CAMERA MODAL STYLES
   Kept inside JSX so no additional CSS file is required.
============================================================ */

const cameraOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background:
    "rgba(7, 20, 35, 0.82)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const cameraModalStyle = {
  width: "min(720px, 100%)",
  background: "#ffffff",
  borderRadius: "16px",
  boxShadow:
    "0 25px 70px rgba(0,0,0,0.28)",
  overflow: "hidden",
};

const cameraHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent:
    "space-between",
  padding: "16px 18px",
  borderBottom:
    "1px solid #e7edf3",
};

const cameraPreviewStyle = {
  width: "100%",
  aspectRatio: "16 / 10",
  display: "block",
  objectFit: "cover",
  background: "#081522",
};

const cameraFooterStyle = {
  display: "flex",
  justifyContent:
    "flex-end",
  gap: "10px",
  padding: "14px 18px",
  borderTop:
    "1px solid #e7edf3",
};

/* ============================================================
   COMPONENT
============================================================ */

const CaptureProgress = () => {
  const navigate =
    useNavigate();

  const {
    currentUser,
  } = useAuth();

  const fileInputRef =
    useRef(null);

  const videoRef =
    useRef(null);

  const cameraStreamRef =
    useRef(null);

  /* ----------------------------------------------------------
     WORKFLOW
  ---------------------------------------------------------- */

  const [
    captureStep,
    setCaptureStep,
  ] = useState("method");

  const [
    captureMethod,
    setCaptureMethod,
  ] = useState(null);

  /* ----------------------------------------------------------
     INPUT DATA
  ---------------------------------------------------------- */

  const [
    manualData,
    setManualData,
  ] = useState({
    activityId: "",
    activityDescription: "",
    quantity: "",
    unit: "",
    location: "",
    remarks: "",
  });

  const [
    voiceData,
    setVoiceData,
  ] = useState({
    transcript: "",
    recordingStarted: false,
    recordingComplete: false,
  });

  /* ----------------------------------------------------------
     MATCHING
  ---------------------------------------------------------- */

  const [
    matchingResult,
    setMatchingResult,
  ] = useState(null);

  const [
    plannerReview,
    setPlannerReview,
  ] = useState(false);

  /* ----------------------------------------------------------
     ACTUAL EXECUTION
  ---------------------------------------------------------- */

  const [
    actualStart,
    setActualStart,
  ] = useState(null);

  const [
    actualEnd,
    setActualEnd,
  ] = useState(null);

  const [
    actualProgress,
    setActualProgress,
  ] = useState(0);

  const [
    progressNotes,
    setProgressNotes,
  ] = useState("");

  const [
    isCompleted,
    setIsCompleted,
  ] = useState(false);

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  /* ----------------------------------------------------------
     EVIDENCE
  ---------------------------------------------------------- */

  const [
    evidenceFiles,
    setEvidenceFiles,
  ] = useState([]);

  const [
    photoInputMode,
    setPhotoInputMode,
  ] = useState("upload");

  const [
    cameraOpen,
    setCameraOpen,
  ] = useState(false);

  const [
    cameraLoading,
    setCameraLoading,
  ] = useState(false);

  const [
    cameraError,
    setCameraError,
  ] = useState("");

  /* ----------------------------------------------------------
     ISSUE
  ---------------------------------------------------------- */

  const [
    issueData,
    setIssueData,
  ] = useState({
    enabled: false,
    type: "",
    description: "",
    severity: "Medium",
  });

  /* ----------------------------------------------------------
     SUBMISSION
  ---------------------------------------------------------- */

  const [
    submittedEvent,
    setSubmittedEvent,
  ] = useState(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /* ==========================================================
     DERIVED DATA
  ========================================================== */

  const selectedActivity =
    useMemo(() => {
      const activityId =
        matchingResult?.activity?.id ||
        manualData.activityId;

      return (
        scheduledActivities.find(
          (activity) =>
            activity.id ===
            activityId
        ) || null
      );
    }, [
      matchingResult,
      manualData.activityId,
    ]);

  const fieldDescription =
    captureMethod ===
    "voice"
      ? voiceData.transcript.trim()
      : manualData.activityDescription.trim();

  const effectiveLocation =
    manualData.location ||
    selectedActivity?.location ||
    "";

  const actualDuration =
    useMemo(
      () =>
        calculateDuration(
          actualStart,
          actualEnd
        ),
      [
        actualStart,
        actualEnd,
      ]
    );

  const currentStepNumber =
    useMemo(() => {
      const steps = {
        method: 1,
        input: 2,
        matching: 3,
        progress: 4,
        evidence: 5,
        review: 6,
        submitted: 7,
      };

      return (
        steps[captureStep] ||
        1
      );
    }, [captureStep]);

  const hasStarted =
    Boolean(actualStart);

  const hasEnded =
    Boolean(actualEnd);

  /* ==========================================================
     CAMERA CLEANUP
  ========================================================== */

  const stopCamera = () => {
    const stream =
      cameraStreamRef.current;

    if (stream) {
      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    }

    cameraStreamRef.current =
      null;

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraOpen(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => {
      const stream =
        cameraStreamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  /* ==========================================================
     METHOD
  ========================================================== */

  const handleMethodSelect = (
    method
  ) => {
    setCaptureMethod(method);
    setCaptureStep("input");
    setActionMessage("");
  };

  /* ==========================================================
     MANUAL INPUT
  ========================================================== */

  const handleManualChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setManualData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* ==========================================================
     VOICE CAPTURE
  ========================================================== */

  const startVoiceCapture = () => {
    setVoiceData(
      (previous) => ({
        ...previous,
        recordingStarted:
          true,
        recordingComplete:
          false,
      })
    );

    window.setTimeout(
      () => {
        setVoiceData({
          transcript:
            "Spool 24 erection started at 8:40 AM at Km 12+500. Twelve spool sections were erected during today's shift.",
          recordingStarted:
            false,
          recordingComplete:
            true,
        });
      },
      1200
    );
  };

  const updateVoiceTranscript = (
    event
  ) => {
    setVoiceData(
      (previous) => ({
        ...previous,
        transcript:
          event.target.value,
        recordingComplete:
          Boolean(
            event.target.value.trim()
          ),
      })
    );
  };

  /* ==========================================================
     MATCHING
  ========================================================== */

  const runActivityMatching =
    () => {
      let result;

      if (
        captureMethod ===
        "manual"
      ) {
        const activity =
          scheduledActivities.find(
            (item) =>
              item.id ===
              manualData.activityId
          );

        if (activity) {
          result = {
            status: "MATCHED",
            confidence: 96,
            activity,
            reason:
              "Activity ID, location, and captured field information align with the scheduled activity.",
          };
        } else {
          result = {
            status:
              "PENDING_REVIEW",
            confidence: 42,
            activity: null,
            reason:
              "No scheduled activity could be confidently linked to the captured information.",
          };
        }
      } else {
        const transcript =
          voiceData.transcript
            .trim()
            .toLowerCase();

        if (
          transcript.includes(
            "spool"
          ) ||
          transcript.includes(
            "erection"
          ) ||
          transcript.includes(
            "pipe rack"
          )
        ) {
          const activity =
            scheduledActivities.find(
              (item) =>
                item.id ===
                "L6-PIP-024"
            );

          result = {
            status: "MATCHED",
            confidence: 91,
            activity,
            reason:
              "The voice description contains work and location cues associated with the scheduled piping activity.",
          };
        } else {
          result = {
            status:
              "PENDING_REVIEW",
            confidence: 56,
            activity: null,
            reason:
              "The description does not contain enough information for a confident schedule match.",
          };
        }
      }

      setMatchingResult(
        result
      );

      setPlannerReview(false);
      setCaptureStep(
        "matching"
      );
    };

  const handleInputContinue = (
    event
  ) => {
    event.preventDefault();

    if (
      captureMethod ===
        "voice" &&
      !voiceData.transcript.trim()
    ) {
      alert(
        "Please record or enter the site description first."
      );

      return;
    }

    if (
      captureMethod ===
        "manual" &&
      (
        !manualData.activityId ||
        !manualData.activityDescription.trim() ||
        !effectiveLocation
      )
    ) {
      alert(
        "Please complete the required activity, field description, and location."
      );

      return;
    }

    if (
      manualData.quantity !==
        "" &&
      Number.isNaN(
        Number(
          manualData.quantity
        )
      )
    ) {
      alert(
        "Quantity must be a valid number."
      );

      return;
    }

    runActivityMatching();
  };

  /* ==========================================================
     MATCH ACTIONS
  ========================================================== */

  const confirmMatch = () => {
    if (!selectedActivity) {
      alert(
        "No scheduled activity is available to confirm."
      );

      return;
    }

    setActualProgress(
      selectedActivity.plannedProgress ||
        0
    );

    setActualStart(null);
    setActualEnd(null);

    setIsCompleted(false);
    setActionMessage("");

    setCaptureStep(
      "progress"
    );
  };

  const chooseAnotherActivity =
    () => {
      setMatchingResult(null);
      setPlannerReview(false);
      setCaptureStep("input");
    };

  const sendToPlannerReview =
    () => {
      const reviewItem = {
        id: `PR-${Date.now()}`,

        fieldDescription,

        submittedBy:
          currentUser?.name ||
          "Ramesh Kumar",

        submittedAt:
          new Date().toISOString(),

        suggestedActivityId:
          matchingResult
            ?.activity?.id ||
          null,

        suggestedActivityName:
          matchingResult
            ?.activity?.name ||
          null,

        confidence:
          normalizeConfidence(
            matchingResult?.confidence
          ),

        candidateActivities:
          scheduledActivities.map(
            (activity) => ({
              id: activity.id,
              name: activity.name,
              discipline:
                activity.discipline,
              location:
                activity.location,
            })
          ),

        matchStatus:
          "PENDING_REVIEW",

        plannerDecision: null,
        reviewedBy: null,
        reviewedAt: null,
      };

      try {
        appendToStorageArray(
          PLANNER_STORAGE_KEY,
          reviewItem
        );
      } catch (error) {
        console.warn(
          "Could not save planner review:",
          error
        );
      }

      setPlannerReview(
        true
      );
    };

  /* ==========================================================
     START ACTIVITY
  ========================================================== */

  const startActivity = () => {
    if (!selectedActivity) {
      alert(
        "Please confirm a scheduled activity before starting it."
      );

      return;
    }

    if (hasStarted) {
      setActionMessage(
        "Activity has already been started."
      );

      return;
    }

    const timestamp =
      new Date().toISOString();

    setActualStart(
      timestamp
    );

    setActualEnd(null);
    setIsCompleted(false);

    setActionMessage(
      `Activity started at ${formatDateTime(
        timestamp
      )}.`
    );
  };

  /* ==========================================================
     END ACTIVITY
  ========================================================== */

  const endActivity = () => {
    if (!hasStarted) {
      alert(
        "Activity must be started before it can be ended."
      );

      return;
    }

    if (hasEnded) {
      setActionMessage(
        "Activity has already been ended."
      );

      return;
    }

    const timestamp =
      new Date().toISOString();

    setActualEnd(
      timestamp
    );

    setActualProgress(100);
    setIsCompleted(true);

    setActionMessage(
      `Activity ended at ${formatDateTime(
        timestamp
      )}.`
    );
  };

  /* ==========================================================
     PROGRESS
  ========================================================== */

  const handleProgressChange =
    (event) => {
      const value =
        Number(
          event.target.value
        );

      setActualProgress(
        value
      );

      if (value < 100) {
        setIsCompleted(false);
      }

      if (
        value === 100 &&
        !hasEnded
      ) {
        setActionMessage(
          "End the activity to record the actual end timestamp."
        );
      }
    };

  const handleCompletedChange =
    (event) => {
      const checked =
        event.target.checked;

      if (!checked) {
        setIsCompleted(false);

        return;
      }

      if (!hasStarted) {
        alert(
          "Please start the activity before completing it."
        );

        return;
      }

      if (!hasEnded) {
        endActivity();

        return;
      }

      setActualProgress(100);
      setIsCompleted(true);
    };

  const handleProgressContinue =
    (event) => {
      event.preventDefault();

      if (!hasStarted) {
        alert(
          "Please start the activity before continuing."
        );

        return;
      }

      if (
        actualProgress === 0 &&
        !isCompleted
      ) {
        alert(
          "Please enter the actual progress achieved today."
        );

        return;
      }

      if (
        actualProgress === 100 &&
        !hasEnded
      ) {
        alert(
          "Please end the activity before submitting 100% completion."
        );

        return;
      }

      if (
        !progressNotes.trim()
      ) {
        alert(
          "Please enter progress notes."
        );

        return;
      }

      setCaptureStep(
        "evidence"
      );
    };

  /* ==========================================================
     OPEN UPLOAD FILE PICKER
  ========================================================== */

  const openUploadPicker =
    () => {
      setPhotoInputMode(
        "upload"
      );

      window.setTimeout(
        () => {
          fileInputRef.current?.click();
        },
        0
      );
    };

  /* ==========================================================
     START CAMERA
  ========================================================== */

  const startCamera = async () => {
    setCameraError("");
    setCameraLoading(true);
    setPhotoInputMode(
      "camera"
    );

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraLoading(false);

      setCameraError(
        "Camera access is not supported by this browser."
      );

      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal:
                  "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          }
        );

      cameraStreamRef.current =
        stream;

      setCameraOpen(true);

      window.setTimeout(
        async () => {
          if (
            videoRef.current
          ) {
            videoRef.current.srcObject =
              stream;

            try {
              await videoRef.current.play();
            } catch (error) {
              console.warn(
                "Camera video could not autoplay:",
                error
              );
            }
          }

          setCameraLoading(
            false
          );
        },
        50
      );
    } catch (error) {
      console.error(
        "Camera permission error:",
        error
      );

      setCameraLoading(false);

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setCameraError(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else if (
        error?.name ===
        "NotFoundError"
      ) {
        setCameraError(
          "No camera was found on this device."
        );
      } else {
        setCameraError(
          "Unable to open the camera."
        );
      }
    }
  };

  /* ==========================================================
     CAPTURE CAMERA PHOTO
  ========================================================== */

  const captureCameraPhoto =
    () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {
        alert(
          "Camera is still loading. Please try again."
        );

        return;
      }

      const canvas =
        document.createElement(
          "canvas"
        );

      const maxWidth =
        1280;

      const scale = Math.min(
        1,
        maxWidth /
          video.videoWidth
      );

      canvas.width =
        Math.round(
          video.videoWidth *
            scale
        );

      canvas.height =
        Math.round(
          video.videoHeight *
            scale
        );

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        alert(
          "Unable to capture the camera image."
        );

        return;
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert(
              "Camera image could not be created."
            );

            return;
          }

          const reader =
            new FileReader();

          reader.onload = () => {
            const now =
              new Date();

            const dataUrl =
              reader.result;

            const newEvidence = {
              id: `camera-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,

              name: `Site Photo ${now
                .toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )
                .replace(
                  /[: ]/g,
                  "-"
                )}.jpg`,

              size:
                blob.size,

              dataUrl,

              preview:
                dataUrl,

              capturedAt:
                now.toLocaleString(
                  "en-IN"
                ),

              location:
                effectiveLocation ||
                "Site location",

              source:
                "camera",
            };

            setEvidenceFiles(
              (previous) => [
                ...previous,
                newEvidence,
              ]
            );

            stopCamera();
          };

          reader.onerror = () => {
            alert(
              "The camera photo could not be processed."
            );
          };

          reader.readAsDataURL(
            blob
          );
        },
        "image/jpeg",
        0.78
      );
    };

  /* ==========================================================
     HANDLE UPLOADED FILES
  ========================================================== */

  const handleEvidenceSelect =
    async (event) => {
      const selectedFiles =
        Array.from(
          event.target.files ||
            []
        );

      if (
        selectedFiles.length ===
        0
      ) {
        return;
      }

      const imageFiles =
        selectedFiles.filter(
          (file) =>
            file.type &&
            file.type.startsWith(
              "image/"
            )
        );

      if (
        imageFiles.length === 0
      ) {
        alert(
          "Please select valid image files."
        );

        event.target.value =
          "";

        return;
      }

      try {
        const newFiles =
          await Promise.all(
            imageFiles.map(
              async (file) => {
                const dataUrl =
                  await compressImage(
                    file
                  );

                return {
                  id: `upload-${file.name}-${file.lastModified}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`,

                  name:
                    file.name,

                  size:
                    file.size,

                  dataUrl,

                  preview:
                    dataUrl,

                  capturedAt:
                    new Date().toLocaleString(
                      "en-IN"
                    ),

                  location:
                    effectiveLocation ||
                    "Site location",

                  source:
                    "upload",
                };
              }
            )
          );

        setEvidenceFiles(
          (previous) => [
            ...previous,
            ...newFiles,
          ]
        );
      } catch (error) {
        console.error(
          "Evidence processing failed:",
          error
        );

        alert(
          "One or more images could not be processed."
        );
      }

      event.target.value =
        "";
    };

  /* ==========================================================
     REMOVE EVIDENCE
  ========================================================== */

  const removeEvidence = (
    id
  ) => {
    setEvidenceFiles(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  /* ==========================================================
     ISSUE
  ========================================================== */

  const updateIssue = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setIssueData(
      (previous) => ({
        ...previous,
        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );
  };

  /* ==========================================================
     REVIEW VALIDATION
  ========================================================== */

  const continueToReview =
    () => {
      if (!hasStarted) {
        alert(
          "Please start the activity before submitting progress."
        );

        return;
      }

      if (
        actualProgress === 0 &&
        !isCompleted
      ) {
        alert(
          "Please enter the actual progress achieved today."
        );

        return;
      }

      if (
        actualProgress === 100 &&
        !hasEnded
      ) {
        alert(
          "Please end the activity before submitting 100% completion."
        );

        return;
      }

      if (
        !progressNotes.trim()
      ) {
        alert(
          "Please enter progress notes."
        );

        return;
      }

      if (
        manualData.quantity !==
          "" &&
        Number.isNaN(
          Number(
            manualData.quantity
          )
        )
      ) {
        alert(
          "Quantity must be a valid number."
        );

        return;
      }

      if (
        evidenceFiles.length ===
        0
      ) {
        const proceed =
          window.confirm(
            "No evidence has been attached. Do you want to continue without evidence?"
          );

        if (!proceed) {
          return;
        }
      }

      if (
        issueData.enabled &&
        !issueData.type
      ) {
        alert(
          "Please select an issue type."
        );

        return;
      }

      if (
        issueData.enabled &&
        !issueData.description.trim()
      ) {
        alert(
          "Please describe the site issue."
        );

        return;
      }

      setCaptureStep(
        "review"
      );
    };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit =
    async () => {
      if (isSubmitting) {
        return;
      }

      if (!selectedActivity) {
        alert(
          "No activity is linked to this progress update."
        );

        return;
      }

      if (!actualStart) {
        alert(
          "Actual start time is required."
        );

        return;
      }

      if (
        actualProgress === 100 &&
        !actualEnd
      ) {
        alert(
          "A 100% completed activity must have an actual end time."
        );

        return;
      }

      setIsSubmitting(
        true
      );

      await new Promise(
        (resolve) =>
          window.setTimeout(
            resolve,
            650
          )
      );

      const submittedAt =
        new Date().toISOString();

      const confidence =
        normalizeConfidence(
          matchingResult?.confidence
        );

      const status =
        isCompleted
          ? "Completed"
          : "Started";

      const eventData = {
        id: `FE-${Date.now()}`,

        activityId:
          selectedActivity.id,

        activityName:
          selectedActivity.name,

        discipline:
          selectedActivity.discipline,

        fieldDescription,

        status,

        plannedStart:
          selectedActivity.plannedStart ||
          null,

        plannedFinish:
          selectedActivity.plannedFinish ||
          null,

        actualStart,

        actualEnd:
          actualEnd ||
          null,

        actualDuration:
          calculateDuration(
            actualStart,
            actualEnd
          ),

        quantity:
          manualData.quantity !==
          ""
            ? Number(
                manualData.quantity
              )
            : null,

        unit:
          manualData.unit ||
          selectedActivity.unit ||
          null,

        location:
          effectiveLocation ||
          null,

        remarks:
          manualData.remarks.trim(),

        progressNotes:
          progressNotes.trim(),

        actualProgress,

        evidence:
          evidenceFiles.map(
            (item) => ({
              id: item.id,

              name:
                item.name,

              size:
                item.size,

              capturedAt:
                item.capturedAt,

              location:
                item.location,

              source:
                item.source,

              src:
                item.dataUrl ||
                item.preview ||
                "",
            })
          ),

        evidenceCount:
          evidenceFiles.length,

        source:
          captureMethod ||
          "manual",

        confidence,

        matchStatus:
          matchingResult?.status ||
          "UNMATCHED",

        submittedBy:
          currentUser?.name ||
          "Ramesh Kumar",

        submittedAt,

        issue:
          issueData.enabled
            ? {
                type:
                  issueData.type,

                severity:
                  issueData.severity,

                description:
                  issueData.description.trim(),
              }
            : null,
      };

      try {
        appendToStorageArray(
          REPORT_STORAGE_KEY,
          eventData
        );

        if (
          issueData.enabled
        ) {
          const savedIssue = {
            id: `ISS-${Date.now()}`,

            activityId:
              selectedActivity.id,

            issueType:
              issueData.type,

            severity:
              issueData.severity,

            description:
              issueData.description.trim(),

            evidence:
              eventData.evidence,

            reportedBy:
              currentUser?.name ||
              "Ramesh Kumar",

            reportedAt:
              submittedAt,

            status:
              "Open",
          };

          appendToStorageArray(
            ISSUE_STORAGE_KEY,
            savedIssue
          );
        }
      } catch (error) {
        console.error(
          "Could not persist field event:",
          error
        );

        alert(
          "The progress could not be saved. Please try again."
        );

        setIsSubmitting(
          false
        );

        return;
      }

      setSubmittedEvent(
        eventData
      );

      setIsSubmitting(
        false
      );

      setCaptureStep(
        "submitted"
      );
    };

  /* ==========================================================
     RESET
  ========================================================== */

  const startNewCapture =
    () => {
      stopCamera();

      setCaptureStep(
        "method"
      );

      setCaptureMethod(
        null
      );

      setManualData({
        activityId: "",
        activityDescription:
          "",
        quantity: "",
        unit: "",
        location: "",
        remarks: "",
      });

      setVoiceData({
        transcript: "",
        recordingStarted:
          false,
        recordingComplete:
          false,
      });

      setMatchingResult(
        null
      );

      setPlannerReview(
        false
      );

      setActualStart(
        null
      );

      setActualEnd(
        null
      );

      setActualProgress(
        0
      );

      setProgressNotes(
        ""
      );

      setIsCompleted(
        false
      );

      setActionMessage(
        ""
      );

      setEvidenceFiles(
        []
      );

      setIssueData({
        enabled: false,
        type: "",
        description: "",
        severity: "Medium",
      });

      setSubmittedEvent(
        null
      );

      setIsSubmitting(
        false
      );

      setCameraError(
        ""
      );
    };

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack = () => {
    if (
      captureStep ===
      "input"
    ) {
      setCaptureMethod(
        null
      );

      setCaptureStep(
        "method"
      );

      return;
    }

    if (
      captureStep ===
        "matching" &&
      plannerReview
    ) {
      setPlannerReview(
        false
      );

      return;
    }

    if (
      captureStep ===
      "matching"
    ) {
      setCaptureStep(
        "input"
      );

      return;
    }

    if (
      captureStep ===
      "progress"
    ) {
      setCaptureStep(
        "matching"
      );

      return;
    }

    if (
      captureStep ===
      "evidence"
    ) {
      setCaptureStep(
        "progress"
      );

      return;
    }

    if (
      captureStep ===
      "review"
    ) {
      setCaptureStep(
        "evidence"
      );

      return;
    }

    navigate(
      "/site-supervisor"
    );
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardLayout
      title="Capture Progress"
    >
      <div className="capture-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        {captureStep !==
          "submitted" && (
          <div className="capture-workflow-header">

            <div>
              <p className="page-eyebrow">
                FIELD EXECUTION
              </p>

              <h2>
                Capture Progress
              </h2>

              <p className="page-description">
                Record actual field progress
                and connect it to the project
                schedule.
              </p>
            </div>

            <button
              type="button"
              className="secondary-action"
              onClick={
                handleBack
              }
            >
              <ArrowLeft size={16} />
              Back
            </button>

          </div>
        )}

        {/* ==================================================
            STEPPER
        ================================================== */}

        {captureStep !==
          "method" &&
          captureStep !==
            "submitted" && (
          <div className="capture-stepper">

            {[
              "Report",
              "Details",
              "Match",
              "Progress",
              "Evidence",
              "Review",
            ].map(
              (
                step,
                index
              ) => {
                const number =
                  index + 1;

                return (
                  <div
                    key={step}
                    className={`stepper-item ${
                      number <=
                      currentStepNumber
                        ? "active"
                        : ""
                    } ${
                      number <
                      currentStepNumber
                        ? "completed"
                        : ""
                    }`}
                  >

                    <div className="stepper-number">

                      {number <
                      currentStepNumber ? (
                        <Check
                          size={13}
                        />
                      ) : (
                        number
                      )}

                    </div>

                    <span>
                      {step}
                    </span>

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* ==================================================
            METHOD SCREEN
        ================================================== */}

        {captureStep ===
          "method" && (
          <section className="method-screen">

            <div className="method-hero">

              <div className="method-hero-icon">
                <Camera size={25} />
              </div>

              <p className="page-eyebrow">
                FIELD EXECUTION
              </p>

              <h1>
                Capture Site Progress
              </h1>

              <p>
                Record what actually happened in
                the field and link it to the
                planned project schedule.
              </p>

            </div>

            <div className="method-card">

              <div className="method-card-title">

                <h3>
                  How do you want to report?
                </h3>

                <p>
                  Choose the fastest way to capture
                  today's field update.
                </p>

              </div>

              <div className="method-options">

                <button
                  type="button"
                  className="method-option"
                  onClick={() =>
                    handleMethodSelect(
                      "voice"
                    )
                  }
                >

                  <div className="method-option-icon voice">
                    <Mic size={28} />
                  </div>

                  <div className="method-option-copy">

                    <span>
                      VOICE CAPTURE
                    </span>

                    <h3>
                      Describe what happened
                    </h3>

                    <p>
                      Speak naturally about the work
                      carried out on site.
                    </p>

                  </div>

                  <ArrowRight
                    size={18}
                  />

                </button>

                <button
                  type="button"
                  className="method-option"
                  onClick={() =>
                    handleMethodSelect(
                      "manual"
                    )
                  }
                >

                  <div className="method-option-icon manual">
                    <PenLine size={28} />
                  </div>

                  <div className="method-option-copy">

                    <span>
                      MANUAL CAPTURE
                    </span>

                    <h3>
                      Enter details manually
                    </h3>

                    <p>
                      Select the activity and enter
                      structured field information.
                    </p>

                  </div>

                  <ArrowRight
                    size={18}
                  />

                </button>

              </div>

              <div className="method-note">

                <ShieldCheck
                  size={16}
                />

                <span>
                  Field data stays linked to the
                  selected project and scheduled
                  activity.
                </span>

              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            INPUT
        ================================================== */}

        {captureStep ===
          "input" && (
          <section className="capture-content">

            {captureMethod ===
            "voice" ? (
              <div className="capture-single-card">

                <div className="capture-card-heading">

                  <div className="capture-heading-icon voice">
                    <Mic size={20} />
                  </div>

                  <div>

                    <span>
                      VOICE CAPTURE
                    </span>

                    <h3>
                      Tell us what happened on site
                    </h3>

                  </div>

                </div>

                <div className="voice-main">

                  <div
                    className={`voice-record-button ${
                      voiceData.recordingStarted
                        ? "recording"
                        : ""
                    }`}
                  >
                    <Mic size={35} />
                  </div>

                  <h3>

                    {voiceData.recordingStarted
                      ? "Listening..."
                      : voiceData.recordingComplete
                      ? "Capture complete"
                      : "Ready to listen"}

                  </h3>

                  <p>
                    Describe the work, location,
                    timings, quantity, and any
                    important site issue.
                  </p>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={
                      startVoiceCapture
                    }
                    disabled={
                      voiceData.recordingStarted
                    }
                  >

                    <Mic size={17} />

                    {voiceData.recordingStarted
                      ? "Listening..."
                      : voiceData.recordingComplete
                      ? "Record Again"
                      : "Start Listening"}

                  </button>

                </div>

                <div className="voice-transcript-box">

                  <div className="field-label-row">

                    <label>
                      Captured Description
                    </label>

                    <span className="optional-label">
                      Editable
                    </span>

                  </div>

                  <textarea
                    value={
                      voiceData.transcript
                    }
                    onChange={
                      updateVoiceTranscript
                    }
                    placeholder="Your voice description will appear here..."
                    rows={5}
                  />

                </div>

                <div className="voice-example">

                  <FileText
                    size={17}
                  />

                  <div>

                    <span>
                      DEMO EXAMPLE
                    </span>

                    <p>
                      “Spool 24 erection started
                      at 8:40 AM at Km 12+500.
                      Twelve spool sections were
                      erected during today's shift.”
                    </p>

                  </div>

                </div>

                <div className="capture-actions">

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={
                      handleBack
                    }
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={
                      handleInputContinue
                    }
                  >
                    Find Scheduled Activity
                    <Search size={17} />
                  </button>

                </div>

              </div>
            ) : (
              <form
                className="capture-single-card manual-form"
                onSubmit={
                  handleInputContinue
                }
              >

                <div className="capture-card-heading">

                  <div className="capture-heading-icon manual">
                    <PenLine size={20} />
                  </div>

                  <div>

                    <span>
                      MANUAL CAPTURE
                    </span>

                    <h3>
                      Enter Field Information
                    </h3>

                  </div>

                </div>

                <div className="form-section-title">
                  Activity Information
                </div>

                <div className="form-group">

                  <label htmlFor="activityId">
                    Activity / Work ID
                    <em>*</em>
                  </label>

                  <select
                    id="activityId"
                    name="activityId"
                    value={
                      manualData.activityId
                    }
                    onChange={
                      handleManualChange
                    }
                  >

                    <option value="">
                      Select a scheduled activity
                    </option>

                    {scheduledActivities.map(
                      (activity) => (
                        <option
                          key={
                            activity.id
                          }
                          value={
                            activity.id
                          }
                        >
                          {activity.id} —{" "}
                          {activity.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="form-group">

                  <label htmlFor="activityDescription">
                    Field Description
                    <em>*</em>
                  </label>

                  <textarea
                    id="activityDescription"
                    name="activityDescription"
                    value={
                      manualData.activityDescription
                    }
                    onChange={
                      handleManualChange
                    }
                    placeholder="Describe the work carried out on site..."
                    rows={4}
                  />

                </div>

                <div className="form-section-title">
                  Quantity
                </div>

                <div className="form-grid two">

                  <div className="form-group">

                    <label htmlFor="quantity">
                      Quantity
                    </label>

                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        manualData.quantity
                      }
                      onChange={
                        handleManualChange
                      }
                      placeholder="e.g. 120"
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="unit">
                      Unit
                    </label>

                    <select
                      id="unit"
                      name="unit"
                      value={
                        manualData.unit
                      }
                      onChange={
                        handleManualChange
                      }
                    >

                      <option value="">
                        Select unit
                      </option>

                      {units.map(
                        (unit) => (
                          <option
                            key={unit}
                            value={unit}
                          >
                            {unit}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

                <div className="form-section-title">
                  Location & Remarks
                </div>

                <div className="form-group">

                  <label htmlFor="location">
                    Location
                    <em>*</em>
                  </label>

                  <div className="input-icon">

                    <MapPin size={16} />

                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={
                        manualData.location
                      }
                      onChange={
                        handleManualChange
                      }
                      placeholder="e.g. Unit-02 / Pipe Rack"
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="remarks">
                    Remarks
                  </label>

                  <textarea
                    id="remarks"
                    name="remarks"
                    value={
                      manualData.remarks
                    }
                    onChange={
                      handleManualChange
                    }
                    placeholder="Add observations, constraints, or additional remarks..."
                    rows={4}
                  />

                </div>

                <div className="capture-actions">

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={
                      handleBack
                    }
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="primary-action"
                  >
                    Find Scheduled Activity
                    <Search size={17} />
                  </button>

                </div>

              </form>
            )}

          </section>
        )}

        {/* ==================================================
            MATCHING
        ================================================== */}

        {captureStep ===
          "matching" &&
          !plannerReview &&
          matchingResult && (
          <section className="capture-content">

            <div className="matching-layout">

              <div className="matching-main">

                <div className="capture-single-card">

                  <div className="capture-card-heading">

                    <div className="capture-heading-icon search">
                      <Search size={20} />
                    </div>

                    <div>

                      <span>
                        ACTIVITY MATCH
                      </span>

                      <h3>
                        Confirm Scheduled Activity
                      </h3>

                    </div>

                  </div>

                  <div className="captured-report">

                    <div className="captured-report-top">

                      <span>
                        CAPTURED FIELD REPORT
                      </span>

                    </div>

                    {captureMethod ===
                    "voice" ? (
                      <p className="captured-voice-text">
                        {
                          voiceData.transcript
                        }
                      </p>
                    ) : (
                      <>
                        <div className="captured-report-grid">

                          <div>

                            <span>
                              ACTIVITY
                            </span>

                            <strong>
                              {
                                manualData.activityId
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              LOCATION
                            </span>

                            <strong>
                              {
                                effectiveLocation
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              QUANTITY
                            </span>

                            <strong>
                              {manualData.quantity
                                ? `${manualData.quantity} ${
                                    manualData.unit ||
                                    ""
                                  }`
                                : "—"}
                            </strong>

                          </div>

                          <div>

                            <span>
                              SOURCE
                            </span>

                            <strong>
                              Manual
                            </strong>

                          </div>

                        </div>

                        <div className="captured-description">

                          <span>
                            FIELD DESCRIPTION
                          </span>

                          <strong>
                            {
                              manualData.activityDescription
                            }
                          </strong>

                        </div>
                      </>
                    )}

                  </div>

                  {matchingResult.status ===
                    "MATCHED" && (
                    <div className="match-panel matched">

                      <div className="match-header">

                        <div className="match-status-icon success">
                          <CheckCircle2 size={21} />
                        </div>

                        <div className="match-header-copy">

                          <span>
                            SCHEDULED MATCH
                          </span>

                          <h3>
                            Suggested Activity
                          </h3>

                        </div>

                        <div className="confidence-badge high">
                          {
                            matchingResult.confidence
                          }
                          %
                        </div>

                      </div>

                      <div className="matched-activity">

                        <div className="matched-activity-main">

                          <span>
                            {
                              matchingResult.activity.id
                            }
                          </span>

                          <h3>
                            {
                              matchingResult.activity.name
                            }
                          </h3>

                          <p>
                            {
                              matchingResult
                                .activity
                                .discipline
                            }{" "}
                            ·{" "}
                            {
                              matchingResult
                                .activity
                                .location
                            }
                          </p>

                        </div>

                        <div className="matched-activity-side">

                          <div>

                            <span>
                              WBS
                            </span>

                            <strong>
                              {
                                matchingResult
                                  .activity
                                  .wbs
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              PLANNED PROGRESS
                            </span>

                            <strong>
                              {
                                matchingResult
                                  .activity
                                  .plannedProgress
                              }
                              %
                            </strong>

                          </div>

                        </div>

                      </div>

                      <div className="confidence-block">

                        <div className="confidence-row">

                          <span>
                            MATCH CONFIDENCE
                          </span>

                          <strong>
                            {
                              matchingResult.confidence
                            }
                            %
                          </strong>

                        </div>

                        <div className="confidence-track">

                          <div
                            className="confidence-value high"
                            style={{
                              width: `${matchingResult.confidence}%`,
                            }}
                          />

                        </div>

                        <p>
                          {
                            matchingResult.reason
                          }
                        </p>

                      </div>

                      <div className="match-actions">

                        <button
                          type="button"
                          className="secondary-action"
                          onClick={
                            chooseAnotherActivity
                          }
                        >
                          Change Activity
                        </button>

                        <button
                          type="button"
                          className="primary-action"
                          onClick={
                            confirmMatch
                          }
                        >
                          Confirm Match
                          <ArrowRight
                            size={17}
                          />
                        </button>

                      </div>

                    </div>
                  )}

                  {matchingResult.status ===
                    "PENDING_REVIEW" && (
                    <div className="match-panel pending">

                      <div className="match-header">

                        <div className="match-status-icon warning">
                          <AlertTriangle size={21} />
                        </div>

                        <div className="match-header-copy">

                          <span>
                            PENDING REVIEW
                          </span>

                          <h3>
                            No confident schedule match
                          </h3>

                        </div>

                        <div className="confidence-badge low">
                          {
                            matchingResult.confidence
                          }
                          %
                        </div>

                      </div>

                      <div className="pending-message">

                        <AlertTriangle
                          size={17}
                        />

                        <p>
                          The field report could not
                          be confidently linked to a
                          scheduled activity. You can
                          select another activity or
                          send the report to the planner
                          for review.
                        </p>

                      </div>

                      <div className="confidence-block">

                        <div className="confidence-row">

                          <span>
                            MATCH CONFIDENCE
                          </span>

                          <strong>
                            {
                              matchingResult.confidence
                            }
                            %
                          </strong>

                        </div>

                        <div className="confidence-track">

                          <div
                            className="confidence-value low"
                            style={{
                              width: `${matchingResult.confidence}%`,
                            }}
                          />

                        </div>

                        <p>
                          {
                            matchingResult.reason
                          }
                        </p>

                      </div>

                      <div className="match-actions">

                        <button
                          type="button"
                          className="secondary-action"
                          onClick={
                            chooseAnotherActivity
                          }
                        >
                          Choose Activity
                        </button>

                        <button
                          type="button"
                          className="primary-action warning-action"
                          onClick={
                            sendToPlannerReview
                          }
                        >
                          Send to Planner Review
                          <ArrowRight
                            size={17}
                          />
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </div>

              <aside className="matching-side-card">

                <span>
                  WHAT HAPPENS NEXT?
                </span>

                <div className="next-step">

                  <div className="next-step-number">
                    01
                  </div>

                  <div>

                    <strong>
                      Confirm the activity
                    </strong>

                    <p>
                      Verify the suggested scheduled
                      work.
                    </p>

                  </div>

                </div>

                <div className="next-step">

                  <div className="next-step-number">
                    02
                  </div>

                  <div>

                    <strong>
                      Start the activity
                    </strong>

                    <p>
                      The system records the actual
                      start automatically.
                    </p>

                  </div>

                </div>

                <div className="next-step">

                  <div className="next-step-number">
                    03
                  </div>

                  <div>

                    <strong>
                      Add site evidence
                    </strong>

                    <p>
                      Attach photos and field
                      observations.
                    </p>

                  </div>

                </div>

              </aside>

            </div>

          </section>
        )}

        {/* ==================================================
            PLANNER REVIEW
        ================================================== */}

        {captureStep ===
          "matching" &&
          plannerReview && (
          <section className="center-state">

            <div className="planner-review-card">

              <div className="planner-review-icon">
                <AlertTriangle
                  size={30}
                />
              </div>

              <span className="page-eyebrow">
                PLANNER REVIEW
              </span>

              <h2>
                Activity needs planner review
              </h2>

              <p>
                This field report remains
                unlinked because the activity
                matching confidence is below the
                acceptance threshold.
              </p>

              <div className="planner-review-info">

                <div>

                  <span>
                    STATUS
                  </span>

                  <strong>
                    PENDING_REVIEW
                  </strong>

                </div>

                <div>

                  <span>
                    CONFIDENCE
                  </span>

                  <strong>
                    {
                      matchingResult?.confidence
                    }%
                  </strong>

                </div>

              </div>

              <div className="capture-actions center">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    setPlannerReview(
                      false
                    )
                  }
                >
                  Back to Match
                </button>

                <button
                  type="button"
                  className="primary-action"
                  onClick={
                    startNewCapture
                  }
                >
                  Start New Capture
                </button>

              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            PROGRESS
        ================================================== */}

        {captureStep ===
          "progress" && (
          <section className="capture-content">

            <div className="progress-layout">

              <form
                className="capture-single-card"
                onSubmit={
                  handleProgressContinue
                }
              >

                <div className="capture-card-heading">

                  <div className="capture-heading-icon progress">
                    <CheckCircle2
                      size={20}
                    />
                  </div>

                  <div>

                    <span>
                      PROGRESS UPDATE
                    </span>

                    <h3>
                      Actual Field Progress
                    </h3>

                  </div>

                </div>

                {actionMessage && (
                  <div className="method-note">

                    <Clock3
                      size={16}
                    />

                    <span>
                      {actionMessage}
                    </span>

                  </div>
                )}

                <div className="confirmed-activity">

                  <div>

                    <span>
                      ACTIVITY
                    </span>

                    <strong>
                      {
                        selectedActivity?.id
                      }
                    </strong>

                    <p>
                      {
                        selectedActivity?.name
                      }
                    </p>

                  </div>

                  <div>

                    <span>
                      LOCATION
                    </span>

                    <strong>
                      {
                        effectiveLocation ||
                        selectedActivity?.location
                      }
                    </strong>

                  </div>

                  <div>

                    <span>
                      PLANNED
                    </span>

                    <strong>
                      {
                        selectedActivity?.plannedProgress
                      }
                      %
                    </strong>

                  </div>

                </div>

                <div className="form-section-title">
                  Activity Timing
                </div>

                <div className="form-grid two">

                  <div className="duration-card">

                    <div>

                      <Clock3
                        size={17}
                      />

                      <span>
                        Actual Start
                      </span>

                    </div>

                    <strong>
                      {actualStart
                        ? formatTime(
                            actualStart
                          )
                        : "Not started"}
                    </strong>

                  </div>

                  <div className="duration-card">

                    <div>

                      <Clock3
                        size={17}
                      />

                      <span>
                        Actual End
                      </span>

                    </div>

                    <strong>
                      {actualEnd
                        ? formatTime(
                            actualEnd
                          )
                        : "Not ended"}
                    </strong>

                  </div>

                </div>

                <div className="capture-actions">

                  <button
                    type="button"
                    className="primary-action"
                    onClick={
                      startActivity
                    }
                    disabled={
                      hasStarted ||
                      hasEnded
                    }
                  >

                    <Clock3
                      size={17}
                    />

                    {hasStarted
                      ? "Activity Started"
                      : "Start Activity"}

                  </button>

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={
                      endActivity
                    }
                    disabled={
                      !hasStarted ||
                      hasEnded
                    }
                  >

                    <CheckCircle2
                      size={17}
                    />

                    {hasEnded
                      ? "Activity Ended"
                      : "End Activity"}

                  </button>

                </div>

                <div className="duration-card">

                  <div>

                    <Clock3
                      size={17}
                    />

                    <span>
                      Actual Duration
                    </span>

                  </div>

                  <strong>
                    {actualDuration}
                  </strong>

                </div>

                <div className="progress-input-section">

                  <div className="progress-label-row">

                    <div>

                      <label>
                        Actual Progress Achieved
                        Today
                      </label>

                      <p>
                        Enter the actual field
                        progress, not the planned
                        progress.
                      </p>

                    </div>

                    <strong className="large-progress-value">
                      {actualProgress}%
                    </strong>

                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={
                      actualProgress
                    }
                    onChange={
                      handleProgressChange
                    }
                    className="progress-slider"
                    disabled={
                      !hasStarted
                    }
                  />

                  <div className="slider-scale">

                    <span>
                      0%
                    </span>

                    <span>
                      25%
                    </span>

                    <span>
                      50%
                    </span>

                    <span>
                      75%
                    </span>

                    <span>
                      100%
                    </span>

                  </div>

                </div>

                <label className="completion-checkbox">

                  <input
                    type="checkbox"
                    checked={
                      isCompleted
                    }
                    onChange={
                      handleCompletedChange
                    }
                  />

                  <div className="completion-check-icon">
                    <CheckCircle2
                      size={17}
                    />
                  </div>

                  <div>

                    <strong>
                      Mark activity as completed
                    </strong>

                    <span>
                      Sets actual progress to 100%
                      and records the end time.
                    </span>

                  </div>

                </label>

                <div className="form-group">

                  <label htmlFor="progressNotes">
                    Progress Notes
                    <em>*</em>
                  </label>

                  <textarea
                    id="progressNotes"
                    value={
                      progressNotes
                    }
                    onChange={(event) =>
                      setProgressNotes(
                        event.target.value
                      )
                    }
                    placeholder="Describe what was actually completed today..."
                    rows={6}
                  />

                </div>

                <div className="capture-actions">

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      setCaptureStep(
                        "matching"
                      )
                    }
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="primary-action"
                    disabled={
                      !hasStarted
                    }
                  >
                    Continue to Evidence
                    <ArrowRight
                      size={17}
                    />
                  </button>

                </div>

              </form>

              <aside className="summary-card">

                <span>
                  CAPTURED FIELD DATA
                </span>

                <div className="summary-item">

                  <span>
                    START TIME
                  </span>

                  <strong>
                    {actualStart
                      ? formatTime(
                          actualStart
                        )
                      : "Not started"}
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    END TIME
                  </span>

                  <strong>
                    {actualEnd
                      ? formatTime(
                          actualEnd
                        )
                      : "Not ended"}
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    DURATION
                  </span>

                  <strong>
                    {actualDuration}
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    QUANTITY
                  </span>

                  <strong>
                    {manualData.quantity
                      ? `${manualData.quantity} ${
                          manualData.unit ||
                          selectedActivity?.unit ||
                          ""
                        }`
                      : "Not specified"}
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    LOCATION
                  </span>

                  <strong>
                    {
                      effectiveLocation
                    }
                  </strong>

                </div>

                <div className="summary-match">

                  <CheckCircle2
                    size={17}
                  />

                  <div>

                    <span>
                      MATCHED
                    </span>

                    <strong>
                      {
                        matchingResult?.confidence
                      }%
                      confidence
                    </strong>

                  </div>

                </div>

              </aside>

            </div>

          </section>
        )}

        {/* ==================================================
            EVIDENCE
        ================================================== */}

        {captureStep ===
          "evidence" && (
          <section className="capture-content">

            <div className="progress-layout">

              <div className="capture-single-card">

                <div className="capture-card-heading">

                  <div className="capture-heading-icon evidence">
                    <ImagePlus
                      size={20}
                    />
                  </div>

                  <div>

                    <span>
                      FIELD EVIDENCE
                    </span>

                    <h3>
                      Add Photos & Site Evidence
                    </h3>

                  </div>

                </div>

                {/* ==================================================
                    PHOTO ACTION BUTTONS
                    Only these open camera/file picker.
                ================================================== */}

                <div className="form-grid two">

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={
                      startCamera
                    }
                    disabled={
                      cameraLoading
                    }
                  >

                    <Camera
                      size={17}
                    />

                    {cameraLoading
                      ? "Opening Camera..."
                      : "Take Photo"}

                  </button>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={
                      openUploadPicker
                    }
                  >

                    <Upload
                      size={17}
                    />

                    Upload Photo

                  </button>

                </div>

                {/* ==================================================
                    NON-CLICKABLE DROPZONE
                    IMPORTANT: no onClick here.
                ================================================== */}

                <div className="evidence-dropzone">

                  <div className="evidence-upload-icon">

                    <Upload
                      size={23}
                    />

                  </div>

                  <h3>
                    Add photos or site evidence
                  </h3>

                  <p>
                    Use Take Photo for the camera or
                    Upload Photo to choose an image.
                  </p>

                  <span>
                    JPG, PNG, WEBP supported
                  </span>

                  {/* Hidden upload input.
                      Only buttons above trigger it. */}

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleEvidenceSelect
                    }
                    hidden
                  />

                </div>

                {/* ==================================================
                    ATTACHED EVIDENCE
                ================================================== */}

                {evidenceFiles.length >
                  0 && (
                  <div className="evidence-section">

                    <div className="evidence-heading-row">

                      <div>

                        <span>
                          ATTACHED EVIDENCE
                        </span>

                        <h3>
                          {
                            evidenceFiles.length
                          }{" "}
                          {
                            evidenceFiles.length ===
                            1
                              ? "file"
                              : "files"
                          }
                        </h3>

                      </div>

                      <button
                        type="button"
                        className="secondary-action small"
                        onClick={
                          openUploadPicker
                        }
                      >

                        <ImagePlus
                          size={15}
                        />

                        Add More

                      </button>

                    </div>

                    <div className="evidence-grid">

                      {evidenceFiles.map(
                        (item) => (
                          <div
                            className="evidence-card"
                            key={
                              item.id
                            }
                          >

                            <div className="evidence-image">

                              <img
                                src={
                                  item.preview
                                }
                                alt={
                                  item.name
                                }
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeEvidence(
                                    item.id
                                  )
                                }
                                aria-label={`Remove ${item.name}`}
                              >
                                <X
                                  size={15}
                                />
                              </button>

                            </div>

                            <div className="evidence-info">

                              <strong>
                                {
                                  item.name
                                }
                              </strong>

                              <span>
                                {(
                                  item.size /
                                  1024
                                ).toFixed(
                                  0
                                )}{" "}
                                KB
                              </span>

                              <span>

                                <MapPin
                                  size={12}
                                />

                                {
                                  item.location
                                }

                              </span>

                              <span>

                                <Clock3
                                  size={12}
                                />

                                {
                                  item.capturedAt
                                }

                              </span>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

                {evidenceFiles.length ===
                  0 && (
                  <div className="no-evidence-note">

                    <Camera
                      size={17}
                    />

                    <div>

                      <strong>
                        No evidence attached yet
                      </strong>

                      <p>
                        Evidence is recommended but not
                        mandatory for every field update.
                      </p>

                    </div>

                  </div>
                )}

                {/* ==================================================
                    ISSUE
                ================================================== */}

                <div className="issue-section">

                  <div className="issue-header">

                    <div className="issue-title-icon">
                      <AlertTriangle
                        size={18}
                      />
                    </div>

                    <div>

                      <span>
                        SITE ISSUE
                      </span>

                      <h3>
                        Report a field problem
                      </h3>

                    </div>

                    <label className="switch">

                      <input
                        type="checkbox"
                        name="enabled"
                        checked={
                          issueData.enabled
                        }
                        onChange={
                          updateIssue
                        }
                      />

                      <span className="switch-slider" />

                    </label>

                  </div>

                  {issueData.enabled && (
                    <div className="issue-form">

                      <div className="form-grid two">

                        <div className="form-group">

                          <label htmlFor="issueType">
                            Issue Type
                            <em>*</em>
                          </label>

                          <select
                            id="issueType"
                            name="type"
                            value={
                              issueData.type
                            }
                            onChange={
                              updateIssue
                            }
                          >

                            <option value="">
                              Select issue type
                            </option>

                            {issueTypes.map(
                              (type) => (
                                <option
                                  key={
                                    type
                                  }
                                  value={
                                    type
                                  }
                                >
                                  {type}
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        <div className="form-group">

                          <label htmlFor="severity">
                            Severity
                          </label>

                          <select
                            id="severity"
                            name="severity"
                            value={
                              issueData.severity
                            }
                            onChange={
                              updateIssue
                            }
                          >

                            <option value="Low">
                              Low
                            </option>

                            <option value="Medium">
                              Medium
                            </option>

                            <option value="High">
                              High
                            </option>

                          </select>

                        </div>

                      </div>

                      <div className="form-group">

                        <label htmlFor="issueDescription">
                          Issue Description
                          <em>*</em>
                        </label>

                        <textarea
                          id="issueDescription"
                          name="description"
                          value={
                            issueData.description
                          }
                          onChange={
                            updateIssue
                          }
                          placeholder="Describe the issue, impact, and what attention is required..."
                          rows={4}
                        />

                      </div>

                    </div>
                  )}

                </div>

                <div className="capture-actions">

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() =>
                      setCaptureStep(
                        "progress"
                      )
                    }
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="primary-action"
                    onClick={
                      continueToReview
                    }
                  >
                    Continue to Review
                    <ArrowRight
                      size={17}
                    />
                  </button>

                </div>

              </div>

              <aside className="summary-card">

                <span>
                  UPDATE SUMMARY
                </span>

                <div className="summary-progress">

                  <div>

                    <span>
                      ACTUAL PROGRESS
                    </span>

                    <strong>
                      {actualProgress}%
                    </strong>

                  </div>

                  <div className="summary-progress-track">

                    <div
                      style={{
                        width: `${actualProgress}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="summary-item">

                  <span>
                    ACTIVITY
                  </span>

                  <strong>
                    {
                      selectedActivity?.id
                    }
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    WORK
                  </span>

                  <strong>
                    {
                      selectedActivity?.name
                    }
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    STARTED
                  </span>

                  <strong>
                    {actualStart
                      ? formatTime(
                          actualStart
                        )
                      : "Not started"}
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    EVIDENCE
                  </span>

                  <strong>
                    {
                      evidenceFiles.length
                    }{" "}
                    {
                      evidenceFiles.length ===
                      1
                        ? "file"
                        : "files"
                    }
                  </strong>

                </div>

                <div className="summary-item">

                  <span>
                    SITE ISSUE
                  </span>

                  <strong>
                    {issueData.enabled
                      ? "Reported"
                      : "None"}
                  </strong>

                </div>

              </aside>

            </div>

          </section>
        )}

        {/* ==================================================
            REVIEW
        ================================================== */}

        {captureStep ===
          "review" && (
          <section className="capture-content">

            <div className="review-page">

              <div className="review-header-card">

                <div className="review-header-icon">
                  <ShieldCheck
                    size={22}
                  />
                </div>

                <div>

                  <span>
                    FINAL REVIEW
                  </span>

                  <h2>
                    Review before submitting
                  </h2>

                  <p>
                    Verify the field update before
                    it is recorded against the project.
                  </p>

                </div>

              </div>

              <div className="review-grid">

                <div className="review-main">

                  {/* ACTIVITY */}
                  <div className="review-card">

                    <div className="review-card-heading">

                      <FileText
                        size={18}
                      />

                      <div>

                        <span>
                          ACTIVITY
                        </span>

                        <h3>
                          Scheduled Activity
                        </h3>

                      </div>

                    </div>

                    <div className="review-activity">

                      <div>

                        <span>
                          ACTIVITY ID
                        </span>

                        <strong>
                          {
                            selectedActivity?.id
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          WORK
                        </span>

                        <strong>
                          {
                            selectedActivity?.name
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          LOCATION
                        </span>

                        <strong>
                          {
                            effectiveLocation
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          MATCH
                        </span>

                        <strong>
                          {
                            matchingResult?.confidence
                          }%
                          confidence
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* FIELD DESCRIPTION */}
                  <div className="review-card">

                    <div className="review-card-heading">

                      <FileText
                        size={18}
                      />

                      <div>

                        <span>
                          FIELD DESCRIPTION
                        </span>

                        <h3>
                          What happened on site
                        </h3>

                      </div>

                    </div>

                    <div className="review-note">

                      {
                        fieldDescription ||
                        "No field description recorded."
                      }

                    </div>

                  </div>

                  {/* PROGRESS */}
                  <div className="review-card">

                    <div className="review-card-heading">

                      <CheckCircle2
                        size={18}
                      />

                      <div>

                        <span>
                          ACTUAL PROGRESS
                        </span>

                        <h3>
                          Field Progress Update
                        </h3>

                      </div>

                    </div>

                    <div className="review-progress-display">

                      <div className="review-progress-number">
                        {actualProgress}%
                      </div>

                      <div className="review-progress-side">

                        <div className="summary-progress-track">

                          <div
                            style={{
                              width: `${actualProgress}%`,
                            }}
                          />

                        </div>

                        <p>
                          {isCompleted
                            ? "Activity completed."
                            : "Activity remains in progress."}
                        </p>

                      </div>

                    </div>

                    <div className="review-note">
                      {
                        progressNotes
                      }
                    </div>

                  </div>

                  {/* TIMING */}
                  <div className="review-card">

                    <div className="review-card-heading">

                      <Clock3
                        size={18}
                      />

                      <div>

                        <span>
                          FIELD TIMING
                        </span>

                        <h3>
                          Actual Execution Time
                        </h3>

                      </div>

                    </div>

                    <div className="review-details-grid">

                      <div>

                        <span>
                          START
                        </span>

                        <strong>
                          {actualStart
                            ? formatDateTime(
                                actualStart
                              )
                            : "—"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          END
                        </span>

                        <strong>
                          {actualEnd
                            ? formatDateTime(
                                actualEnd
                              )
                            : "—"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          DURATION
                        </span>

                        <strong>
                          {
                            actualDuration
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          STATUS
                        </span>

                        <strong>
                          {isCompleted
                            ? "Completed"
                            : "Started"}
                        </strong>

                      </div>

                      <div className="full">

                        <span>
                          LOCATION
                        </span>

                        <strong>
                          {
                            effectiveLocation
                          }
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* QUANTITY */}
                  <div className="review-card">

                    <div className="review-card-heading">

                      <PenLine
                        size={18}
                      />

                      <div>

                        <span>
                          QUANTITY
                        </span>

                        <h3>
                          Field Measurement
                        </h3>

                      </div>

                    </div>

                    <div className="review-details-grid">

                      <div>

                        <span>
                          QUANTITY
                        </span>

                        <strong>
                          {manualData.quantity
                            ? `${manualData.quantity} ${
                                manualData.unit ||
                                selectedActivity?.unit ||
                                ""
                              }`
                            : "Not specified"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          UNIT
                        </span>

                        <strong>
                          {
                            manualData.unit ||
                            selectedActivity?.unit ||
                            "—"
                          }
                        </strong>

                      </div>

                    </div>

                  </div>

                  {/* EVIDENCE */}
                  <div className="review-card">

                    <div className="review-card-heading">

                      <ImagePlus
                        size={18}
                      />

                      <div>

                        <span>
                          EVIDENCE
                        </span>

                        <h3>
                          Attached Site Evidence
                        </h3>

                      </div>

                    </div>

                    {evidenceFiles.length ===
                    0 ? (
                      <div className="review-empty">
                        No evidence attached.
                      </div>
                    ) : (
                      <div className="review-evidence-row">

                        {evidenceFiles.map(
                          (item) => (
                            <div
                              key={
                                item.id
                              }
                              className="review-evidence-thumb"
                            >

                              <img
                                src={
                                  item.preview
                                }
                                alt={
                                  item.name
                                }
                              />

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                  {/* ISSUE */}
                  {issueData.enabled && (
                    <div className="review-card">

                      <div className="review-card-heading">

                        <AlertTriangle
                          size={18}
                        />

                        <div>

                          <span>
                            SITE ISSUE
                          </span>

                          <h3>
                            Reported Field Problem
                          </h3>

                        </div>

                      </div>

                      <div className="review-issue">

                        <div>

                          <span>
                            TYPE
                          </span>

                          <strong>
                            {
                              issueData.type
                            }
                          </strong>

                        </div>

                        <div>

                          <span>
                            SEVERITY
                          </span>

                          <strong>
                            {
                              issueData.severity
                            }
                          </strong>

                        </div>

                        <p>
                          {
                            issueData.description
                          }
                        </p>

                      </div>

                    </div>
                  )}

                </div>

                {/* SIDE */}
                <aside className="review-side-card">

                  <div className="review-submit-status">

                    <CheckCircle2
                      size={18}
                    />

                    <div>

                      <span>
                        READY TO SUBMIT
                      </span>

                      <strong>
                        All captured information
                        can now be recorded.
                      </strong>

                    </div>

                  </div>

                  <div className="review-checklist">

                    <div>

                      <Check
                        size={15}
                      />

                      <span>
                        Activity verified
                      </span>

                    </div>

                    <div>

                      <Check
                        size={15}
                      />

                      <span>
                        Actual start recorded
                      </span>

                    </div>

                    <div>

                      <Check
                        size={15}
                      />

                      <span>
                        Progress entered
                      </span>

                    </div>

                    <div>

                      <Check
                        size={15}
                      />

                      <span>
                        Field details reviewed
                      </span>

                    </div>

                    <div>

                      <Check
                        size={15}
                      />

                      <span>
                        Evidence reviewed
                      </span>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="primary-action full-width"
                    onClick={
                      handleSubmit
                    }
                    disabled={
                      isSubmitting
                    }
                  >

                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Progress Update"}

                    {!isSubmitting && (
                      <ArrowRight
                        size={17}
                      />
                    )}

                  </button>

                  <button
                    type="button"
                    className="secondary-action full-width"
                    onClick={() =>
                      setCaptureStep(
                        "evidence"
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                  >
                    Edit Evidence
                  </button>

                </aside>

              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {captureStep ===
          "submitted" &&
          submittedEvent && (
          <section className="center-state submitted-state">

            <div className="success-card">

              <div className="success-icon">
                <CheckCircle2
                  size={36}
                />
              </div>

              <span className="page-eyebrow">
                UPDATE SUBMITTED
              </span>

              <h1>
                Field progress recorded
              </h1>

              <p>
                The field update has been
                captured successfully and stored
                as a project progress event.
              </p>

              <div className="success-summary">

                <div>

                  <span>
                    ACTIVITY
                  </span>

                  <strong>
                    {
                      submittedEvent.activityId
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    ACTUAL PROGRESS
                  </span>

                  <strong>
                    {
                      submittedEvent.actualProgress
                    }%
                  </strong>

                </div>

                <div>

                  <span>
                    STATUS
                  </span>

                  <strong>
                    {
                      submittedEvent.status
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    STARTED
                  </span>

                  <strong>
                    {formatTime(
                      submittedEvent.actualStart
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    EVIDENCE
                  </span>

                  <strong>
                    {
                      submittedEvent.evidenceCount
                    }{" "}
                    {
                      submittedEvent.evidenceCount ===
                      1
                        ? "file"
                        : "files"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    CONFIDENCE
                  </span>

                  <strong>
                    {
                      submittedEvent.confidence
                    }%
                  </strong>

                </div>

              </div>

              <div className="success-actions">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    navigate(
                      "/site-supervisor"
                    )
                  }
                >
                  Back to Dashboard
                </button>

                <button
                  type="button"
                  className="primary-action"
                  onClick={
                    startNewCapture
                  }
                >
                  Capture Another Update
                  <ArrowRight
                    size={17}
                  />
                </button>

              </div>

            </div>

          </section>
        )}

      </div>

      {/* ======================================================
          CAMERA MODAL
      ====================================================== */}

      {cameraOpen && (
        <div
          style={
            cameraOverlayStyle
          }
        >

          <div
            style={
              cameraModalStyle
            }
          >

            <div
              style={
                cameraHeaderStyle
              }
            >

              <div>

                <strong
                  style={{
                    color:
                      "#173553",
                    fontSize:
                      "15px",
                  }}
                >
                  Take Site Photo
                </strong>

                <div
                  style={{
                    marginTop:
                      "3px",
                    color:
                      "#7e91a5",
                    fontSize:
                      "11px",
                  }}
                >
                  Position the site work inside
                  the camera frame.
                </div>

              </div>

              <button
                type="button"
                onClick={
                  stopCamera
                }
                style={{
                  border: "0",
                  background:
                    "#f1f4f7",
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "50%",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  cursor:
                    "pointer",
                  color:
                    "#536b82",
                }}
                aria-label="Close camera"
              >
                <X
                  size={18}
                />
              </button>

            </div>

            {cameraError ? (
              <div
                style={{
                  padding:
                    "45px 25px",
                  textAlign:
                    "center",
                  color:
                    "#8a5c0b",
                  background:
                    "#fff8e8",
                }}
              >

                <Camera
                  size={36}
                />

                <h3
                  style={{
                    margin:
                      "12px 0 6px",
                    color:
                      "#76530e",
                  }}
                >
                  Camera unavailable
                </h3>

                <p
                  style={{
                    margin:
                      0,
                    fontSize:
                      "12px",
                  }}
                >
                  {cameraError}
                </p>

              </div>
            ) : (
              <video
                ref={
                  videoRef
                }
                style={
                  cameraPreviewStyle
                }
                autoPlay
                muted
                playsInline
              />
            )}

            <div
              style={
                cameraFooterStyle
              }
            >

              <button
                type="button"
                className="secondary-action"
                onClick={
                  stopCamera
                }
              >
                Close
              </button>

              {!cameraError && (
                <button
                  type="button"
                  className="primary-action"
                  onClick={
                    captureCameraPhoto
                  }
                  disabled={
                    cameraLoading
                  }
                >
                  <Camera
                    size={17}
                  />
                  Capture Photo
                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
};

export default CaptureProgress;