import { AdminSchema } from "@type/schema";
import { Schema, model } from "mongoose";

const adminSchema = new Schema<AdminSchema>({
  auth: {
    type: Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Admin = model<AdminSchema>("Admin", adminSchema);
export default Admin;
