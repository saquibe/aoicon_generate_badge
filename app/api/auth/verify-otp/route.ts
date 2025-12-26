import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

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

    const db = await getDatabase();
    const usersCollection = db.collection("user_reg");

    const isEmail = identifier.includes("@");
    const isMobile = /^\d{10}$/.test(identifier);

    let user;
    if (isEmail) {
      user = await usersCollection.findOne({
        "Email ID": identifier,
        otp: otp,
        otpExpiry: { $gt: new Date() },
      });
    } else {
      const mobileNumber = parseInt(identifier, 10);
      user = await usersCollection.findOne({
        Mobile: mobileNumber,
        otp: otp,
        otpExpiry: { $gt: new Date() },
      });
    }

    // console.log("OTP verification result:", user ? "VALID" : "INVALID");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP or OTP expired" },
        { status: 401 }
      );
    }

    // Clear OTP after successful verification
    await usersCollection.updateOne(
      { _id: user._id },
      { $unset: { otp: "", otpExpiry: "" } }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user["Full Name"],
        email: user["Email ID"],
        registrationNumber: user["Registration Number"],
        mobile: user["Mobile"].toString(),
        certUrl: user["cert_url"],
      },
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
