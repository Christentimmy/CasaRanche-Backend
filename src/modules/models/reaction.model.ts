
import { Schema, model, Types } from "mongoose";


// src/modules/reaction/reaction.model.ts
const reactionSchema = new Schema(
    {
      user: { type: Types.ObjectId, ref: "User" },
      post: { type: Types.ObjectId, ref: "Post" },
      emoji: { type: String }, // like "❤️", "😂", "😮"
    },
    { timestamps: true }
  );
  
  export default model("Reaction", reactionSchema);
  