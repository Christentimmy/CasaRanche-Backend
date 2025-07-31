import { Schema, model, Types } from "mongoose";


// src/modules/ghost/progress.model.ts
const progressSchema = new Schema(
    {
      user: { type: Types.ObjectId, ref: "User" },
      postsCount: { type: Number, default: 0 },
      invitedFriends: { type: Number, default: 0 },
      lastPostAt: Date,
      currentLevel: { type: String, enum: ["A", "B", "C", "D"], default: "A" },
    },
    { timestamps: true }
  );
  
  export default model("PostLevelProgress", progressSchema);
  