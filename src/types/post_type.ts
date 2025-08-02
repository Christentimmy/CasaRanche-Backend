import { Document, Types } from "mongoose";

// Media and Content Interfaces
export interface IMediaItem {
  type: "image" | "video" | "audio";
  url: string;
  thumbnailUrl?: string;
  duration?: number; // For video/audio in seconds
  size?: number; // File size in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  metadata?: {
    format?: string | undefined | null;
    quality?: string | undefined | null;
    isProcessed?: boolean;
  };
}

export interface ITextContent {
  text: string;
  formatting?: {
    alignment: "left" | "center" | "right";
    isBold: boolean;
    font?: string;
  };
}

export interface IPollOption {
  id: string;
  text: string;
  voteCount: number;
  voters: Types.ObjectId[]; // User IDs who voted for this option
}

export interface IPoll {
  question: string;
  options: IPollOption[];
  allowMultipleChoices: boolean;
  expiresAt?: Date;
  totalVotes: number;
  isActive: boolean;
}

// Ghost Mode and Verification
export interface IGhostModeSettings {
  isGhostPost: boolean;
  anonymousId: string; // Anonymous identifier for ghost posts
  showVerificationBadge: boolean; // User can toggle verification display
  allowedVerificationTypes: Array<"account" | "school" | "work">; // Which verifications to show
}

// Interaction and Engagement
export interface IReaction {
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  emoji: string;
  count: number;
  users: Types.ObjectId[]; // Users who used this reaction
}

export interface IEngagementStats {
  views: number;
  viewerIds: Types.ObjectId[]; // Track unique viewers
  reactions: IReaction[];
  totalReactions: number;
  // comments: IComment[];
  commentCount: number;
  shares: number;
  sharerIds: Types.ObjectId[];
  saves: number;
  saverIds: Types.ObjectId[];
  reposts: number;
  reposterIds: Types.ObjectId[];
}

// Post Visibility and Privacy
export interface IVisibilitySettings {
  type: "public" | "followers" | "private" | "ghost" | "confession" | "group";
  allowComments: boolean;
  showPostTime: boolean;
  allowSharing: boolean;
  allowReposting: boolean;
  hideFromTimeline: boolean;
  restrictedAgeGroups?: Array<"under18" | "over18">; // For explicit content filtering
  groupId?: Types.ObjectId; // Add this field
}

// Self-destructing posts
export interface IExpirationSettings {
  isEphemeral: boolean;
  expiresAt?: Date;
  autoDeleteAfterHours?: number; // 24 hours, etc.
  viewLimit?: number; // Delete after X views
}

// Location and Context
export interface ILocation {
  name?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isVisible: boolean;
}

// Trending and Analytics
export interface ITrendingMetrics {
  engagementScore: number; // Calculated based on likes, comments, shares
  viralityScore: number; // How fast it's spreading
  trendingRank?: number; // Position in trending feed
  peakEngagementTime?: Date;
  demographicBreakdown?: {
    ageGroups: Map<string, number>;
    locations: Map<string, number>;
  };
}

// AI Engagement
export interface IAiInteraction {
  hasAiEngagement: boolean;
  aiComments: Array<{
    commentId: Types.ObjectId;
    aiPersona: string; // Different AI personalities
    timestamp: Date;
  }>;
  aiReactions: Array<{
    reactionType: string;
    timestamp: Date;
  }>;
}

export interface IContentModeration {
  flaggedFor: {
    nsfw: boolean;
    violence: boolean;
    hate: boolean;
  };
  autoHidden: boolean;
  reviewedByModerator: boolean;
  ageRestricted: boolean;
  moderatedAt?: Date;
}

// Ghost Post specific additions
export interface IGhostPost extends IPost {
  ghostLevel: "A" | "B" | "C" | "D"; // User's ghost level when posting
  ghostNumber: string; // Unique anonymous identifier
  allowedFeatures: {
    canUploadImages: boolean;
    canUploadVideos: boolean;
    canUploadMusic: boolean;
  };
}

// Confession Post specific additions
export interface IConfessionPost extends IPost {
  confessionCategory?: string; // e.g., 'relationship', 'work', 'family'
  isAnonymousVoting: boolean;
  customDisplayName: string;
  customAvatarUrl?: string;
}

// Utility types for post creation and updates
export interface ICreatePostData {
  content: ITextContent;
  media?: IMediaItem[];
  poll?: Omit<IPoll, "totalVotes" | "isActive">;
  postType: "regular" | "ghost" | "confession";
  visibility: IVisibilitySettings;
  ghostMode?: Partial<IGhostModeSettings>;
  confessionDisplayName?: string;
  hashtags?: string[];
  location?: ILocation;
  expiration?: IExpirationSettings;
}

export interface IUpdatePostData {
  content?: Partial<ITextContent>;
  visibility?: Partial<IVisibilitySettings>;
  hashtags?: string[];
  editReason?: string;
}

// For the feed algorithm
export interface IPostFeedItem extends IPost {
  relevanceScore: number;
  reasonForShowing: string; // 'following', 'trending', 'recommended', etc.
  feedCategory: "home" | "ghost" | "confession" | "trending";
}

// Main Post Interface
export interface IPost extends Document {
  // Basic Post Information
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  postType: "regular" | "ghost" | "confession" | "repost";

  // Content
  content: ITextContent;
  media: IMediaItem[];
  poll?: IPoll;

  // Ghost Mode & Anonymity
  ghostMode: IGhostModeSettings;

  // For confession posts - allows custom display name per post
  confessionDisplayName?: string;
  confessionAvatarUrl?: string;

  // For reposts
  originalPostId?: Types.ObjectId;
  repostComment?: string; // User's comment when reposting
  repostChain?: Types.ObjectId[];
  repostDepth?: number;

  // Visibility and Privacy
  visibility: IVisibilitySettings;
  expiration: IExpirationSettings;

  // Engagement and Interactions
  engagement: IEngagementStats;

  // Metadata
  location?: ILocation;
  hashtags: string[];
  mentionedUsers: Types.ObjectId[];

  // Moderation and Safety
  isReported: boolean;
  reportCount: number;
  moderationStatus: "pending" | "approved" | "flagged" | "removed";
  moderationNotes?: string;
  isExplicitContent: boolean;
  ageRestrictedContent: boolean;

  // Analytics and Trending
  trending: ITrendingMetrics;

  // AI Integration
  aiInteraction: IAiInteraction;
  contentModeration: IContentModeration;

  // Post State
  isDeleted: boolean;
  isDraft: boolean;
  isEdited: boolean;
  editHistory?: Array<{
    editedAt: Date;
    previousContent: string;
    editReason?: string;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date; // For scheduled posts
  lastEngagementAt: Date; // For feed algorithm
}

export type PostCapabilities = {
  canWriteText: boolean;
  canAddPhotos: boolean;
  canAddVideos: boolean;
  canAddMusic: boolean;
};

// Map each ghost level to its specific posting capabilities
export const levelCapabilities: Record<
  "A" | "B" | "C" | "D",
  PostCapabilities
> = {
  A: {
    canWriteText: true,
    canAddPhotos: false,
    canAddVideos: false,
    canAddMusic: false,
  },
  B: {
    canWriteText: true,
    canAddPhotos: true,
    canAddVideos: false,
    canAddMusic: false,
  },
  C: {
    canWriteText: true,
    canAddPhotos: true,
    canAddVideos: true,
    canAddMusic: false,
  },
  D: {
    canWriteText: true,
    canAddPhotos: true,
    canAddVideos: true,
    canAddMusic: true,
  },
};
