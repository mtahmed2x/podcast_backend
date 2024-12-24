import { Schema, model } from "mongoose";
import { SupportSchema } from "@schemas/support";

const supportSchema = new Schema<SupportSchema>({
    text: {
        type: String,
    },
});

const Support = model<SupportSchema>("Support", supportSchema);
export default Support;
