import { Role } from "@shared/enums";

export type DecodedUser = {
  authId: string;
  userId: string;
  creatorId?: string;
  adminId?: string;
  name: string;
  role: Role;
  email: string;
  isVerified: boolean;
  isApproved: boolean;
  isBlocked: boolean;
  locationPreference: string;
};
