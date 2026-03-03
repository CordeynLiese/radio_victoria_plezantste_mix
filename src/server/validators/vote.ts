import { z } from "zod";

export const voteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  mixId: z.string().min(1, "Mix selectie is verplicht"),
  country: z.enum(["BELGIUM", "OTHER"]),
  otherCountry: z.string().optional(),
});
