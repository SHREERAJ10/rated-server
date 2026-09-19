import type { Prisma } from "@prisma/client/extension";
import { prisma } from "../../db.js";
import { paginate } from "../utils/paginate.js";
import { FeedRank } from "../utils/FeedRank.js";
import { cursorPagination } from "../utils/cursorPagination.js";

export const isUnreadNotification = async (userId: string) => {
  const notifications = await prisma.notification.findFirst({
    where: {
      recipientId: userId,
      isRead: false,
    },
  });
  return notifications;
};

export const getNotifications = async (
  userId: string,
  cursor: { id: string } | null,
) => {
  const response = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const notifications = await cursorPagination({
        model: "notification",
        take: 8,
        where: {
          recipientId: userId,
        },
        cursor: cursor,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
      });
      const actorIds = notifications.items.map(
        (notification) => notification.actorId,
      );
      const postIds = notifications.items.map(
        (notification) => notification.postId,
      );

      const postsWithRating = notifications.items
        .filter((notification) => notification.type === NotificationType.Rate)
        .map((notification) => {
          return { actorId: notification.actorId, postId: notification.postId };
        });

      const actorData = await tx.user.findMany({
        where: {
          id: {
            in: actorIds,
          },
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          pfpUrl: true,
        },
      });

      const postThumbnails = await tx.postMedia.findMany({
        where: {
          postId: {
            in: postIds,
          },
        },
        select: {
          postId: true,
          mediaUrl: true,
        },
      });

      let ratings = [];

      if (postsWithRating.length > 0) {
        ratings = await tx.rating.findMany({
          where: {
            ratedByUserId: {
              in: postsWithRating.map((post) => post.actorId),
            },
            postId: {
              in: postsWithRating.map((post) => post.postId),
            },
          },
        });
      }

      notifications.items = notifications.items.map((notification) => {
        const actor = actorData.find(
          (actor) => actor.id === notification.actorId,
        );
        const post = postThumbnails.find(
          (post) => post.postId === notification.postId,
        );

        const { recipientId, actorId, postId, ...notificationDetails } = {
          ...notification,
        };

        const response = {
          ...notificationDetails,
          actor: { ...actor },
          post: post,
        };

        let rating;
        if (notification.type === NotificationType.Rate) {
          rating = ratings.find(
            (rating) =>
              rating.postId === notification.postId &&
              rating.ratedByUserId === notification.actorId,
          );
        }

        if (rating) {
          response.rating = {
            score: rating.score,
            total: 10,
          };
        }
        return response;
      });
      return notifications;
    },
  );
  return response;
};

export const createPost = async (
  authorId: string,
  caption: string,
  media: { url: string }[],
) => {
  const post = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const postData = await tx.post.create({
        data: {
          authorId: authorId,
          caption: caption,
        },
      });
      const postId = postData.id;
      const postMedia = await tx.postMedia.createManyAndReturn({
        data: media.map((medium) => {
          return {
            postId: postId,
            mediaUrl: medium.url,
          };
        }),
      });
      const feedScore = await FeedRank(postId, tx);
      await tx.post.update({
        where: {
          id: postId,
        },
        data: {
          feedScore: feedScore,
        },
      });

      postData.postMedia = postMedia;
      return postData;
    },
  );
  return post;
};

export const registerLike = async (likedByUserId: string, postId: string) => {
  const response = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const registeredLike = await tx.like.create({
        data: {
          postId: postId,
          likedByUserId: likedByUserId,
          postLiked: true,
        },
      });
      const totalLikeCount = await tx.like.count({
        where: {
          postId: postId,
        },
      });
      const post = await scorePost(postId, tx);
      const authorId = post.authorId;

      const notification = {
        actorId: likedByUserId,
        recipientId: authorId,
        postId: postId,
        type: NotificationType.Like,
      };

      await storeNotification(tx, notification);
      return {
        ...registeredLike,
        likeCount: totalLikeCount,
      };
    },
  );
  return response;
};

export const getUserData = async (userId: string) => {
  const user = prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      pfpUrl: true,
    },
  });
  return user;
};

export const deleteLike = async (likedByUserId: string, postId: string) => {
  const response = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const deletedLike = tx.like.delete({
        where: {
          likedUser: {
            postId: postId,
            likedByUserId: likedByUserId,
          },
        },
      });
      const totalLikeCount = await tx.like.count({
        where: {
          postId: postId,
        },
      });

      await scorePost(postId, tx);

      return { ...deletedLike, likeCount: totalLikeCount };
    },
  );
  return response;
};

export const registerScore = async (
  ratedByUserId: string,
  postId: string,
  score: number,
) => {
  const response = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const registeredRating = await tx.rating.upsert({
        where: {
          ratedByUser: {
            postId: postId,
            ratedByUserId: ratedByUserId,
          },
        },
        update: {
          score: score,
        },
        create: {
          postId: postId,
          ratedByUserId: ratedByUserId,
          score: score,
        },
      });
      const post = await scorePost(postId, tx);
      const authorId = post.authorId;

      const notification = {
        actorId: ratedByUserId,
        recipientId: authorId,
        postId: postId,
        type: NotificationType.Rate,
      };

      await storeNotification(tx, notification);
      return registeredRating;
    },
  );

  return response;
};

export const registerComment = async (
  commentedByUserId: string,
  postId: string,
  comment: string,
) => {
  const registeredComment = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const registeredComment = await tx.comment.create({
        data: {
          postId: postId,
          commentedByUserId: commentedByUserId,
          comment: comment,
        },
      });
      const commentor = tx.user.findUnique({
        where: {
          id: commentedByUserId,
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          pfpUrl: true,
        },
      });
      const post = await scorePost(postId, tx);
      const authorId = post.authorId;

      const notification = {
        actorId: commentedByUserId,
        recipientId: authorId,
        postId: postId,
        type: NotificationType.Comment,
      };

      await storeNotification(tx, notification);
      return {
        ...registeredComment,
        commentor: { ...commentor },
      };
    },
  );
  return registeredComment;
};

export const getPostMedia = async (postIds: [string]) => {
  const postMedia = await prisma.postMedia.findMany({
    where: {
      postId: {
        in: postIds,
      },
    },
  });
  return postMedia;
};

export const getAuthors = async (authorIds: [string]) => {
  const authors = await prisma.user.findMany({
    where: {
      id: {
        in: authorIds,
      },
    },
    select: {
      id: true,
      displayName: true,
      username: true,
    },
  });
  return authors;
};

export const getLikeCountOfEachPost = async (postIds: [string]) => {
  const likeCount = await prisma.like.groupBy({
    by: ["postId"],
    where: {
      postId: {
        in: postIds,
      },
    },
    _count: { likedByUserId: true },
  });
  return likeCount;
};

export const getPostRating = async (
  postIds: [string],
  db: Prisma.TransactionClient | typeof prisma = prisma,
) => {
  const postRating = await db.rating.groupBy({
    by: ["postId"],
    where: {
      postId: {
        in: postIds,
      },
    },
    _avg: { score: true },
  });
  return postRating;
};

// export const getComment = async (postId: string) => {
//   const page = 1;
//   const pageSize = 10;
//   const model = "comment";
//   const comments = await paginate(
//     page,
//     pageSize,
//     model,
//     {
//       postId: postId,
//     },
//     {},
//   );
//   return comments;
// };

export const getCommentors = async (commentorIds: [string]) => {
  const commentors = await prisma.user.findMany({
    where: {
      id: {
        in: commentorIds,
      },
    },
    select: {
      id: true,
      displayName: true,
      username: true,
      pfpUrl: true,
    },
  });
  return commentors;
};

interface PostLike {
  id: string;
  postId: string;
  likedByUserId: string;
  postLiked: boolean;
}

export const getPostLikers = async (postId: string) => {
  const page = 1;
  const pageSize = 10;
  const modelName = "Like";
  const postLikers = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const postLikes = await paginate(
        page,
        pageSize,
        modelName,
        {
          postId: postId,
        },
        {},
      );
      const postLikerIds = postLikes.items.map(
        (postLike: PostLike) => postLike.likedByUserId,
      );
      postLikes.items = await tx.user.findMany({
        where: {
          id: {
            in: postLikerIds,
          },
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          pfpUrl: true,
        },
      });
      return postLikes;
    },
  );
  return postLikers;
};

export const getSinglePost = async (id: string, postId: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      postMedia: true,
      author: {
        select: {
          id: true,
          displayName: true,
          username: true,
          pfpUrl: true,
        },
      },
      like: {
        where: {
          likedByUserId: id,
        },
        select: {
          id: true,
        },
      },
      _count: {
        select: { like: true, comment: true },
      },
    },
  });

  return post;
};

export const removeRating = async (id: string, postId: string) => {
  const removeRating = await prisma.rating.delete({
    where: {
      ratedByUser: {
        ratedByUserId: id,
        postId: postId,
      },
    },
  });
  return removeRating;
};

export const scorePost = async (
  postId: string,
  db: Prisma.TransactionClient,
) => {
  const feedScore = await FeedRank(postId, db);
  const scoredPost = await db.post.update({
    where: {
      id: postId,
    },
    data: {
      feedScore: feedScore,
    },
  });
  return scoredPost;
};

export enum NotificationType {
  Like = "LIKE",
  Comment = "COMMENT",
  Rate = "RATE",
}

interface NotificationDetails {
  recipientId: string;
  actorId: string;
  postId: string;
  type: NotificationType;
}

export const storeNotification = async (
  db: Prisma.TransactionClient,
  notification: NotificationDetails,
) => {
  await db.notification.create({
    data: notification,
  });
};
