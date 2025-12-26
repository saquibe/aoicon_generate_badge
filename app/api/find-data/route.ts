// app/api/find-data/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const results = [];
  const uri =
    "mongodb+srv://mn7331131070_db_user:46X5F4Pl2GpdlBeE@aoiconreg.hpdoot4.mongodb.net/";

  try {
    const client = await MongoClient.connect(uri);
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();

    for (const dbInfo of databases.databases) {
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();

      if (collections.some((col) => col.name === "user_reg")) {
        const count = await db.collection("user_reg").countDocuments();
        results.push({
          database: dbInfo.name,
          hasUserReg: true,
          userRegCount: count,
          collections: collections.map((col) => col.name),
        });
      }
    }

    await client.close();

    return NextResponse.json({
      success: true,
      foundIn: results,
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
