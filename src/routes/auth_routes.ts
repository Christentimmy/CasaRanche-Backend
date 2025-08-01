import express from "express";
import { authController } from "../controller/auth_controller";
const router = express.Router();

router.post("/register", authController.signUpUser);
router.post("/login", authController.loginUser);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

export default router;
