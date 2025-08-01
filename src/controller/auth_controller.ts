import { Request, Response } from "express";
import userSchema from "../models/user_model";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import validator from "validator";
import { redisController } from "../controller/redis_controller";
import { sendOTP } from "../services/email_service";
import tokenBlacklistSchema from "../models/token_blacklist_model";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.TOKEN_SECRET) {
  throw new Error("TOKEN_SECRET is not defined in environment variables");
}
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

      let anonymousId;
      do {
        anonymousId = `ghost_${Math.random().toString(36).substr(2, 15)}`;
      } while (await userSchema.findOne({ anonymousId }));

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
      await tokenBlacklistSchema.create({ token, userId: newUser._id });

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

  loginUser: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({ message: "Missing request body" });
        return;
      }

      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const user = await userSchema
        .findOne({ email })
        .select("password accountStatus");

      if (!user) {
        res.status(404).json({ message: "Invalid Credentials" });
        return;
      }

      if (!user.password) {
        res.status(404).json({ message: "Invalid Credentials" });
        return;
      }

      // Validate password
      const validatePassword = await bcryptjs.compare(password, user.password);
      if (!validatePassword) {
        res.status(404).json({ message: "Invalid Credentials" });
        return;
      }

      // Check if user is banned
      if (user.accountStatus.isBanned) {
        res.status(403).json({ message: "Account banned" });
        return;
      }

      // Generate token
      const token = jwt.sign({ id: user._id, role: user.role }, token_secret, {
        expiresIn: "2d",
      });

      // Handle verification
      if (!user.accountStatus.isEmailVerified) {
        res.status(401).json({ message: "User Not Verified", token: token });
        return;
      }

      // Check if user profile is completed
      if (!user.accountStatus.isProfileCompleted) {
        res.status(400).json({ message: "User Not Complete", token: token });
        return;
      }

      res.status(200).json({ message: "Login Successful", token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  logoutUser: async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, token_secret!) as JwtPayload;

      // Optional: ensure token belongs to a valid user
      const user = await userSchema.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Add token to blacklist (if not using short token lifespans)
      await tokenBlacklistSchema.create({ token, userId: user._id });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("❌ Error in logout:", error);
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
