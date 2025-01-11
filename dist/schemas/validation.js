"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordValidationSchema = exports.OTPValidationSchema = exports.EmailValidationSchema = exports.createPodcastValidationSchema = exports.AuthValidatorSchema = exports.FileSchema = exports.ObjectIdSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../shared/enums");
exports.ObjectIdSchema = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid ObjectId format",
});
exports.FileSchema = zod_1.z.object({
    path: zod_1.z.string().min(1, "File path is required"),
    mimetype: zod_1.z.string().min(1, "Mimetype is required"),
    size: zod_1.z.number().min(1, "File size must be greater than 0"),
});
exports.AuthValidatorSchema = zod_1.z
    .object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(30),
    // .refine((value) => /[a-z]/.test(value))
    // .refine((value) => /[A-Z]/.test(value)),
    confirmPassword: zod_1.z.string(),
    role: zod_1.z.nativeEnum(enums_1.Role).refine((value) => Object.values(enums_1.Role).includes(value)),
    verificationOTP: zod_1.z.string().optional(),
    verificationOTPExpire: zod_1.z.date().nullish(),
    isVerified: zod_1.z.boolean().default(false),
    isBlocked: zod_1.z.boolean().default(false),
    subscriptionType: zod_1.z.string().default("free"),
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
exports.createPodcastValidationSchema = zod_1.z.object({
    categoryId: exports.ObjectIdSchema,
    subCategoryId: exports.ObjectIdSchema,
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    location: zod_1.z.string().min(1, "Location is required"),
});
exports.EmailValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.OTPValidationSchema = zod_1.z.object({
    verificationOTP: zod_1.z.string().length(6),
});
exports.PasswordValidationSchema = zod_1.z
    .object({
    password: zod_1.z.string().min(6).max(30),
    // .refine((value) => /[a-z]/.test(value))
    // .refine((value) => /[A-Z]/.test(value)),
    confirmPassword: zod_1.z.string(),
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
