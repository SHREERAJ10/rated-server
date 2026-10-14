import type { Prisma } from "@prisma/client/extension";
import { prisma } from "../../db.js";
import { cursorPagination } from "../utils/cursorPagination.js";
import { NotificationType } from "./post.service.js";

export const activateUser = async (
  id: string,
  username: string,
  displayName: string,
  bio: string,
  pfpUrl: string,
) => {
  const user = await prisma.user.create({
    data: {
      id: id,
      username: username,
      displayName: displayName,
      pfpUrl: pfpUrl,
      bio: bio,
    },
  });
  return user;
};

export const getUser = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return user;
};

export const getOnboardingStatus = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
};

export const fetchUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
};

export const isNotificationRead = async (userId: string) => {
  const status = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const lastReadAt = (
        await tx.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            lastReadAt: true,
          },
        })
      )?.lastReadAt;
      const notifications = await prisma.notification.findFirst({
        where: {
          recipientId: userId,
          createdAt: {
            gt: lastReadAt,
          },
        },
      });
      return notifications;
    },
  );
  if (status) {
    return false;
  }
  return true;
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

export const updateNotificationStatus = async (userId: string) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      lastReadAt: new Date().toISOString(),
    },
  });
};

export const fetchUsers = async (
  query: string,
  limit: number,
  offset: number,
) => {
  const search = query.trim();
  const pattern = `%${search}%`;
  const count = await prisma.$queryRaw`
    SELECT COUNT(*)
    FROM "User"
    WHERE username ILIKE ${pattern}
     OR "displayName" ILIKE ${pattern}
    `;
  const totalCount = Number(count[0].count);
  const users = await prisma.$queryRaw`
    SELECT id, username, "displayName", "pfpUrl"
  FROM "User"
  WHERE username ILIKE ${pattern}
     OR "displayName" ILIKE ${pattern}
  ORDER BY
    CASE WHEN username ILIKE ${search} THEN 0
     WHEN username ILIKE ${`${search}%`} THEN 1
     WHEN "displayName" ILIKE ${search} THEN 2
     WHEN "displayName" ILIKE ${`${search}%`} THEN 3
    ELSE 4
  END
  LIMIT ${limit} OFFSET ${offset}
    `;
  const response = {
    items: users,
    totalCount: totalCount,
  };
  return response;
};
