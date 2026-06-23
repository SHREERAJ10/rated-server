import * as z from "zod";

export const Post = z.object({
  caption: z.string().trim().max(200).optional(),
  media: z.array(z.string().trim()),
});
