import mongoose from "mongoose";
import { hashValue, compareHash } from "../utils/bcrypt";

export interface AdminDocument extends mongoose.Document {
  name: string
  email: string
  password: string
  verified: boolean
  imageInfo: { imageUrl: string; imageId: string }
  createdAt: Date
  updatedAt: Date
  comparePassword: (password: string) => Promise<boolean>
  omitPassword: () => Omit<AdminDocument, 'password'>
}

const AdminSchema = new mongoose.Schema<AdminDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageInfo: {
      imageUrl: { type: String, default:'' },
      imageId: { type: String, default:'' },
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

AdminSchema.pre<AdminDocument>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await hashValue(this.password);
    next()
})

AdminSchema.methods.comparePassword = async function (password: string) {
    return await compareHash(password, this.password)
}

AdminSchema.methods.omitPassword = function () {
    const user = this.toObject();
    delete user.password;
    return user;
}

const AdminModel = mongoose.model<AdminDocument>('Admin', AdminSchema);

export default AdminModel;