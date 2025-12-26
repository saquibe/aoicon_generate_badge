import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { generateOTP, generateOTPExpiry } from "@/lib/otp";
import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { identifier: rawIdentifier } = await req.json();
    const identifier = rawIdentifier?.trim();

    if (!identifier) {
      return NextResponse.json(
        { error: "Email or mobile number is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection("user_reg");

    const isEmail = identifier.includes("@");
    const isMobile = /^\d{10}$/.test(identifier);

    if (!isEmail && !isMobile) {
      return NextResponse.json(
        { error: "Please enter a valid email or 10-digit mobile number" },
        { status: 400 }
      );
    }

    // console.log("Searching for:", identifier);
    // console.log("Is email:", isEmail);
    // console.log("Is mobile:", isMobile);

    let user;
    if (isEmail) {
      // For email search - exact match
      user = await usersCollection.findOne({
        "Email ID": identifier,
      });
    } else {
      // For mobile search - convert to number
      // Mobile numbers are stored as numbers (7331131070) not strings
      const mobileNumber = parseInt(identifier, 10);
      user = await usersCollection.findOne({
        Mobile: mobileNumber,
      });
    }

    // console.log("Query result:", user ? "FOUND" : "NOT FOUND");
    // if (user) {
    //   console.log("User found:", {
    //     name: user["Full Name"],
    //     email: user["Email ID"],
    //     mobile: user["Mobile"],
    //     mobileType: typeof user["Mobile"],
    //   });
    // }

    if (!user) {
      return NextResponse.json(
        { error: "No registration found with this email/mobile number" },
        { status: 404 }
      );
    }

    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          otp,
          otpExpiry,
        },
      }
    );

    // console.log("OTP generated:", otp, "for:", identifier);

    // For testing - skip actual email/SMS sending
    // TODO: Uncomment when ready for production

    if (isEmail) {
      await sendEmail(identifier, otp);
    } else {
      await sendSMS(identifier, otp);
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to your ${isEmail ? "email" : "mobile"}`,
      type: isEmail ? "email" : "mobile",
      // For testing - include OTP in response
      testOtp: otp,
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
