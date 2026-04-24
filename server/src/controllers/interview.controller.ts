import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Interview } from "../models/interview.model";
import { Session } from "../models/session.model";
import { throwError } from "../utils/helpers";
import { ROLES, INTERVIEW_STATUS } from "../utils/constants";
import { generateQuestionsFromJD } from "../services/gemini.service";
import { generateUniqueInviteCode } from "../utils/inviteCode";

function requireEmployer(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): req is AuthRequest & { user: NonNullable<AuthRequest["user"]> } {
  if (!req.user) {
    next(throwError("Unauthorized", 401));
    return false as any;
  }
  if (req.user.role !== ROLES.EMPLOYER) {
    next(throwError("Employer access only", 403));
    return false as any;
  }
  return true;
}

export const createInterview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireEmployer(req, res, next)) return;

    const { title, jobDescription } = req.body;
    if (!title || !jobDescription)
      return next(throwError("title and jobDescription are required", 400));

    const generatedQuestions = await generateQuestionsFromJD(
      String(jobDescription)
    );

    const interview = await Interview.create({
      employerId: req.user._id,
      title: String(title).trim(),
      jobDescription: String(jobDescription).trim(),
      status: INTERVIEW_STATUS.DRAFT,
      generatedQuestions,
      isMockInterview: false,
    });

    return res.status(201).json({
      success: true,
      message: "Interview created (draft). Activate to get invite link.",
      data: interview,
    });
  } catch (e) {
    return next(e);
  }
};

export const listInterviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireEmployer(req, res, next)) return;

    const list = await Interview.find({ employerId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, data: list });
  } catch (e) {
    return next(e);
  }
};

export const getInterviewById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireEmployer(req, res, next)) return;

    const interview = await Interview.findOne({
      _id: req.params.id,
      employerId: req.user._id,
    });
    if (!interview) return next(throwError("Interview not found", 404));

    const sessions = await Session.find({ interviewId: interview._id })
      .sort({ createdAt: -1 })
      .populate("candidateId", "name email");

    return res.status(200).json({
      success: true,
      data: { interview, sessions },
    });
  } catch (e) {
    return next(e);
  }
};

export const patchInterview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireEmployer(req, res, next)) return;

    const { status } = req.body;
    if (!status || !["active", "closed"].includes(status))
      return next(throwError("status must be 'active' or 'closed'", 400));

    const interview = await Interview.findOne({
      _id: req.params.id,
      employerId: req.user._id,
    });
    if (!interview) return next(throwError("Interview not found", 404));

    if (status === INTERVIEW_STATUS.ACTIVE) {
      if (interview.status === INTERVIEW_STATUS.CLOSED)
        return next(throwError("Cannot activate a closed interview", 400));
      if (!interview.inviteCode)
        interview.inviteCode = await generateUniqueInviteCode();
      interview.status = INTERVIEW_STATUS.ACTIVE;
    } else if (status === INTERVIEW_STATUS.CLOSED) {
      interview.status = INTERVIEW_STATUS.CLOSED;
    }

    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview updated",
      data: interview,
    });
  } catch (e) {
    return next(e);
  }
};

export const listInterviewSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireEmployer(req, res, next)) return;

    const interview = await Interview.findOne({
      _id: req.params.id,
      employerId: req.user._id,
    });
    if (!interview) return next(throwError("Interview not found", 404));

    const sessions = await Session.find({ interviewId: interview._id })
      .sort({ createdAt: -1 })
      .populate("candidateId", "name email");

    return res.status(200).json({ success: true, data: sessions });
  } catch (e) {
    return next(e);
  }
};
