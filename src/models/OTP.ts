import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string;
  type: "password-reset" | "email-verify";
  expiresAt: Date;
  used: boolean;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["password-reset", "email-verify"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index — MongoDB auto-deletes
    },
    used: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, "Too many attempts"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups
OTPSchema.index({ email: 1, type: 1, used: 1 });

const OTP: Model<IOTP> =
  mongoose.models.OTP ?? mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;
