import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/apiAuth";

export const GET = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mixes = await prisma.mix.findMany({
      select: {
        id: true,
        artist: true,
        // title column still exists in DB until the migration runs, but we
        // no longer expose it to clients
      },
      orderBy: {
        artist: "asc",
      },
    });

    return NextResponse.json({ mixes });
  } catch (error) {
    console.error("Failed to fetch mixes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
