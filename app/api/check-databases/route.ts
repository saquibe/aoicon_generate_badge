// app/api/check-databases/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    // Connect without specifying a database
    const client = await MongoClient.connect(
      "mongodb+srv://mn7331131070_db_user:46X5F4Pl2GpdlBeE@aoiconreg.hpdoot4.mongodb.net/"
    );

    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();

    await client.close();

    return NextResponse.json({
      success: true,
      databases: databases.databases.map((db) => ({
        name: db.name,
        size: db.sizeOnDisk,
      })),
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
