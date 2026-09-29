import { createContext, useContext, useState } from "react";

import {
  defaultProjectState,
  users,
} from "../data/mockData";

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projectState, setProjectState] = useState(
    defaultProjectState
  );

  const [currentUser, setCurrentUser] = useState(users[0]);

  const updateProjectState = (updates) => {
    setProjectState((previousState) => ({
      ...previousState,
      ...updates,
    }));
  };

  const addFieldUpdate = (newUpdate) => {
    setProjectState((previousState) => ({
      ...previousState,

      fieldUpdates: [
        newUpdate,
        ...previousState.fieldUpdates,
      ],
    }));
  };

  const addIssue = (newIssue) => {
    setProjectState((previousState) => ({
      ...previousState,

      issues: [
        newIssue,
        ...previousState.issues,
      ],
    }));
  };

  const addPlannerReview = (newReview) => {
    setProjectState((previousState) => ({
      ...previousState,

      plannerReviews: [
        newReview,
        ...previousState.plannerReviews,
      ],
    }));
  };

  const updatePlannerReview = (reviewId, updates) => {
    setProjectState((previousState) => ({
      ...previousState,

      plannerReviews:
        previousState.plannerReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                ...updates,
              }
            : review
        ),
    }));
  };

  const updateActivity = (activityId, updates) => {
    setProjectState((previousState) => ({
      ...previousState,

      activities:
        previousState.activities.map((activity) =>
          activity.id === activityId
            ? {
                ...activity,
                ...updates,
              }
            : activity
        ),
    }));
  };

  const login = (email, password, roleKey) => {
    const user = users.find(
      (item) =>
        item.email === email &&
        item.password === password &&
        item.roleKey === roleKey
    );

    if (!user) {
      return {
        success: false,
        message:
          "Invalid email, password, or role.",
      };
    }

    setCurrentUser(user);

    return {
      success: true,
      user,
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    projectState,
    currentUser,

    setCurrentUser,

    updateProjectState,

    addFieldUpdate,
    addIssue,

    addPlannerReview,
    updatePlannerReview,

    updateActivity,

    login,
    logout,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      "useProject must be used inside ProjectProvider"
    );
  }

  return context;
};