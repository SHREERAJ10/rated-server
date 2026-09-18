import type { Prisma } from "@prisma/client/extension";
import { prisma } from "../../db.js";
import { getPostRating } from "../services/post.service.js";

export const FeedRank = async (
  postId: string,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) => {
  //Feed Score Range: 0 - 100

  // Weights for different metrics
  const COMMENT_WEIGHT = 0.4;
  const RATING_COUNT_WEIGHT = 0.3;
  const RATING_SCORE_WEIGHT = 0.3;
  const LIKE_WEIGHT = 0.1;

  const postData = await db.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      createdAt: true,
      _count: {
        select: {
          like: true,
          comment: true,
          rating: true,
        },
      },
    },
  });

  const postCreationDate: Date = postData.createdAt;
  const today = new Date();
  const postAge = Number(
    ((today.getTime() - postCreationDate.getTime()) / (1000 * 60 * 60)).toFixed(
      0,
    ),
  ); //age in hours

  let ratingScore = 0;
  if (postData._count.rating !== 0) {
    const postRating = await getPostRating([postId], db);
    ratingScore = Number(postRating[0]._avg.score.toFixed(1)) * 10;
  }

  //normalize metrics into range 0 - 100

  const metrics = {
    count: {
      like: Math.log(postData._count.like + 1),
      comment: Math.log(postData._count.comment + 1),
      rating: Math.log(postData._count.rating + 1),
    },
    value: {
      rating: ratingScore,
    },
  };

  let baseScore = Number(
    (
      metrics.count.like * LIKE_WEIGHT +
      metrics.count.comment * COMMENT_WEIGHT +
      metrics.count.rating * RATING_COUNT_WEIGHT +
      metrics.value.rating * RATING_SCORE_WEIGHT
    ).toFixed(1),
  );

  if (baseScore === 0) {
    baseScore = 1; // Ensure a minimum base score to avoid zero feed score
  }
  const decay = 1 / (postAge + 2) ** 1.8;

  const feedScore = baseScore * decay;

  return feedScore;
};
