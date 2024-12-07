import { z } from "zod";
import { Role } from "@shared/enums";

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid ObjectId format",
});

export const FileSchema = z.object({
  path: z.string().min(1, "File path is required"),
  mimetype: z.string().min(1, "Mimetype is required"),
  size: z.number().min(1, "File size must be greater than 0"),
});

export const AuthValidatorSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(30),
    // .refine((value) => /[a-z]/.test(value))
    // .refine((value) => /[A-Z]/.test(value)),
    confirmPassword: z.string(),
    role: z.nativeEnum(Role).refine((value) => Object.values(Role).includes(value)),
    verificationOTP: z.string().optional(),
    verificationOTPExpire: z.date().nullish(),
    isVerified: z.boolean().default(false),
    isBlocked: z.boolean().default(false),
    subscriptionType: z.string().default("free"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export const createPodcastValidationSchema = z.object({
  categoryId: ObjectIdSchema,
  subCategoryId: ObjectIdSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
});

export const EmailValidationSchema = z.object({
  email: z.string().email(),
});

export const OTPValidationSchema = z.object({
  verificationOTP: z.string().length(6),
});

export const PasswordValidationSchema = z
  .object({
    password: z.string().min(6).max(30),
    // .refine((value) => /[a-z]/.test(value))
    // .refine((value) => /[A-Z]/.test(value)),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });
