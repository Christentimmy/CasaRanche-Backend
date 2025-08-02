
import { Request } from "express";
import User from "../models/user_model";
import Group from "../models/group_model";
import { Post } from "../models/post_model";
import { validateGhostPostMedia } from "../utils/grant_post_media_permission";
import { ICloudinaryFile } from "../utils/cloudinary_types";
import { IUser } from "../types/user_type";
import { IGroupMember } from "../types/group_type";

export class PostValidationService {

  static async validateBasicRequirements(req: Request, userId: string) {
    const { text, poll, originalPostId } = req.body;
    
    if (!text && !req.files?.length && !poll && !originalPostId) {
      throw new Error("Post must contain text, media, poll, or be a repost");
    }
  }

  static async validateUser(userId: string) {
    const user = await User.findById(userId).select(
      "ghostProgression accountStatus school work isVerified username anonymousId"
    );

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async validateGhostMedia(user: IUser, files: ICloudinaryFile[], postType: string) {
    if (postType === "ghost" && files?.length > 0) {
      const isMediaAllowed = validateGhostPostMedia(user, files);
      if (!isMediaAllowed) {
        throw new Error("You do not have permission to post this type of media");
      }
    }
  }

  static async validateGroupPermissions(visibilityType: string, groupId: string, userId: string) {
    if (visibilityType === "group" && groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error("Group not found");
      }

      if (!group.members.some((member: IGroupMember) => member.userId.toString() === userId)) {
        throw new Error("You are not a member of this group");
      }
    }
  }

  static async validateRepost(postType: string, originalPostId: string) {
    if (postType === "repost" && originalPostId) {
      const originalPost = await Post.findById(originalPostId);
      if (!originalPost) {
        throw new Error("Original post not found");
      }

      if (!originalPost.visibility.allowReposting) {
        throw new Error("This post cannot be reposted");
      }
      return originalPost;
    }
    return null;
  }
}
