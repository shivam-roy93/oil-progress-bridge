// ============================================================
// PROGRESS BRIDGE - CALCULATION UTILITIES
// ============================================================

// Calculate progress variance
export const calculateVariance = (planned, actual) => {
  return Number(actual) - Number(planned);
};

// Calculate percentage of completion
export const calculateCompletionPercentage = (
  completed,
  total
) => {
  if (!total || total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
};

// Calculate average progress
export const calculateAverageProgress = (activities) => {
  if (!activities || activities.length === 0) {
    return 0;
  }

  const totalProgress = activities.reduce(
    (sum, activity) =>
      sum + Number(activity.actualProgress || 0),
    0
  );

  return Math.round(totalProgress / activities.length);
};

// Calculate average planned progress
export const calculateAveragePlannedProgress = (activities) => {
  if (!activities || activities.length === 0) {
    return 0;
  }

  const totalProgress = activities.reduce(
    (sum, activity) =>
      sum + Number(activity.plannedProgress || 0),
    0
  );

  return Math.round(totalProgress / activities.length);
};

// Calculate delayed activities
export const getDelayedActivities = (activities) => {
  if (!activities) {
    return [];
  }

  return activities.filter(
    (activity) => Number(activity.variance || 0) < 0
  );
};

// Calculate critical activities
export const getCriticalActivities = (activities) => {
  if (!activities) {
    return [];
  }

  return activities.filter(
    (activity) =>
      activity.severity === "Critical" ||
      Number(activity.daysBehind || 0) >= 5
  );
};

// Calculate overall project statistics
export const calculateProjectStatistics = (activities) => {
  if (!activities || activities.length === 0) {
    return {
      totalActivities: 0,
      averagePlannedProgress: 0,
      averageActualProgress: 0,
      variance: 0,
      delayedActivities: 0,
      criticalActivities: 0,
    };
  }

  const averagePlannedProgress =
    calculateAveragePlannedProgress(activities);

  const averageActualProgress =
    calculateAverageProgress(activities);

  return {
    totalActivities: activities.length,
    averagePlannedProgress,
    averageActualProgress,

    variance:
      averageActualProgress - averagePlannedProgress,

    delayedActivities:
      getDelayedActivities(activities).length,

    criticalActivities:
      getCriticalActivities(activities).length,
  };
};

// Determine activity status from variance
export const getActivityStatus = (variance) => {
  const value = Number(variance);

  if (value >= 0) {
    return "Healthy";
  }

  if (value >= -5) {
    return "Warning";
  }

  return "Delayed";
};

// Determine severity from delay
export const getActivitySeverity = (daysBehind) => {
  const days = Number(daysBehind);

  if (days >= 5) {
    return "Critical";
  }

  if (days >= 2) {
    return "High";
  }

  if (days >= 1) {
    return "Medium";
  }

  return "Low";
};

// Format variance for displaying in the UI
export const formatVariance = (variance) => {
  const value = Number(variance);

  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
};

// Calculate schedule health
export const getScheduleHealth = (variance) => {
  const value = Number(variance);

  if (value >= 0) {
    return "Healthy";
  }

  if (value >= -5) {
    return "Medium";
  }

  return "High Risk";
};