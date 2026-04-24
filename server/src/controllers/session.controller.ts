import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Interview } from "../models/interview.model";
import { Session } from "../models/session.model";
import { throwError } from "../utils/helpers";
import {
  ROLES,
  INTERVIEW_STATUS,
  SESSION_MODE,
  SESSION_STATUS,
} from "../utils/constants";
import type { AnswerEvaluation } from "../types/type";
import {
  decideFollowUp,
  evaluateAnswer,
  generateFinalReport,
  generateQuestionsFromJD,
} from "../services/gemini.service";
import { transcribeAudioFile } from "../services/whisper.service";
import { safeUnlink } from "../config/uploadAudio";

function requireCandidate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): req is AuthRequest & { user: NonNullable<AuthRequest["user"]> } {
  if (!req.user) {
    next(throwError("Unauthorized", 401));
    return false as any;
  }
  if (req.user.role !== ROLES.CANDIDATE) {
    next(throwError("Candidate access only", 403));
    return false as any;
  }
  return true;
}

export const joinSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireCandidate(req, res, next)) return;

    const { inviteCode, jobDescription, title } = req.body;

    if (inviteCode) {
      const code = String(inviteCode).toUpperCase().trim();
      const interview = await Interview.findOne({
        inviteCode: code,
        status: INTERVIEW_STATUS.ACTIVE,
      });
      if (!interview)
        return next(throwError("Invalid or inactive invite code", 404));

      const existing = await Session.findOne({
        interviewId: interview._id,
        candidateId: req.user._id,
        status: {
          $in: [SESSION_STATUS.PENDING, SESSION_STATUS.IN_PROGRESS],
        },
      });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Resuming existing session",
          data: {
            session: existing,
            interview: interview.toObject(),
          },
        });
      }

      const session = await Session.create({
        interviewId: interview._id,
        candidateId: req.user._id,
        mode: SESSION_MODE.EMPLOYER_INVITE,
        status: SESSION_STATUS.PENDING,
      });

      return res.status(201).json({
        success: true,
        message: "Session created",
        data: {
          session,
          interview: interview.toObject(),
        },
      });
    }

    if (jobDescription && title) {
      const generatedQuestions = await generateQuestionsFromJD(
        String(jobDescription)
      );

      const interview = await Interview.create({
        employerId: req.user._id,
        title: String(title).trim(),
        jobDescription: String(jobDescription).trim(),
        status: INTERVIEW_STATUS.ACTIVE,
        isMockInterview: true,
        generatedQuestions,
      });

      const session = await Session.create({
        interviewId: interview._id,
        candidateId: req.user._id,
        mode: SESSION_MODE.MOCK,
        status: SESSION_STATUS.PENDING,
      });

      return res.status(201).json({
        success: true,
        message: "Mock interview started",
        data: {
          session,
          interview: interview.toObject(),
        },
      });
    }

    return next(
      throwError(
        "Provide inviteCode, or title + jobDescription for a mock interview",
        400
      )
    );
  } catch (e) {
    return next(e);
  }
};

export const submitAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireCandidate(req, res, next)) return;

    const file = (req as AuthRequest & { file?: Express.Multer.File })
      .file;
    if (!file) return next(throwError("Audio file is required (field: audio)", 400));

    const { questionIndex, questionText, isFollowUp } = req.body;
    if (questionText == null || questionText === "")
      return next(throwError("questionText is required", 400));
    const qIndex = Number(questionIndex);
    if (Number.isNaN(qIndex) || qIndex < 0)
      return next(throwError("questionIndex must be a non-negative number", 400));

    const session = await Session.findById(req.params.id);
    if (!session) {
      safeUnlink(file.path);
      return next(throwError("Session not found", 404));
    }
    if (String(session.candidateId) !== String(req.user._id)) {
      safeUnlink(file.path);
      return next(throwError("Forbidden", 403));
    }
    if (session.status === SESSION_STATUS.COMPLETED) {
      safeUnlink(file.path);
      return next(throwError("Session already completed", 400));
    }

    const interview = await Interview.findById(session.interviewId);
    if (!interview) {
      safeUnlink(file.path);
      return next(throwError("Interview not found", 404));
    }

    let transcript: string;
    try {
      transcript = await transcribeAudioFile(file.path);
    } catch (e) {
      safeUnlink(file.path);
      return next(e);
    }
    safeUnlink(file.path);

    let evaluation;
    try {
      evaluation = await evaluateAnswer({
        jobTitle: interview.title,
        jobDescription: interview.jobDescription,
        question: String(questionText),
        transcript,
      });
    } catch (e) {
      return next(e);
    }

    const followUp = await decideFollowUp({
      question: String(questionText),
      transcript,
    }).catch(() => null);

    session.answers.push({
      questionIndex: qIndex,
      questionText: String(questionText),
      isFollowUp: isFollowUp === true || isFollowUp === "true",
      transcript,
      evaluation,
    });

    if (session.status === SESSION_STATUS.PENDING) {
      session.status = SESSION_STATUS.IN_PROGRESS;
      session.startedAt = new Date();
    }

    await session.save();

    return res.status(200).json({
      success: true,
      data: {
        transcript,
        evaluation,
        followUp,
      },
    });
  } catch (e) {
    return next(e);
  }
};

export const completeSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireCandidate(req, res, next)) return;

    const session = await Session.findById(req.params.id);
    if (!session) return next(throwError("Session not found", 404));
    if (String(session.candidateId) !== String(req.user._id))
      return next(throwError("Forbidden", 403));

    const interview = await Interview.findById(session.interviewId);
    if (!interview) return next(throwError("Interview not found", 404));

    const expected = interview.generatedQuestions.length;
    for (let i = 0; i < expected; i++) {
      const answered = session.answers.some(
        (a) => !a.isFollowUp && a.questionIndex === i
      );
      if (!answered) {
        return next(
          throwError(`Missing recorded answer for question index ${i}`, 400)
        );
      }
    }

    const evaluations = session.answers
      .map((a) => a.evaluation)
      .filter(Boolean) as AnswerEvaluation[];

    if (!evaluations.length)
      return next(throwError("No evaluations found on session", 400));

    const overallReport = await generateFinalReport({
      jobTitle: interview.title,
      evaluations,
    });

    session.overallReport = overallReport;
    session.status = SESSION_STATUS.COMPLETED;
    session.completedAt = new Date();
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Report generated",
      data: session,
    });
  } catch (e) {
    return next(e);
  }
};

export const getSessionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireCandidate(req, res, next)) return;

    const session = await Session.findById(req.params.id).populate({
      path: "interviewId",
      select: "title jobDescription status generatedQuestions isMockInterview",
    });
    if (!session) return next(throwError("Session not found", 404));
    if (String(session.candidateId) !== String(req.user._id))
      return next(throwError("Forbidden", 403));

    return res.status(200).json({ success: true, data: session });
  } catch (e) {
    return next(e);
  }
};

export const listMySessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!requireCandidate(req, res, next)) return;

    const sessions = await Session.find({ candidateId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("interviewId", "title status isMockInterview");

    return res.status(200).json({ success: true, data: sessions });
  } catch (e) {
    return next(e);
  }
};
