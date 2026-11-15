import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/verify-otp";

export async function POST(req: NextRequest) {
  try {
    const { identifier, otp } = await req.json();

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, error: "Identifier and OTP are required" },
        { status: 400 }
      );
    }

    // console.log("Verifying OTP for:", identifier, "OTP:", otp);

    const user = await verifyOtp(identifier, otp);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP or OTP expired" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
