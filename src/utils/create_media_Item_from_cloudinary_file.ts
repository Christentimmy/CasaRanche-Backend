import { IMediaItem } from "../types/post_type";

// Use the newly defined interface
import { ICloudinaryFile } from "./cloudinary_types";

const createMediaItemFromCloudinaryFile = (
  file: ICloudinaryFile
): IMediaItem => {
  // Determine the media type
  const mediaType =
    file.resource_type === "video"
      ? "video"
      : file.resource_type === "audio"
        ? "audio"
        : "image";

  const url = file.path;
  const size = file.size;

  // Populate the dimensions and duration fields
  const dimensions =
    file.width && file.height
      ? { width: file.width, height: file.height }
      : undefined;
  const duration = file.duration;

  // Populate metadata
  const metadata = {
    format: file.format,
    quality: undefined,
    isProcessed: true,
  };

  // Create a thumbnailUrl for videos if needed
  const thumbnailUrl =
    mediaType === "video"
      ? `${file.path.split(".").slice(0, -1).join(".")}.jpg`
      : undefined;

  return {
    type: mediaType,
    url: url,
    thumbnailUrl: thumbnailUrl,
    duration: duration,
    size: size,
    dimensions: dimensions,
    metadata: metadata,
  };
};


export default createMediaItemFromCloudinaryFile;
