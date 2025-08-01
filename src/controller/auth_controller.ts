import { Request, Response } from "express";
import userSchema from "../models/user_model";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import validator from "validator";
import { redisController } from "../controller/redis_controller";
import { sendOTP } from "../services/email_service";

import dotenv from "dotenv";
dotenv.config();

const token_secret = process.env.TOKEN_SECRET;

export const authController = {
  signUpUser: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }

      const { email, password, display_name } = req.body;

      if (!email || !password || !display_name) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      if (!validator.isEmail(email)) {
        res.status(400).json({ message: "Invalid email format" });
        return;
      }

      if (
        !validator.isStrongPassword(password, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      ) {
        res.status(400).json({
          message:
            "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
        });
        return;
      }

      const existingUser = await userSchema.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "Email is already registered" });
        return;
      }

      const salt = await bcryptjs.genSalt(12);
      const hashedPassword = await bcryptjs.hash(password, salt);
      let anonymousId = `ghost_${Math.random().toString(36).substr(2, 15)}`;

      const user = await userSchema.findOne({ anonymousId });
      if (user) {
        anonymousId = `ghost_${Math.random().toString(36).substr(2, 15)}`;
      }

      const newUser = new userSchema({
        email: email,
        password: hashedPassword,
        role: "user",
        displayName: display_name,
        anonymousId: anonymousId,
      });

      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        token_secret!,
        { expiresIn: "2d" }
      );
      await newUser.save();

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await redisController.saveOtpToStore(email, otp);
      await sendOTP(email, otp);

      res.status(201).json({
        message: "User registered successfully",
        token: token,
      });
    } catch (error) {
      console.error(`SignUpUserController: ${error}`);
      res.status(500).json({ message: "Server error" });
    }
  },

  sendOtp: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      await redisController.saveOtpToStore(email, otp);
      await sendOTP(email, otp);

      res.status(200).json({ message: "OTP sent" });
    } catch (error) {
      console.error("❌ Error in sendSignUpOtp:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  verifyOtp: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ message: "Email and OTP are required" });
        return;
      }
      const savedOtp = await redisController.getOtpFromStore(email);
      console.log(savedOtp, otp);
      if (!savedOtp || savedOtp !== otp) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }
      const user = await userSchema.findOne({ email });
      if (user && user.accountStatus.isEmailVerified === false) {
        user.accountStatus.isEmailVerified = true;
        await user.save();
      }
      await redisController.removeOtp(email);
      res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("❌ Error in verifyOtp:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
