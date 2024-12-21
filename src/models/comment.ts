import { Schema, model } from "mongoose";
import { CommentSchema } from "@schemas/comment";

const commentSchema = new Schema<CommentSchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  podcast: {
    type: Schema.Types.ObjectId,
    ref: "Podcast",
    required: true,
  },
  text: {
    type: String,
  },
});

const Comment = model<CommentSchema>(
  "Comment",
  commentSchema,
);
export default Comment;
