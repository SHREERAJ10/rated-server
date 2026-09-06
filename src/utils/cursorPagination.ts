import { prisma } from "../../db.js";

export interface CursorPaginationParams {
  take: number;
  orderBy?: object;
  model: string;
  where?: object;
  include: object;
  cursor: object;
}

export const cursorPagination = async ({
  take,
  orderBy,
  model,
  where,
  include,
  cursor,
}: CursorPaginationParams) => {
  const db = prisma[model];

  const items = await db.findMany({
    where: where || {},
    include: include || {},
    take: take,
    skip: cursor ? 1 : 0,
    cursor: cursor ?? undefined,
    orderBy: orderBy || {},
  });

  const postId = items.at(-1)?.id;
  const feedScore = items.at(-1)?.feedScore;

  return {
    items: items,
    cursor:
      items.length > 0
        ? {
            id: postId,
            feedScore: feedScore,
          }
        : null,
  };
};
