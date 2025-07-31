
import { Schema, model, Types } from "mongoose";


// src/modules/message/message.model.ts
const messageSchema = new Schema(
    {
      from: { type: Types.ObjectId, ref: "User" },
      to: { type: Types.ObjectId, ref: "User" },
      content: { type: String },
      media: {
        photo: String,
        video: String,
        audio: String,
      },
      isGhostMessage: { type: Boolean, default: false },
      deletedBy: [{ type: Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
  );
  
  export default model("Message", messageSchema);
  