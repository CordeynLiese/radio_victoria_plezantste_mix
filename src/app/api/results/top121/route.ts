import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorized } from "@/lib/apiAuth";

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const adminToken = url.searchParams.get("token");

  const isAllowed =
    isAuthorized(req) && adminToken === process.env.ADMIN_RESULTS_TOKEN;

  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    
  try {
    const top121 = await prisma.voteItem.groupBy({
      by: ["songId"],
      _sum: {
        points: true,
      },
      orderBy: {
        _sum: {
          points: "desc",
        },
      },
      take: 121,
    });

    const songIds = top121.map((r) => r.songId);
    const songs = await prisma.song.findMany({
      where: { id: { in: songIds } },
    });

    const results = top121.map((r) => {
      const song = songs.find((s) => s.id === r.songId);
      return {
        songId: r.songId,
        title: song?.title,
        artist: song?.artist,
        year: song?.year,
        totalPoints: r._sum.points,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
