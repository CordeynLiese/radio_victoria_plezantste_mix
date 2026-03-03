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
    const results = await prisma.vote.groupBy({
      by: ["mixId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Include mix info
    const mixIds = results.map((r) => r.mixId);
    const mixes = await prisma.mix.findMany({
      where: { id: { in: mixIds } },
    });

    const formattedResults = results.map((r) => {
      const mix = mixes.find((m) => m.id === r.mixId);
      return {
        mixId: r.mixId,
        artist: mix?.artist,
        voteCount: r._count.id,
      };
    });

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
