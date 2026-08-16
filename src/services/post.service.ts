import type { Prisma } from "@prisma/client/extension";
import { prisma } from "../../db.js";
import { paginate } from "../utils/paginate.js";

export const createPost = async (
  authorId: string,
  caption: string,
  media: string[],
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
        data: media.map((mediumUrl) => {
          return {
            postId: postId,
            mediaUrl: mediumUrl,
          };
        }),
      });

      postData.postMedia = postMedia;
      return postData;
    },
  );
  return post;
};

export const registerLike = async (likedByUserId: string, postId: string) => {
  const [registeredLike, totalLikeCount] = await prisma.$transaction([
    prisma.like.create({
      data: {
        postId: postId,
        likedByUserId: likedByUserId,
        postLiked: true,
      },
    }),
    prisma.like.count({
      where: {
        postId: postId,
      },
    }),
  ]);
  return { ...registeredLike, likeCount: totalLikeCount };
};

export const deleteLike = async (likedByUserId: string, postId: string) => {
  const [deletedLike, totalLikeCount] = await prisma.$transaction([
    prisma.like.delete({
      where: {
        likedUser: {
          postId: postId,
          likedByUserId: likedByUserId,
        },
      },
    }),
    prisma.like.count({
      where: {
        postId: postId,
      },
    }),
  ]);
  return {
    id: deletedLike.id,
    postId: deletedLike.postId,
    postLiked: false,
    likeCount: totalLikeCount,
  };
};

export const registerScore = async (
  ratedByUserId: string,
  postId: string,
  score: number,
) => {
  const registeredScore = await prisma.rating.create({
    data: {
      postId: postId,
      ratedByUserId: ratedByUserId,
      score: score,
    },
  });
  return registeredScore;
};

export const registerComment = async (
  commentedByUserId: string,
  postId: string,
  comment: string,
) => {
  const registeredComment = await prisma.comment.create({
    data: {
      postId: postId,
      commentedByUserId: commentedByUserId,
      comment: comment,
    },
  });
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

export const getPostRating = async (postIds: [string]) => {
  const postRating = await prisma.rating.groupBy({
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

export const getComment = async (postId: string) => {
  const page = 1;
  const pageSize = 10;
  const model = "comment";
  const comments = await paginate(
    page,
    pageSize,
    model,
    {
      postId: postId,
    },
    {},
  );
  return comments;
};

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
