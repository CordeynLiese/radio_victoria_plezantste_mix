import { isAuthorized } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const songs = await prisma.song.findMany({
      select: {
        id: true,
        artist: true,
        title: true,
        year: true,
      },
      orderBy: {
        artist: "asc",
      },
    });

    return NextResponse.json({ songs });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          "Er ging iets mis met het ophalen van de nummers, probeer het later opnieuw",
      },
      { status: 500 },
    );
  }
};
