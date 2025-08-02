import mongoose, { Schema, Document, Types } from "mongoose";
import { IPost } from "../types/post_type";
import { IReaction } from "../types/post_type";
import { IEngagementStats } from "../types/post_type";
import { IMediaItem } from "../types/post_type";
import { ITextContent } from "../types/post_type";
import { IPollOption } from "../types/post_type";
import { IPoll } from "../types/post_type";
import { IGhostModeSettings } from "../types/post_type";
import { IVisibilitySettings } from "../types/post_type";
import { IExpirationSettings } from "../types/post_type";
import { ILocation } from "../types/post_type";
import { ITrendingMetrics } from "../types/post_type";
import { IAiInteraction } from "../types/post_type";
// import ReactionSchema from "./reaction_model";

// Import the interfaces from the previous schema definition
// (Assuming they're exported from a types file)

// Sub-schemas for nested objects
const MediaItemSchema = new Schema<IMediaItem>(
  {
    type: {
      type: String,
      enum: ["image", "video", "audio"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,
    duration: Number, // For video/audio in seconds
    size: {
      type: Number,
      required: true,
    },
    dimensions: {
      width: Number,
      height: Number,
    },
    metadata: {
      format: String,
      quality: String,
      isProcessed: {
        type: Boolean,
        default: false,
      },
    },
  },
  { _id: false }
);

const TextContentSchema = new Schema<ITextContent>(
  {
    text: {
      type: String,
      required: true,
      maxlength: 5000, // Reasonable limit for posts
    },
    formatting: {
      alignment: {
        type: String,
        enum: ["left", "center", "right"],
        default: "left",
      },
      isBold: {
        type: Boolean,
        default: false,
      },
      font: String,
    },
  },
  { _id: false }
);

const PollOptionSchema = new Schema<IPollOption>(
  {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 200,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    voters: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: false }
);

const PollSchema = new Schema<IPoll>(
  {
    question: {
      type: String,
      required: true,
      maxlength: 300,
    },
    options: [PollOptionSchema],
    allowMultipleChoices: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
    totalVotes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const GhostModeSettingsSchema = new Schema<IGhostModeSettings>(
  {
    isGhostPost: {
      type: Boolean,
      default: false,
    },
    anonymousId: String,
    showVerificationBadge: {
      type: Boolean,
      default: true,
    },
    allowedVerificationTypes: [
      {
        type: String,
        enum: ["account", "school", "work"],
      },
    ],
  },
  { _id: false }
);

const ReactionSchema = new Schema<IReaction>(
  {
    type: {
      type: String,
      enum: ["like", "love", "laugh", "wow", "sad", "angry"],
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: false }
);

const EngagementStatsSchema = new Schema<IEngagementStats>(
  {
    views: {
      type: Number,
      default: 0,
    },
    viewerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    reactions: [ReactionSchema],
    totalReactions: {
      type: Number,
      default: 0,
    },
    // comments: [CommentSchema],
    commentCount: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    sharerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    saves: {
      type: Number,
      default: 0,
    },
    saverIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    reposts: {
      type: Number,
      default: 0,
    },
    reposterIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { _id: false }
);

const VisibilitySettingsSchema = new Schema<IVisibilitySettings>(
  {
    type: {
      type: String,
      enum: ["public", "followers", "private", "ghost", "confession", "group"],
      default: "public",
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    showPostTime: {
      type: Boolean,
      default: true,
    },
    allowSharing: {
      type: Boolean,
      default: true,
    },
    allowReposting: {
      type: Boolean,
      default: true,
    },
    hideFromTimeline: {
      type: Boolean,
      default: false,
    },
    restrictedAgeGroups: [
      {
        type: String,
        enum: ["under18", "over18"],
      },
    ],
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  { _id: false }
);

const ExpirationSettingsSchema = new Schema<IExpirationSettings>(
  {
    isEphemeral: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
    autoDeleteAfterHours: Number,
    viewLimit: Number,
  },
  { _id: false }
);

const LocationSchema = new Schema<ILocation>(
  {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const TrendingMetricsSchema = new Schema<ITrendingMetrics>(
  {
    engagementScore: {
      type: Number,
      default: 0,
      index: true, // For trending queries
    },
    viralityScore: {
      type: Number,
      default: 0,
      index: true,
    },
    trendingRank: Number,
    peakEngagementTime: Date,
    demographicBreakdown: {
      ageGroups: {
        type: Map,
        of: Number,
        default: new Map(),
      },
      locations: {
        type: Map,
        of: Number,
        default: new Map(),
      },
    },
  },
  { _id: false }
);

const AiInteractionSchema = new Schema<IAiInteraction>(
  {
    hasAiEngagement: {
      type: Boolean,
      default: false,
    },
    aiComments: [
      {
        commentId: {
          type: Schema.Types.ObjectId,
          ref: "Comment",
        },
        aiPersona: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    aiReactions: [
      {
        reactionType: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { _id: false }
);

// Main Post Schema
const PostSchema = new Schema<IPost>(
  {
    // Basic Post Information
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    postType: {
      type: String,
      enum: ["regular", "ghost", "confession", "repost"],
      required: true,
      index: true,
    },

    // Content
    content: {
      type: TextContentSchema,
      required: true,
    },
    media: [MediaItemSchema],
    poll: PollSchema,

    // Ghost Mode & Anonymity
    ghostMode: {
      type: GhostModeSettingsSchema,
      default: () => ({}),
    },

    // For confession posts
    confessionDisplayName: String,
    confessionAvatarUrl: String,

    // For reposts
    originalPostId: {
      type: Schema.Types.ObjectId,
      ref: "posts",
    },
    repostComment: {
      type: String,
      maxlength: 500,
    },
    repostChain: [
      {
        type: Schema.Types.ObjectId,
        ref: "posts",
      },
    ],
    repostDepth: Number,

    // Visibility and Privacy
    visibility: {
      type: VisibilitySettingsSchema,
      default: () => ({}),
    },
    expiration: {
      type: ExpirationSettingsSchema,
      default: () => ({}),
    },

    // Engagement and Interactions
    engagement: {
      type: EngagementStatsSchema,
      default: () => ({}),
    },

    // Metadata
    location: LocationSchema,
    hashtags: [
      {
        type: String,
        maxlength: 50,
        index: true, // For hashtag searches
      },
    ],
    mentionedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Moderation and Safety
    isReported: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "flagged", "removed"],
      default: "approved",
      index: true,
    },
    moderationNotes: String,
    isExplicitContent: {
      type: Boolean,
      default: false,
      index: true,
    },
    ageRestrictedContent: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Analytics and Trending
    trending: {
      type: TrendingMetricsSchema,
      default: () => ({}),
    },

    // AI Integration
    aiInteraction: {
      type: AiInteractionSchema,
      default: () => ({}),
    },
    contentModeration: {
      flaggedFor: {
        nsfw: { type: Boolean, default: false },
        violence: { type: Boolean, default: false },
        hate: { type: Boolean, default: false },
      },
      autoHidden: { type: Boolean, default: false },
      reviewedByModerator: { type: Boolean, default: false },
      ageRestricted: { type: Boolean, default: false },
      moderatedAt: Date,
    },

    // Post State
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        editedAt: {
          type: Date,
          default: Date.now,
        },
        previousContent: String,
        editReason: String,
      },
    ],

    // Timestamps
    publishedAt: Date,
    lastEngagementAt: {
      type: Date,
      default: Date.now,
      index: true, // Important for feed algorithms
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
PostSchema.index({ authorId: 1, createdAt: -1 }); // User's posts timeline
PostSchema.index({ postType: 1, createdAt: -1 }); // Posts by type
PostSchema.index({ "visibility.type": 1, createdAt: -1 }); // Public/private posts
PostSchema.index({ hashtags: 1, createdAt: -1 }); // Hashtag searches
PostSchema.index({ "trending.engagementScore": -1, createdAt: -1 }); // Trending posts
PostSchema.index({ lastEngagementAt: -1 }); // Feed algorithm
PostSchema.index({ "ghostMode.isGhostPost": 1, createdAt: -1 }); // Ghost posts
PostSchema.index({ originalPostId: 1 }); // Repost chains
// Add this new index to your PostSchema
PostSchema.index({ "visibility.groupId": 1, createdAt: -1 }, { partialFilterExpression: { "visibility.type": "group" } });

// Virtual for ghost level (from user data)
PostSchema.virtual("ghostLevel").get(function () {
  // This would be populated from the user's ghost progression
  return this.populated("authorId")?.ghostProgression?.level || "A";
});

PostSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
});

// Pre-save middleware
PostSchema.pre("save", function (next) {

  // Set published date for new posts
  if (!this.isDraft) {
    this.publishedAt = new Date();
  }

  // Update last engagement time when post is interacted with
  if (this.isModified("engagement")) {
    this.lastEngagementAt = new Date();
  }

  next();
});

// Methods
PostSchema.methods.addReaction = function (
  userId: Types.ObjectId,
  reactionType: string,
  emoji: string
) {
  const reactions: IReaction[] = this.engagement.reactions;
  const reaction = reactions.find((r) => r.type === reactionType);

  if (reaction) {
    if (!reaction.users.includes(userId)) {
      reaction.users.push(userId);
      reaction.count++;
    }
  } else {
    this.engagement.reactions.push({
      type: reactionType,
      emoji,
      count: 1,
      users: [userId],
    });
  }

  this.engagement.totalReactions = reactions.reduce(
    (sum, r) => sum + r.count,
    0
  );
  this.lastEngagementAt = new Date();

  return this.save();
};

PostSchema.methods.removeReaction = function (
  userId: Types.ObjectId,
  reactionType: string
) {
  const reactions: IReaction[] = this.engagement.reactions;
  const reaction = reactions.find((r) => r.type === reactionType);

  if (reaction) {
    const userIndex = reaction.users.indexOf(userId);
    if (userIndex > -1) {
      reaction.users.splice(userIndex, 1);
      reaction.count--;

      if (reaction.count === 0) {
        this.engagement.reactions = reactions.filter(
          (r) => r.type !== reactionType
        );
      }
    }
  }

  this.engagement.totalReactions = reactions.reduce(
    (sum, r) => sum + r.count,
    0
  );

  return this.save();
};

PostSchema.methods.incrementViews = function (userId?: Types.ObjectId) {
  this.engagement.views++;

  if (userId && !this.engagement.viewerIds.includes(userId)) {
    this.engagement.viewerIds.push(userId);
  }

  return this.save();
};

PostSchema.methods.canUserInteract = function (user: any) {
  // Check if user can interact based on visibility settings
  if (this.visibility.type === "private") {
    return this.authorId.equals(user._id);
  }

  if (this.visibility.type === "followers") {
    // Would need to check if user follows the author
    return true; // Simplified for now
  }

  // Age restriction check
  if (this.ageRestrictedContent && user.dateOfBirth) {
    const age = Math.floor(
      (Date.now() - user.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (age < 18) {
      return false;
    }
  }

  return true;
};

// Static methods
PostSchema.statics.findTrending = function (limit = 20) {
  return this.find({
    isDeleted: false,
    moderationStatus: "approved",
    "visibility.type": { $in: ["public", "ghost"] },
  })
    .sort({ "trending.engagementScore": -1, createdAt: -1 })
    .limit(limit)
    .populate("authorId", "username displayName avatarUrl isVerified");
};

PostSchema.statics.findByHashtag = function (hashtag: string, limit = 50) {
  return this.find({
    hashtags: hashtag,
    isDeleted: false,
    moderationStatus: "approved",
    "visibility.type": "public",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("authorId", "username displayName avatarUrl");
};

PostSchema.statics.findGhostPosts = function (level?: string, limit = 50) {
  const query: any = {
    "ghostMode.isGhostPost": true,
    isDeleted: false,
    moderationStatus: "approved",
  };

  return this.find(query).sort({ createdAt: -1 }).limit(limit);
};

// TTL for ephemeral posts
PostSchema.index(
  { "expiration.expiresAt": 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { "expiration.isEphemeral": true },
  }
);

// Create the model
const Post = mongoose.model<IPost>("Post", PostSchema);
export { Post, ReactionSchema };
