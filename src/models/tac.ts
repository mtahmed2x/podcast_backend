import { TaCSchema } from "@type/schema";
import { Schema, model } from "mongoose";

const tacSchema = new Schema<TaCSchema>({
  text: {
    type: String,
  },
});

const TaC = model<TaCSchema>("TaC", tacSchema);
export default TaC;
