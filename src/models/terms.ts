import { Document, model, Schema } from "mongoose";
import { z } from "zod";
import { TermValidatorSchema } from "@validator/input";

type TermSchema = Document & z.infer<typeof TermValidatorSchema>;

const termSchema = new Schema<TermSchema>({
  text: {
    type: String,
  },
});

const Term = model<TermSchema>("Term", termSchema);
export default Term;
