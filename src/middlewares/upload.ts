import multer from "multer";
import cloudinary from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";
import { fileFilter } from "../utils/file_filter";

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => ({
    folder: "profile_pictures",
    format: "png",
    public_id: file.originalname.split(".")[0],
  }),
});

const uploadProfile = multer({
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
  storage: profileStorage,
});

const postMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const ext = file.mimetype.split("/")[1];
    return {
      folder: "post_media",
      format: ext,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      resource_type: "auto",
    };
  },
});

const uploadPostMedia = multer({
  limits: {
    fileSize: 20 * 1024 * 1024, 
  },
  storage: postMediaStorage,
  fileFilter,
});

export { uploadProfile, uploadPostMedia };
