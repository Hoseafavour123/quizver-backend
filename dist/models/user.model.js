"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = require("../utils/bcrypt");
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    verified: { type: Boolean, default: false },
    imageUrl: { type: String, default: '' },
    imageInfo: {
        imageUrl: { type: String, default: '' },
        imageId: { type: String, default: '' }
    }
}, { timestamps: true });
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await (0, bcrypt_1.hashValue)(this.password);
    next();
});
userSchema.methods.comparePassword = async function (password) {
    return await (0, bcrypt_1.compareHash)(password, this.password);
};
userSchema.methods.omitPassword = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};
const UserModel = mongoose_1.default.model('User', userSchema);
exports.default = UserModel;
