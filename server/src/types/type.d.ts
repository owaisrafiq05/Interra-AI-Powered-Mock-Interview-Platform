import { Document } from "mongoose";
import { ROLES } from "../utils/constants";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface IUser extends Document {
  email: string;
  password: string;
  phone?: string;
  address?: string;
  name: string;
  role: "employer" | "candidate";
  avatar?: string;
  hasNotifications: boolean;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
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
  audioPath?: string;
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
