import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { voteSchema } from "@/server/validators/vote";
import { hashIp } from "@/lib/ip";
import { normalizeEmail } from "@/lib/normalizeEmail";
import { Prisma } from "@/generated/client";
import { isAuthorized } from "@/lib/apiAuth";

const pointsByRank: Record<number, number> = {
  1: 5,
  2: 4,
  3: 3,
  4: 2,
  5: 1,
};

export const POST = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { email, name, city, postalCode, country, otherCountry, rankings } =
      parsed.data;

    /* -----------------------------
     * Email normalization (+alias)
     * ----------------------------- */
    const emailNormalized = normalizeEmail(email);

    /* -----------------------------
     * IP hashing + rate limit
     * ----------------------------- */
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0] ?? "unknown";
    const ipHash = hashIp(ip);

    const ipVoteCount = await prisma.vote.count({
      where: { ipHash },
    });

    if (ipVoteCount >= 5) {
      return NextResponse.json(
        { error: "Oops, je hebt al eens gestemd!" },
        { status: 429 },
      );
    }

    /* -----------------------------
     * Email uniqueness check
     * ----------------------------- */
    const existingVote = await prisma.vote.findUnique({
      where: { emailNormalized },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "Oops, je hebt al eens gestemd!" },
        { status: 409 },
      );
    }

    /* -----------------------------
     * Persist vote + rankings
     * ----------------------------- */
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const vote = await tx.vote.create({
        data: {
          email,
          emailNormalized,
          name,
          city,
          zipcode: postalCode,
          country,
          otherCountry: country === "OTHER" ? otherCountry : null,
          ipHash,
        },
      });

      await tx.voteItem.createMany({
        data: rankings.map((ranking) => ({
          voteId: vote.id,
          songId: ranking.songId,
          points: pointsByRank[ranking.rank],
        })),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Er ging iets mis met het uploaden van jouw stem:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
