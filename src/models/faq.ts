import { FaqSchema } from "@type/schema";
import mongoose from "mongoose";

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
