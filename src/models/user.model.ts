import * as z from "zod";

export const User = z.object({
  username: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-zA-Z0-9 ]*$/),
  displayName: z.string().trim().max(40),
  bio: z.string().trim().max(60).optional(),
  pfpUrl: z.string().trim(),
});
