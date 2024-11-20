import { Document, Schema, Types, model } from "mongoose";

export type CommentDocument = Document & {
  user: Types.ObjectId;
  podcast: Types.ObjectId;
  text: string;
};

const commentSchema = new Schema<CommentDocument>({
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
    required: true,
  },
});

const Comment = model<CommentDocument>("Comment", commentSchema);
export default Comment;
