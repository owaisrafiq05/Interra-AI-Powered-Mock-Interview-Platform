import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { ROLES } from "../utils/constants";
import { audioUpload } from "../config/uploadAudio";
import {
  completeSession,
  getSessionById,
  joinSession,
  listMySessions,
  submitAnswer,
} from "../controllers/session.controller";

const router = Router();
const candidateOnly = verifyAuth([ROLES.CANDIDATE]);

router.get("/my", candidateOnly, listMySessions);
router.post("/join", candidateOnly, joinSession);
router.post(
  "/:id/answer",
  candidateOnly,
  audioUpload.single("audio"),
  submitAnswer
);
router.post("/:id/complete", candidateOnly, completeSession);
router.get("/:id", candidateOnly, getSessionById);

export default router;
