import mongoose, { Schema, Document } from "mongoose";

interface IPaymentProfile extends Document {
    name: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    userId: mongoose.Types.ObjectId
}

const PaymentProfileSchema: Schema = new Schema<IPaymentProfile>(
  {
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    bankCode: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
)

export default mongoose.model<IPaymentProfile>("PaymentProfile", PaymentProfileSchema);