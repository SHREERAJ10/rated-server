import * as z from "zod";

export const Post = z.object({
  caption: z.string().trim().max(200).optional(),
  media: z.array(z.string().trim()),
});

export const Score = z.object({
  score: z.number().int().lte(10).gte(1),
});
