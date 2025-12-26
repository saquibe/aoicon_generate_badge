// app/api/test-data/route.ts
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { Long } from "mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection("user_reg");

    // Get all users
    const allUsers = await usersCollection.find({}).toArray();

    // Test email search
    const emailUser = await usersCollection.findOne({
      "Email ID": "md.saquib@saascraft.studio",
    });

    // Test mobile search
    const mobileLong = Long.fromString("8090990158");
    const mobileUser = await usersCollection.findOne({
      Mobile: mobileLong,
    });

    return NextResponse.json({
      success: true,
      totalUsers: allUsers.length,
      sampleUsers: allUsers.map((u) => ({
        name: u["Full Name"],
        email: u["Email ID"],
        mobile: u["Mobile"]?.toString(),
        mobileType: typeof u["Mobile"],
      })),
      emailSearch: emailUser ? "Found" : "Not found",
      mobileSearch: mobileUser ? "Found" : "Not found",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
