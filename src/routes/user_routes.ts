import express from "express";
const router = express.Router();
import { userController } from "../controller/user_controller";
import tokenValidationMiddleware from "../middlewares/token_validator";
import { statusChecker } from "../middlewares/status_middleware";
import { uploadProfile } from "../middlewares/upload";

router.use(tokenValidationMiddleware);
router.use(statusChecker);

router.post("/complete-profile", uploadProfile.single("avatar"), userController.completeProfile);

export default router;
