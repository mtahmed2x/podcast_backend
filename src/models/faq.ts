import mongoose from "mongoose";
import {FaqSchema} from "@schemas/faq";

const faqSchema = new mongoose.Schema<FaqSchema>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const Faq = mongoose.model<FaqSchema>("Faq", faqSchema);
export default Faq;
