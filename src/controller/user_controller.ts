import { Request, Response } from "express";
import userSchema from "../models/user_model";

export const userController = {


  completeProfile: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== "object") {
        return res.status(400).json({ message: "Missing request body" });
      }

      const { dob, username, education, work, bio } = req.body;

      if (!dob || !username) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Profile picture is required" });
      }

      const imageUrl: string = req.file.path;

      const usernameExists = await userSchema.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // At this point, the user should already be authenticated
      const userId = res.locals.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await userSchema.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Required fields
      user.dateOfBirth = dob;
      user.username = username;
      user.avatarUrl = imageUrl;

      // Optional fields
      if (education) user.education = education;
      if (work) user.work = work;
      if (bio) user.bio = bio;
      user.accountStatus.isProfileCompleted = true;

      await user.save();

      res.status(200).json({ message: "Profile completed successfully" });
    } catch (error) {
      console.error("❌ Error in completeProfile:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
