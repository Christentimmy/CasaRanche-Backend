// In a new file, e.g., types/group_type.ts
import { Document, Types } from 'mongoose';

// Member role within the group
export type GroupMemberRole = 'owner' | 'admin' | 'moderator' | 'member';

// Member details
export interface IGroupMember {
  userId: Types.ObjectId;
  role: GroupMemberRole;
  joinedAt: Date;
}

export interface IGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  owner: Types.ObjectId;
  admins: Types.ObjectId[];
  members: IGroupMember[];
  isPrivate: boolean;
  visibility: 'public' | 'private' | 'secret';
  postCount: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}