import mongoose from "mongoose";
import { hashValue, compareHash } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
    email: string;
    password: string;
    firstName: string;
    lastName:string;
    verified: boolean;
    imageUrl: string;
    imageInfo: { imageUrl: string; imageId: string };
    createdAt: Date;
    updatedAt: Date;
    comparePassword: (password: string) => Promise<boolean>;
    omitPassword: () => Omit<UserDocument, 'password'>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    verified: { type: Boolean, default: false },
    imageUrl:{type: String, default: ''},
    imageInfo: {
      imageUrl: { type: String, default: '' },
      imageId: { type: String, default: ''}}
  },
  { timestamps: true }
)

userSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await hashValue(this.password);
    next()
})

userSchema.methods.comparePassword = async function (password: string) {
    return await compareHash(password, this.password)
}

userSchema.methods.omitPassword = function () {
    const user = this.toObject();
    delete user.password;
    return user;
}

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;