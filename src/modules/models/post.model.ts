// src/modules/models/post.model.ts
import { Schema, model, Types, Document } from "mongoose";

export type ReactionType = 'like' | 'laugh' | 'love' | 'wow' | 'sad' | 'angry' | 'support';

export interface IPost extends Document {
  user: Types.ObjectId | null;
  type: 'ghost' | 'confession';
  content: string | null;
  contentStyle?: {
    textAlign?: 'left' | 'center' | 'right';
    isBold?: boolean;
  };
  media: {
    photoUrls: string[];
    videoUrls: string[];
    musicUrls: string[];
  };
  anonymousDisplay: {
    nickname: string | null;
    showProfile: boolean;
    showVerification: boolean;
  };
  tags: string[];
  visibility: 'public' | 'private' | 'followers' | 'ghost';
  expiresAt: Date | null;
  ghostLevelRequired: 'A' | 'B' | 'C' | 'D' | null;
  stats: {
    views: number;
    reactions: Record<ReactionType, number>;
    saves: number;
    shares: number;
    reposts: number;
    comments: number;
  };
  allowComments: boolean;
  isPinned: boolean;
  poll?: {
    question: string;
    options: Array<{
      text: string;
      votes: number;
      voters: Types.ObjectId[];
    }>;
    isMultiSelect: boolean;
    totalVotes: number;
    endsAt?: Date;
  };
  isAIEngaged: boolean;
  aiInteractions: Array<{
    type: 'comment' | 'reaction' | 'share';
    content?: string;
    reactionType?: ReactionType;
    timestamp: Date;
  }>;
}

const postSchema = new Schema<IPost>(
  {
    user: { type: Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['ghost', 'confession'], required: true },
    content: { type: String },
    contentStyle: {
      textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
      isBold: { type: Boolean, default: false }
    },
    media: {
      photoUrls: { type: [String], default: [] },
      videoUrls: { type: [String], default: [] },
      musicUrls: { type: [String], default: [] },
    },
    anonymousDisplay: {
      nickname: { type: String, default: null },
      showProfile: { type: Boolean, default: false },
      showVerification: { type: Boolean, default: true },
    },
    tags: { type: [String], default: [] },
    visibility: { 
      type: String, 
      enum: ['public', 'private', 'followers', 'ghost'], 
      default: 'public' 
    },
    expiresAt: { type: Date, default: null },
    ghostLevelRequired: { 
      type: String, 
      enum: ['A', 'B', 'C', 'D', null],
      default: null 
    },
    stats: {
      views: { type: Number, default: 0, min: 0 },
      reactions: {
        like: { type: Number, default: 0 },
        laugh: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 },
        support: { type: Number, default: 0 },
      },
      saves: { type: Number, default: 0, min: 0 },
      shares: { type: Number, default: 0, min: 0 },
      reposts: { type: Number, default: 0, min: 0 },
      comments: { type: Number, default: 0, min: 0 },
    },
    allowComments: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    poll: {
      question: { type: String },
      options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 },
        voters: [{ type: Types.ObjectId, ref: 'User' }]
      }],
      isMultiSelect: { type: Boolean, default: false },
      totalVotes: { type: Number, default: 0 },
      endsAt: { type: Date }
    },
    isAIEngaged: { type: Boolean, default: false },
    aiInteractions: [{
      type: { type: String, enum: ['comment', 'reaction', 'share'] },
      content: { type: String },
      reactionType: { type: String },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Indexes for better query performance
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ 'tags': 1 });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IPost>('Post', postSchema);
