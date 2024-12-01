import Comment from "@models/comment";
import { CommentSchema } from "@schemas/comment";

export const addNewComment = async (id: string, text: string, userId: string): Promise<CommentSchema> => {
  const comment = await Comment.create({
    user: userId,
    podcast: id,
    text: text,
  });
  console.log(comment);
  return comment;
};
