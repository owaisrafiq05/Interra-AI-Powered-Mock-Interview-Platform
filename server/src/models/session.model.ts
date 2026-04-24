import { Schema, models, model, Model, Types, Document } from "mongoose";
import { SESSION_MODE, SESSION_STATUS } from "../utils/constants";
import {
  AnswerEvaluation,
  OverallReport,
  SessionAnswer,
} from "../types/type";

export interface ISession extends Document {
  interviewId: Types.ObjectId;
  candidateId: Types.ObjectId;
  mode: (typeof SESSION_MODE)[keyof typeof SESSION_MODE];
  status: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
  answers: SessionAnswer[];
  overallReport?: OverallReport;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerEvaluationSchema = new Schema<AnswerEvaluation>(
  {
    score: { type: Number, required: true },
    technicalAccuracy: { type: Number, required: true },
    communication: { type: Number, required: true },
    confidence: { type: Number, required: true },
    feedback: { type: String, required: true },
  },
  { _id: false }
);

const SessionAnswerSchema = new Schema<SessionAnswer>(
  {
    questionIndex: { type: Number, required: true },
    questionText: { type: String, required: true },
    isFollowUp: { type: Boolean, default: false },
    audioPath: String,
    transcript: String,
    evaluation: AnswerEvaluationSchema,
  },
  { _id: false }
);

const OverallReportSchema = new Schema<OverallReport>(
  {
    totalScore: { type: Number, required: true },
    summary: { type: String, required: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    hiringRecommendation: {
      type: String,
      enum: ["Strong Yes", "Yes", "Maybe", "No"],
      required: true,
    },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: Object.values(SESSION_MODE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.PENDING,
    },
    answers: { type: [SessionAnswerSchema], default: [] },
    overallReport: OverallReportSchema,
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

SessionSchema.index({ interviewId: 1, candidateId: 1 });

export const Session: Model<ISession> =
  models.Session || model<ISession>("Session", SessionSchema);
