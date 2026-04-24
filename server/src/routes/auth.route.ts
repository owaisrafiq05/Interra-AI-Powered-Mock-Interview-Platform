import { Router } from "express";
import { verifyAuth } from "../middlewares/auth.middleware";
import { ROLES } from "../utils/constants";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller";

const router = Router();
const anyRole = verifyAuth([ROLES.EMPLOYER, ROLES.CANDIDATE]);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current-user", anyRole, getCurrentUser);
router.get("/me", anyRole, getCurrentUser);
router.post("/logout", anyRole, logoutUser);

export default router;
