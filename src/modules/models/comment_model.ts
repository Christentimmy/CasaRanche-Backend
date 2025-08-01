import { Schema, model, Types } from "mongoose";
import { ReactionSchema } from "./post_model";

// Separate Comment Schema
const CommentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true, // Important for querying comments for a specific post
    },
    parentId: {
      // This field is for replies
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    isGhostComment: {
      type: Boolean,
      default: false,
    },
    ghostNumber: String,
    reactions: [ReactionSchema], // Re-use your existing reaction schema
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model("Comment", CommentSchema);

export default Comment;
