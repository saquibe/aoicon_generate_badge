// app/api/test-connection/route.ts
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();

    // Test if we can access the user_reg collection
    const count = await db.collection("user_reg").countDocuments();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
      database: db.databaseName,
      userCount: count,
      collections: (await db.listCollections().toArray()).map(
        (col) => col.name
      ),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        uri: process.env.MONGODB_URI ? "URI is set" : "URI is NOT set",
      },
      { status: 500 }
    );
  }
}
