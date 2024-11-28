import { AboutSchema } from "@type/schema";
import { Schema, model } from "mongoose";

const AboutSchema = new Schema<AboutSchema>({
  text: {
    type: String,
  },
});

const About = model<AboutSchema>("About", AboutSchema);
export default About;
