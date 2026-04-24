import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { ROLES } from "../utils/constants";
import {
  createInterview,
  getInterviewById,
  listInterviewSessions,
  listInterviews,
  patchInterview,
} from "../controllers/interview.controller";

const router = Router();
const employerOnly = verifyAuth([ROLES.EMPLOYER]);

router.post("/", employerOnly, createInterview);
router.get("/", employerOnly, listInterviews);
router.get("/:id/sessions", employerOnly, listInterviewSessions);
router.get("/:id", employerOnly, getInterviewById);
router.patch("/:id", employerOnly, patchInterview);

export default router;
