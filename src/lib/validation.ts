import { z } from "zod";

export const voteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  rankings: z
    .array(z.object({ songId: z.number(), rank: z.number() }))
    .length(5)
    .refine(
      (arr) => new Set(arr.map((r) => r.songId)).size === 5,
      "Songs must be unique",
    ),
});
