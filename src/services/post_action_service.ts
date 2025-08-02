
import { Post } from "../models/post_model";
import User from "../models/user_model";

export class PostActionService {

    
  static async handleRepostChain(
    postData: any,
    originalPost: any,
    userId: string
  ) {
    if (originalPost) {
      postData.repostChain = originalPost.repostChain
        ? [...originalPost.repostChain, originalPost._id]
        : [originalPost._id];
      postData.repostDepth = (originalPost.repostDepth || 0) + 1;

      // Update original post repost count
      await Post.findByIdAndUpdate(originalPost._id, {
        $inc: { "engagement.reposts": 1 },
        $push: { "engagement.reposterIds": userId },
      });
    }
  }

  static async updateUserStats(
    userId: string,
    isGhostPost: boolean,
    postType: string
  ) {
    await User.findByIdAndUpdate(userId, {
      $inc: {
        "stats.postsCount": 1,
        "ghostProgression.postsMade":
          isGhostPost || postType === "ghost" ? 1 : 0,
      },
    });
  }

  static async handlePostCreationSideEffects(
    mentions: string[],
    postId: string,
    userId: string
  ) {
    // Send notifications to mentioned users
    if (mentions.length > 0) {
      // TODO: Send mention notifications
      // await sendMentionNotifications(mentions, postId, userId);
    }

    // Schedule AI engagement if enabled
    if (process.env.AI_ENGAGEMENT_ENABLED === "true") {
      // TODO: Schedule AI to engage with this post
      // await scheduleAiEngagement(postId);
    }
  }
}
