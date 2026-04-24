import { Schema, models, model, Model, Types, Document } from "mongoose";
import { INTERVIEW_STATUS } from "../utils/constants";
import { GeneratedQuestion } from "../types/type";

export interface IInterview extends Document {
  employerId: Types.ObjectId;
  title: string;
  jobDescription: string;
  status: (typeof INTERVIEW_STATUS)[keyof typeof INTERVIEW_STATUS];
  inviteCode?: string;
  isMockInterview: boolean;
  generatedQuestions: GeneratedQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedQuestionSchema = new Schema<GeneratedQuestion>(
  {
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["technical", "behavioral", "situational"],
      required: true,
    },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const InterviewSchema = new Schema<IInterview>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.DRAFT,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    isMockInterview: { type: Boolean, default: false },
    generatedQuestions: {
      type: [GeneratedQuestionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

InterviewSchema.index({ employerId: 1, status: 1 });

export const Interview: Model<IInterview> =
  models.Interview || model<IInterview>("Interview", InterviewSchema);
