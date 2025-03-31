"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verificationCodeSchema = exports.registerSchema = exports.loginSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z.string().email().min(1).max(255);
const passwordSchema = zod_1.z.string().min(6).max(255);
exports.loginSchema = zod_1.z.object({
    email: exports.emailSchema,
    password: passwordSchema,
    userAgent: zod_1.z.string().optional(),
});
exports.registerSchema = exports.loginSchema
    .extend({
    confirmPassword: passwordSchema,
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.verificationCodeSchema = zod_1.z.string().min(1).max(24);
exports.resetPasswordSchema = zod_1.z.object({
    password: passwordSchema,
    verificationCode: exports.verificationCodeSchema,
});
