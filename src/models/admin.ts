import { Document, Schema, Types, model } from "mongoose";

export type AdminDocument = Document & {
  auth: Types.ObjectId;
  user: Types.ObjectId;
};

const AdminSchema = new Schema<AdminDocument>({
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

const Admin = model<AdminDocument>("Admin", AdminSchema);
export default Admin;
