import { Document, Types } from "mongoose";

// Define the interfaces for nested objects first
interface IVerificationInstitution {
  name: string;
  email: string;
  position?: string; // Optional for work verification
  status: "pending" | "approved" | "rejected";
}

interface IVerification {
  type: "school" | "work" | null;
  documentUrl: string | null;
  approved: boolean;
  verifiedAt: Date | null;
  institution?: IVerificationInstitution;
}

interface IEmailNotificationSettings {
  newFollower: boolean;
  postInteractions: boolean;
  directMessages: boolean;
  ghostMessages: boolean;
  weeklyDigest: boolean;
}

interface IPushNotificationSettings {
  newFollower: boolean;
  postInteractions: boolean;
  directMessages: boolean;
  ghostMessages: boolean;
}

interface IPrivacySettings {
  showOnlineStatus: boolean;
  allowMessagesFrom: "everyone" | "followed" | "nobody";
  showLastSeen: boolean;
  showActivityStatus: boolean;
}

interface IPreferences {
  ghostLevel: "A" | "B" | "C" | "D";
  theme: "light" | "dark" | "system";
  showVerificationInGhost: boolean;
  notificationSettings: {
    email: IEmailNotificationSettings;
    push: IPushNotificationSettings;
  };
  privacy: IPrivacySettings;
}

interface IStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
  ghostPostCount: number;
  confessionCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

interface IAccountStatus {
  isActive: boolean;
  isEmailVerified: boolean;
  isBanned: boolean;
  banReason: string | null;
  lastActive: Date;
  deletionRequested: boolean;
  deletionScheduled: Date | null;
}

interface ISocialLink {
  platform: string;
  url: string;
  visibility: "public" | "followers" | "private";
}

interface IGhostProgression {
  level: "A" | "B" | "C" | "D";
  postsMade: number;
  
  friendsInvited: number;
  daysActive: number;
  lastLevelUp: Date;
  nextLevelRequirements: {
    postsNeeded: number;
    friendsNeeded: number;
    daysActiveNeeded: number;
  };
}

interface IAiEngagementPreferences {
  frequency: "low" | "medium" | "high";
  topics: string[];
  timesOfDay: Array<{
    hour: number;
    frequency: number;
  }>;
}

interface IAiEngagement {
  lastInteraction: Date | null;
  interactionCount: number;
  preferences: IAiEngagementPreferences;
}

// Main User Document Interface
export interface IUser extends Document {
  email?: string; 
  password?: string;
  anonymousId: string;
  username?: string;
  displayName?: string;
  bio: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  dateOfBirth?: Date;
  isVerified: boolean;
  verification: IVerification;
  preferences: IPreferences;
  stats: IStats;
  accountStatus: IAccountStatus;
  socialLinks: ISocialLink[];
  blockedUsers: Types.ObjectId[];
  ghostProgression: IGhostProgression;
  aiEngagement: IAiEngagement;
  metadata: Map<string, any>; // Mongoose.Schema.Types.Mixed becomes 'any' in TypeScript
  role: "user" | "admin";
  
  // Mongoose adds these properties
  createdAt: Date;
  updatedAt: Date;
}
