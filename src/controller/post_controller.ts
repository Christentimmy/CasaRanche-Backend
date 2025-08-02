import { Request, Response } from "express";
import { Post } from "../models/post_model";

import { PostValidationService } from "../services/post_validation_service";
import { PostDataService } from "../services/post_data_service";
import { PostBuilderService } from "../services/post_builder_service";
import { PostActionService } from "../services/post_action_service";

export const postController = {
    
  createPost: async (req: Request, res: Response) => {
    try {
      const userId = res.locals.userId;

      if (!userId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      // Extract commonly used values
      const {
        postType = "regular",
        isGhostPost = false,
        customHashtags = [],
        mentionedUserIds = [],
      } = req.body;
      const files = req.files as any[];

      // 1. Validate all requirements
      await PostValidationService.validateBasicRequirements(req, userId);
      const user = await PostValidationService.validateUser(userId);
      await PostValidationService.validateGhostMedia(user, files, postType);
      await PostValidationService.validateGroupPermissions(
        req.body.visibilityType,
        req.body.groupId,
        userId
      );
      const originalPost = await PostValidationService.validateRepost(
        postType,
        req.body.originalPostId
      );

      // 2. Process data
      const processedPoll = await PostDataService.processPoll(req.body.poll);
      const { mediaItems, contentCheck, hashtags, mentions } =
        await PostDataService.processContent(
          req.body.text,
          files,
          customHashtags,
          mentionedUserIds
        );

      // 3. Build post data
      const postData = PostBuilderService.buildPostData({
        user,
        processedPoll,
        mediaItems,
        contentCheck,
        hashtags,
        mentions,
        requestBody: req.body,
      });

      // 4. Handle repost chain
      await PostActionService.handleRepostChain(postData, originalPost, userId);

      // 5. Create and save post
      const newPost = new Post(postData);
      await newPost.save();

      // 6. Handle side effects
      await PostActionService.updateUserStats(userId, isGhostPost, postType);
      await PostActionService.handlePostCreationSideEffects(
        mentions,
        newPost._id.toString(),
        userId
      );

      return res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
      console.error("Error creating post:", error);

      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Internal server error",
        error: error as Error,
      });
    }
  },
};
