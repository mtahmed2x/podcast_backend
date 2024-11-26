import mongoose from "mongoose";

export type FaqDocument = mongoose.Document & {
  question: string;
  answer: string;
};

const faqSchema = new mongoose.Schema<FaqDocument>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const Faq = mongoose.model<FaqDocument>("Faq", faqSchema);
export default Faq;
