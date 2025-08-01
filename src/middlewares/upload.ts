import multer from "multer";
import cloudinary from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";

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
    storage: profileStorage
});




export { uploadProfile };

