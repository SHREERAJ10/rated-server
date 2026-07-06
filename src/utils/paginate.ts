import { prisma } from "../../db.js";

export const paginate = async (
  page: number,
  pageSize: number,
  modelName: string,
  where: object,
  include: object,
) => {
  const db = prisma[modelName];
  const skip = (+page - 1) * +pageSize;
  const totalCount = await db.count({
    where,
  });
  const items = await db.findMany({
    where: where || {},
    include: include || {},
    skip: skip,
    take: pageSize,
  });

  return {
    items,
    totalCount,
    pageSize: pageSize,
    currentPage: page,
    previousPage: page - 1,
  };
};
