
import { IUser } from "../types/user_type";


export const validateGhostPostMedia = (user: IUser, files: Express.Multer.File[]) => {
  const capabilities = user.getGhostLevelCapabilities();

  for (const file of files) {
    const mimetype = file.mimetype;

    if (mimetype.startsWith("image/")) {
      if (!capabilities.canAddPhotos) {
        return false;
      }
    } else if (mimetype.startsWith("video/")) {
      if (!capabilities.canAddVideos) {
        return false;
      }
    } else if (mimetype.startsWith("audio/")) {
      if (!capabilities.canAddMusic) {
        return false;
      }
    }
  }

  return true;
};