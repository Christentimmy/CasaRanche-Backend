import { IUser } from "../types/user_type";
import { IPoll } from "../types/post_type";
import { IMediaItem } from "../types/post_type";

export class PostBuilderService {


    
  static buildPostData(params: {
    user: IUser;
    processedPoll: IPoll | undefined;
    mediaItems: IMediaItem[];
    contentCheck: any;
    hashtags: string[];
    mentions: string[];
    requestBody: any;
  }) {
    const {
      user,
      processedPoll,
      mediaItems,
      contentCheck,
      hashtags,
      mentions,
      requestBody,
    } = params;

    const {
      text,
      formatting,
      postType = "regular",
      isGhostPost = false,
      showVerificationBadge = true,
      allowedVerificationTypes = ["account"],
      confessionDisplayName,
      confessionAvatarUrl,
      originalPostId,
      repostComment,
      visibilityType = "public",
      allowComments = true,
      showPostTime = true,
      allowSharing = true,
      allowReposting = true,
      hideFromTimeline = false,
      groupId,
      isEphemeral = false,
      autoDeleteAfterHours,
      viewLimit,
      location,
    } = requestBody;

    return {
      authorId: user._id,
      postType,

      // Content
      content: {
        text: text || "",
        formatting: {
          alignment: formatting?.alignment || "left",
          isBold: formatting?.isBold || false,
          font: formatting?.font,
        },
      },
      media: mediaItems,
      poll: processedPoll
        ? {
            ...processedPoll,
            isActive: true,
            totalVotes: 0,
            options: processedPoll.options?.map((option: any) => ({
              ...option,
              voteCount: 0,
              voters: [],
            })),
          }
        : undefined,

      // Ghost Mode Settings
      ghostMode: {
        isGhostPost: isGhostPost || postType === "ghost",
        anonymousId: user.anonymousId,
        showVerificationBadge:
          showVerificationBadge && user.isVerified ? true : false,
        allowedVerificationTypes,
      },

      // Confession Settings
      confessionDisplayName:
        postType === "confession" ? confessionDisplayName : undefined,
      confessionAvatarUrl:
        postType === "confession" ? confessionAvatarUrl : undefined,

      // Repost Settings
      originalPostId: postType === "repost" ? originalPostId : undefined,
      repostComment: postType === "repost" ? repostComment : undefined,
      repostDepth: 0,

      // Visibility Settings
      visibility: {
        type: visibilityType,
        allowComments,
        showPostTime,
        allowSharing,
        allowReposting,
        hideFromTimeline,
        restrictedAgeGroups: contentCheck.ageRestricted ? ["under18"] : [],
        groupId: visibilityType === "group" ? groupId : undefined,
      },

      // Expiration Settings
      expiration: {
        isEphemeral,
        expiresAt:
          isEphemeral && autoDeleteAfterHours
            ? new Date(Date.now() + autoDeleteAfterHours * 60 * 60 * 1000)
            : undefined,
        autoDeleteAfterHours,
        viewLimit,
      },

      // Metadata
      location: location
        ? {
            name: location.name,
            coordinates: location.coordinates,
            isVisible: location.isVisible !== false,
          }
        : undefined,
      hashtags,
      mentionedUsers: mentions,

      // Content Moderation
      isExplicitContent: contentCheck.isExplicit,
      ageRestrictedContent: contentCheck.ageRestricted,
      contentModeration: {
        flaggedFor: {
          nsfw: contentCheck.flags.nsfw || false,
          violence: contentCheck.flags.violence || false,
          hate: contentCheck.flags.hate || false,
        },
        autoHidden: contentCheck.autoHidden || false,
        reviewedByModerator: false,
        ageRestricted: contentCheck.ageRestricted || false,
      },

      // Analytics & AI (defaults)
      trending: {
        engagementScore: 0,
        viralityScore: 0,
        demographicBreakdown: { ageGroups: {}, locations: {} },
      },
      aiInteraction: {
        hasAiEngagement: false,
        aiComments: [],
        aiReactions: [],
      },

      // State
      isDraft: false,
      isDeleted: false,
      isEdited: false,
      publishedAt: new Date(),
      lastEngagementAt: new Date(),
    };
  }
}
