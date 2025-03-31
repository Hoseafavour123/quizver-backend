"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = require("../utils/bcrypt");
const AdminSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageInfo: {
        imageUrl: { type: String, default: '' },
        imageId: { type: String, default: '' },
    },
    verified: { type: Boolean, default: false },
}, { timestamps: true });
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await (0, bcrypt_1.hashValue)(this.password);
    next();
});
AdminSchema.methods.comparePassword = async function (password) {
    return await (0, bcrypt_1.compareHash)(password, this.password);
};
AdminSchema.methods.omitPassword = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};
const AdminModel = mongoose_1.default.model('Admin', AdminSchema);
exports.default = AdminModel;
