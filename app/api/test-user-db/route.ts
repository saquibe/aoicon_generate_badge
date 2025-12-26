// app/api/test-user-db/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://mn7331131070_db_user:46X5F4Pl2GpdlBeE@aoiconreg.hpdoot4.mongodb.net/user?retryWrites=true&w=majority&appName=aoiconReg"
    );
    const db = client.db("user");

    const collections = await db.listCollections().toArray();
    let userRegCount = 0;

    if (collections.some((col) => col.name === "user_reg")) {
      userRegCount = await db.collection("user_reg").countDocuments();
    }

    await client.close();

    return NextResponse.json({
      success: true,
      database: "user",
      collections: collections.map((col) => col.name),
      userRegCount: userRegCount,
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
