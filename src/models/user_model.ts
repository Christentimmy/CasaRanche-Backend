import { Schema, model, Types } from "mongoose";
import { IUser } from "../types/user_type";
import { levelCapabilities } from "../types/post_type";
import { PostCapabilities } from "../types/post_type";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    anonymousId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    username: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores",
      ],
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    coverPhotoUrl: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
    },
    education: {
      type: String,
      default: "",
    },
    work: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verification: {
      type: {
        type: String,
        enum: ["school", "work", null],
        default: null,
      },
      documentUrl: {
        type: String,
        default: null,
      },
      approved: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      institution: {
        name: String,
        email: String,
        position: String, // For work verification
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
      },
    },
    preferences: {
      ghostLevel: {
        type: String,
        enum: ["A", "B", "C", "D"],
        default: "A",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      showVerificationInGhost: {
        type: Boolean,
        default: true,
      },
      notificationSettings: {
        email: {
          newFollower: { type: Boolean, default: true },
          postInteractions: { type: Boolean, default: true },
          directMessages: { type: Boolean, default: true },
          ghostMessages: { type: Boolean, default: true },
          weeklyDigest: { type: Boolean, default: true },
        },
        push: {
          newFollower: { type: Boolean, default: true },
          postInteractions: { type: Boolean, default: true },
          directMessages: { type: Boolean, default: true },
          ghostMessages: { type: Boolean, default: true },
        },
      },
      privacy: {
        showOnlineStatus: { type: Boolean, default: true },
        allowMessagesFrom: {
          type: String,
          enum: ["everyone", "followed", "nobody"],
          default: "everyone",
        },
        showLastSeen: { type: Boolean, default: true },
        showActivityStatus: { type: Boolean, default: true },
      },
    },
    stats: {
      postCount: { type: Number, default: 0 },
      followerCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      ghostPostCount: { type: Number, default: 0 },
      confessionCount: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalShares: { type: Number, default: 0 },
    },
    accountStatus: {
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: false },
      isProfileCompleted: { type: Boolean, default: false },
      isBanned: { type: Boolean, default: false },
      banReason: { type: String, default: null },
      lastActive: { type: Date, default: Date.now },
      deletionRequested: { type: Boolean, default: false },
      deletionScheduled: { type: Date, default: null },
    },
    socialLinks: [
      {
        platform: String,
        url: String,
        visibility: {
          type: String,
          enum: ["public", "followers", "private"],
          default: "public",
        },
      },
    ],
    blockedUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    // For tracking user progression through ghost levels
    ghostProgression: {
      level: { type: String, enum: ["A", "B", "C", "D"], default: "A" },
      postsMade: { type: Number, default: 0 },
      daysActive: { type: Number, default: 0 },
      friendsInvited: { type: Number, default: 0 },
      lastLevelUp: { type: Date, default: Date.now },
      nextLevelRequirements: {
        postsNeeded: { type: Number, default: 0 },
        friendsNeeded: { type: Number, default: 0 },
        daysActiveNeeded: { type: Number, default: 0 },
      },
    },
    // For AI engagement tracking
    aiEngagement: {
      lastInteraction: { type: Date, default: null },
      interactionCount: { type: Number, default: 0 },
      preferences: {
        frequency: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        topics: [{ type: String }],
        timesOfDay: [
          {
            hour: { type: Number, min: 0, max: 23 },
            frequency: { type: Number, min: 1, max: 10 },
          },
        ],
      },
    },
    // For future features
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ "verification.status": 1 });
userSchema.index({ "accountStatus.lastActive": -1 });
userSchema.index({ "ghostProgression.level": 1 });

// This can be a static map or a function that returns the requirements
const levelRequirements = {
  B: { posts: 90, friends: 60, daysActive: 7 },
  C: { posts: 440, friends: 150, daysActive: null },
  D: { posts: 2300, friends: 550, daysActive: null },
};

userSchema.methods.checkAndUpgradeGhostLevel = async function (this: IUser) {
  const currentLevel = this.ghostProgression.level;

  if (currentLevel === "D") {
    // User is already at the highest level, no upgrade needed.
    return;
  }

  const nextLevel = getNextLevel(currentLevel);
  if (nextLevel == null) return;
  const requirements = levelRequirements[nextLevel];

  const meetsPostsReq = this.ghostProgression.postsMade >= requirements.posts;
  const meetsFriendsReq =
    this.ghostProgression.friendsInvited >= requirements.friends;
  const meetsDaysActiveReq =
    requirements.daysActive === null ||
    this.ghostProgression.daysActive >= requirements.daysActive;

  if ((meetsPostsReq || meetsFriendsReq) && meetsDaysActiveReq) {
    // User has met the requirements, upgrade their level
    this.ghostProgression.level = nextLevel;
    this.ghostProgression.lastLevelUp = new Date();
    // You might want to reset the progress for the new level's requirements if you track that
    // For example: this.ghostProgression.postsMade = 0;
    await this.save();
    console.log(
      `User ${this.username} has been upgraded to level ${nextLevel}.`
    );
  }
};

// Helper function to get the next level
function getNextLevel(current: "A" | "B" | "C" | "D"): "B" | "C" | "D" | null {
  switch (current) {
    case "A":
      return "B";
    case "B":
      return "C";
    case "C":
      return "D";
    default:
      return null;
  }
}

// Implement the new instance method on the user schema
userSchema.methods.getGhostLevelCapabilities = function (
  this: IUser
): PostCapabilities {
  const userLevel = this.ghostProgression.level;
  return levelCapabilities[userLevel];
};

export default model<IUser>("User", userSchema);
