import { z } from "zod";

export const rankingSchema = z.object({
  songId: z.number().int().positive(),
  rank: z.number().int().min(1).max(5),
});

export const voteSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    rankings: z.array(rankingSchema).length(5),
    country: z.enum(["BELGIUM", "OTHER"]),
    otherCountry: z.string().optional(),
  })
  .refine(
    (data) => {
      const songIds = data.rankings.map((r) => r.songId);
      return new Set(songIds).size === 5;
    },
    {
      message: "Duplicate songs in ranking",
      path: ["rankings"],
    },
  )
  .refine(
    (data) => {
      const ranks = data.rankings.map((r) => r.rank);
      return new Set(ranks).size === 5;
    },
    {
      message: "Ranks must be unique",
      path: ["rankings"],
    },
  );

export type VoteInput = z.infer<typeof voteSchema>;
