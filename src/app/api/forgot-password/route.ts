import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendOTPEmail } from "@/lib/email";
import { generateOTP, otpExpiresAt } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    await connectDB();

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent.",
      });
    }

    // ✅ Rate limiting: count BEFORE deleting
    const recentCount = await OTP.countDocuments({
      email,
      type: "password-reset",
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try again in 1 hour." },
        { status: 429 }
      );
    }

    // ✅ Delete AFTER counting
    await OTP.deleteMany({ email, type: "password-reset", used: false });

    const rawOTP = generateOTP(6);
    const hashedOTP = await bcrypt.hash(rawOTP, 10);

    await OTP.create({
      email,
      otp: hashedOTP,
      type: "password-reset",
      expiresAt: otpExpiresAt(15),
    });

    await sendOTPEmail(email, rawOTP, user.name);

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}