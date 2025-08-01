
// In a new file, e.g., types/comment_type.ts
import { Document, Types } from 'mongoose';
import { IReaction } from './post_type'; // Import the reaction interface

export interface IComment extends Document {
    postId: Types.ObjectId;
    parentId?: Types.ObjectId;
    authorId: Types.ObjectId;
    content: string;
    isGhostComment: boolean;
    ghostNumber?: string;
    reactions: IReaction[];
    isDeleted: boolean;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}