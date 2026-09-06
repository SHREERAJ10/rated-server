import * as z from "zod";

const media = z.object({
  publicId: z.string().trim(),
  url: z.string().trim(),
});

export const Post = z.object({
  caption: z.string().trim().max(200).optional(),
  media: z.array(media).min(1).max(10),
});

export const Score = z.object({
  score: z.number().int().lte(10).gte(1),
});

export const Comment = z.object({
  comment: z.string().trim().max(200).min(1),
});
