
// In a new file, e.g., models/group_model.ts
import { Schema, model, Types } from 'mongoose';
import { IGroup, IGroupMember } from '../types/group_type';


// export interface IGroupMember {
//   userId: Types.ObjectId;
//   role: 'owner' | 'admin' | 'moderator' | 'member';
//   joinedAt: Date;
// }


const GroupMemberSchema = new Schema<IGroupMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'moderator', 'member'],
    default: 'member',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const GroupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    index: true,
    unique: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  avatarUrl: String,
  coverPhotoUrl: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [GroupMemberSchema],
  isPrivate: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },
  postCount: {
    type: Number,
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Export the model
export default model<IGroup>('Group', GroupSchema);