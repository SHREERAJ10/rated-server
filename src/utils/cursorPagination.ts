import { Prisma } from "@prisma/client/extension";
import { prisma } from "../../db.js";

export interface CursorPaginationParams {
  take: number;
  orderBy?: object;
  model: string;
  where?: object;
  include?: object;
  cursor: object | null;
}

export const cursorPagination = async (
  { take, orderBy, model, where, include, cursor }: CursorPaginationParams,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) => {
  let db;
  if (tx) {
    db = tx[model];
  } else {
    db = prisma[model];
  }

  const items = await db.findMany({
    where: where || {},
    include: include || {},
    take: take,
    skip: cursor ? 1 : 0,
    cursor: cursor ?? undefined,
    orderBy: orderBy || {},
  });

  const nextCursor = items.at(-1)?.id;

  return {
    items: items,
    cursor:
      items.length > 0
        ? {
            id: nextCursor,
          }
        : null,
  };
};
