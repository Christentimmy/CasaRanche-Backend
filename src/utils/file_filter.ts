import { Request } from "express";
import multer from "multer";

const fileFilter = async (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    const user = req.user;
    const capabilities = user.getGhostLevelCapabilities();

    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    const isAudio = file.mimetype.startsWith("audio/");

    if (isImage && !capabilities.canAddPhotos) {
      return cb(new Error("Your ghost level does not allow photo uploads"));
    }

    if (isVideo && !capabilities.canAddVideos) {
      return cb(new Error("Your ghost level does not allow video uploads"));
    }

    if (isAudio && !capabilities.canAddMusic) {
      return cb(new Error("Your ghost level does not allow music uploads"));
    }

    cb(null, true); // Allowed
  } catch (err) {
    cb(new Error("Error checking ghost level capabilities"));
  }
};

export { fileFilter };
