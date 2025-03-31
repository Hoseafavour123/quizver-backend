"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
    });
    const mailOptions = {
        from: `"Quizly" <hoseafavour123@gmail.com>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };
    if (options.attachments && options.attachments[0]) {
        mailOptions.attachments = [
            {
                filename: options && options.attachments && options.attachments[0].filename,
                path: options && options.attachments && options.attachments[0].path,
            },
        ];
    }
    await transporter.sendMail(mailOptions);
};
exports.sendMail = sendMail;
