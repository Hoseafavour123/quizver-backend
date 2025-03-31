"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizSchema = void 0;
const zod_1 = require("zod");
exports.quizSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters long'),
    description: zod_1.z.string().optional(),
    duration: zod_1.z.string().regex(/^\d+$/, 'Duration must be a number'),
    category: zod_1.z.string().min(1, 'Category must be at least 3 characters long'),
    questions: zod_1.z
        .array(zod_1.z.object({
        text: zod_1.z.string().min(5, 'Question must be at least 5 characters'),
        image: zod_1.z.string().optional(),
        options: zod_1.z
            .array(zod_1.z.string().min(1))
            .min(2, 'At least two options are required')
            .max(4, 'A maximum of 4 options are allowed'),
        correctAnswer: zod_1.z
            .string()
            .length(1, 'Correct answer must be a single letter'),
    }))
        .min(1, 'At least one question is required'),
});
