export const ROLES = Object.freeze({
  EMPLOYER: "employer",
  CANDIDATE: "candidate",
} as const);

export const INTERVIEW_STATUS = Object.freeze({
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
} as const);

export const SESSION_MODE = Object.freeze({
  EMPLOYER_INVITE: "employer_invite",
  MOCK: "mock",
} as const);

export const SESSION_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
} as const);
