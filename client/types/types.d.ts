export type UserRole = "employer" | "candidate";

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

export interface GeneratedQuestion {
  text: string;
  type: "technical" | "behavioral" | "situational";
  difficulty: number;
}

export interface AnswerEvaluation {
  score: number;
  technicalAccuracy: number;
  communication: number;
  confidence: number;
  feedback: string;
}

export interface SessionAnswer {
  questionIndex: number;
  questionText: string;
  isFollowUp?: boolean;
  transcript?: string;
  evaluation?: AnswerEvaluation;
}

export interface OverallReport {
  totalScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  hiringRecommendation: "Strong Yes" | "Yes" | "Maybe" | "No";
}

export interface IInterview {
  _id: string;
  employerId: string;
  title: string;
  jobDescription: string;
  status: "draft" | "active" | "closed";
  inviteCode?: string;
  isMockInterview?: boolean;
  generatedQuestions: GeneratedQuestion[];
  createdAt: string;
  updatedAt?: string;
}

export interface ISession {
  _id: string;
  interviewId: string | IInterview;
  candidateId: string | Pick<IUser, "_id" | "name" | "email">;
  mode: "employer_invite" | "mock";
  status: "pending" | "in_progress" | "completed" | "abandoned";
  answers: SessionAnswer[];
  overallReport?: OverallReport;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
