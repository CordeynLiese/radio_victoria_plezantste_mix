import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/apiAuth";

export const POST = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mixes = [
      { artist: "SKIEVE LAVABO'S" },
      { artist: "DJ TIBBE" },
      { artist: "DJ STALPONY" },
      { artist: "DJ'S STOFFEL & CALLE" },
      { artist: "DJ LORREKE" },
      { artist: "DJ JORRE" },
      { artist: "DJ CLIFF RIXX" },
      { artist: "DISCOBAR DE TONKEES" },
      { artist: "DISCOBAR ADVENTURE" },
      { artist: "BASSFRONT" },
      { artist: "APWESKILADZE" },
      { artist: "DJ MAZZLETOV" },
      { artist: "DJ MARLEENTJE" },
      { artist: "DJ DIETER/DEN DIZJE" },
      { artist: "DI-CHAUD'Ké" },
      { artist: "MC TISCHJ" },
    ];

    const result = await prisma.mix.createMany({
      data: mixes.map((mix) => ({
        artist: mix.artist,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      created: result.count,
      message: `${result.count} mixes created successfully`,
    });
  } catch (error) {
    console.error("Error populating mixes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};

export const GET = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    info: "POST to this endpoint to populate mixes (no body required)",
    example: {
      method: "POST",
      body: null,
    },
  });
};
