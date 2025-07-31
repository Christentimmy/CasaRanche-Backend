

import { Schema, model, Types } from "mongoose";

// src/modules/comment/comment.model.ts
const commentSchema = new Schema(
    {
      user: { type: Types.ObjectId, ref: "User" },
      post: { type: Types.ObjectId, ref: "Post" },
      content: { type: String },
      isAI: { type: Boolean, default: false },
      parentComment: { type: Types.ObjectId, ref: "Comment" }, // for replies
    },
    { timestamps: true }
  );
  
  export default model("Comment", commentSchema);
  