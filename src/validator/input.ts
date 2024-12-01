import { z } from "zod";
import { Role } from "@shared/enums";
export const AuthValidatorSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(30)
      .refine((value) => /[a-z]/.test(value))
      .refine((value) => /[A-Z]/.test(value)),
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

export const TaCValidatorSchema = z.object({
  text: z.string(),
});

export const AboutValidatorSchema = z.object({
  text: z.string(),
});
