import type { Request, Response } from "express";
import { Comment, Post, Score } from "../models/post.model.js";
import * as postService from "../services/post.service.js";
import {
  cursorPagination,
  type CursorPaginationParams,
} from "../utils/cursorPagination.js";
import { rollbackMedia } from "../utils/rollbackMedia.js";

export const createPost = async (req: Request, res: Response) => {
  const postData = req.body;
  try {
    const authorId = req.uid ?? "";
    const { caption, media } = Post.parse(postData);
    const post = await postService.createPost(authorId, caption ?? "", media);

    res.status(200).json({
      success: true,
      message: "Post has been shared",
      data: post,
    });
  } catch (err) {
    const { media } = postData;
    const mediaToRollback = media?.map(
      (medium: { publicId: string }) => medium.publicId,
    );
    await rollbackMedia(mediaToRollback);
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const registerLike = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const postId = req.params.postId as string;
    const registeredLike = await postService.registerLike(id, postId);

    res.status(200).json({
      success: true,
      message: "Post Liked",
      data: registeredLike,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const deleteLike = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const postId = req.params.postId as string;
    const deletedLike = await postService.deleteLike(id, postId);
    res.status(200).json({
      success: true,
      message: "Post Unliked",
      data: deletedLike,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const registerScore = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const postId = req.params.postId as string;
    const { score } = Score.parse(req.body);
    const registeredScore = await postService.registerScore(id, postId, score);
    res.status(200).json({
      success: true,
      message: "Post rated",
      data: registeredScore,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const registerComment = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const postId = req.params.postId as string;
    const { comment } = Comment.parse(req.body);
    const registeredComment = await postService.registerComment(
      id,
      postId,
      comment,
    );

    res.status(200).json({
      success: true,
      message: "comment added successfully",
      data: registeredComment,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

interface Author {
  id: string;
  displayName: string;
  username: string;
}

interface PostMedia {
  id: string;
  postId: string;
  mediaUrl: string;
}

interface Rating {
  _avg: {
    score: number;
  };
  postId: string;
}

interface Post {
  id: string;
  authorId: string;
  caption: string;
  createdAt: string;
  author: Author;
  postMedia: PostMedia;
  ratingScore: {
    score: number;
    total: number;
    userRatingScore: number;
  };
  _count: {
    like: number;
    comment: number;
    rating: number;
  };
  feedScore: number;
  like: [];
  rating: [];
}

export const getSinglePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const id = req.uid ?? "";
    const post = await postService.getSinglePost(id, postId);
    const postRating = await postService.getPostRating([postId]);

    const response = {
      id: post.id,
      caption: post.caption,
      createdAt: post.createdAt,
      author: post.author,
      media: post.postMedia,
      rating: { score: Math.round(postRating[0]?._avg?.score) || 0, total: 10 },
      like: {
        count: post._count.like,
      },
      comment: {
        count: post._count.comment,
      },
      isLikedByUser: post.like.length != 0 ? true : false,
    };
    res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const getPostsCursor = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const postId = req.query.cursor as string;
    const take = 5;
    const model = "post";
    const myCursor = postId
      ? {
          id: postId,
        }
      : null;
    const cursorPaginationArgs: CursorPaginationParams = {
      take: take,
      model: model,
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
        rating: {
          where: {
            ratedByUserId: id,
          },
          select: {
            id: true,
            score: true,
          },
        },
        _count: {
          select: { like: true, comment: true, rating: true },
        },
      },
      cursor: myCursor,
      orderBy: [
        {
          feedScore: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    };
    const posts = await cursorPagination(cursorPaginationArgs);

    const postIds = posts.items.map((post: Post) => post.id);

    const postRating = await postService.getPostRating(postIds);

    posts.items = posts.items.map((post: Post) => {
      const filteredRating = postRating.filter((rating: Rating) => {
        return rating.postId == post.id;
      });

      const ratingScore =
        filteredRating.length != 0
          ? filteredRating.map((rating: Rating) => {
              const score = Number(rating._avg.score.toFixed(1));
              return { score: score ?? 0, total: 10 };
            })[0]
          : { score: 0, total: 10 };

      return {
        id: post.id,
        caption: post.caption,
        createdAt: post.createdAt,
        author: post.author,
        media: post.postMedia,
        like: {
          count: post._count.like,
        },
        comment: {
          count: post._count.comment,
        },
        ratingScore: {
          count: post._count.rating,
          data: ratingScore,
          userRatingScore: post.rating[0]?.score,
        },
        isLikedByUser: post.like.length != 0 ? true : false,
        isRatedByUser: post.rating.length != 0 ? true : false,
        feedScore: post.feedScore,
      };
    });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

interface Commentor {
  id: string;
  displayName: string;
  username: string;
}

interface Comment {
  id: string;
  comment: string;
  commentedByUserId: string;
  createdAt: string;
  commentor: Commentor;
}

export const getComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const cursor = req.query.cursor
      ? {
          id: req.query.cursor,
        }
      : null;
    const paginationParams = {
      take: 5,
      model: "comment",
      where: {
        postId: postId,
      },
      cursor: cursor,
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
    };
    const comments = await cursorPagination(paginationParams);
    const commentorIds: [string] = comments.items.map(
      (comment: Comment) => comment.commentedByUserId,
    );
    const commentors = await postService.getCommentors(commentorIds);
    const response = {
      ...comments,
      items: comments.items.map((comment: Comment) => {
        comment.commentor = commentors.filter((commentor: Commentor) => {
          return commentor.id == comment.commentedByUserId;
        })[0];
        return {
          ...comment,
          commentor: comment.commentor,
        };
      }),
    };
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const getPostLikers = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const postLikers = await postService.getPostLikers(postId);

    res.status(200).json({
      success: true,
      data: postLikers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string;
    const viewerId = req.uid ?? "";
    const postId = req.query.cursor as string;
    const take = 5;
    const model = "post";
    const myCursor = postId
      ? {
          id: postId,
        }
      : null;
    const cursorPaginationArgs: CursorPaginationParams = {
      take: take,
      model: model,
      where: {
        author: {
          username: username,
        },
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
            likedByUserId: viewerId,
          },
          select: {
            id: true,
          },
        },
        rating: {
          where: {
            ratedByUserId: viewerId,
          },
          select: {
            id: true,
            score: true,
          },
        },
        _count: {
          select: { like: true, comment: true, rating: true },
        },
      },
      cursor: myCursor,
      orderBy: {
        createdAt: "desc",
      },
    };

    const userPosts = await cursorPagination(cursorPaginationArgs);

    const postIds = userPosts.items.map((post: Post) => post.id);

    const postsRating = await postService.getPostRating(postIds);

    userPosts.items = userPosts.items.map((post: Post) => {
      const filteredRating = postsRating.filter((rating: Rating) => {
        return rating.postId == post.id;
      });

      const ratingScore =
        filteredRating.length != 0
          ? filteredRating.map((rating: Rating) => {
              const score = Number(rating._avg.score.toFixed(1));
              return { score: score ?? 0, total: 10 };
            })[0]
          : { score: 0, total: 10 };

      return {
        id: post.id,
        author: post.author,
        caption: post.caption,
        media: post.postMedia,
        createdAt: post.createdAt,
        like: {
          count: post._count.like,
        },
        comment: {
          count: post._count.comment,
        },
        ratingScore: {
          count: post._count.rating,
          data: ratingScore,
          userRatingScore: post.rating[0]?.score,
        },
        isLikedByUser: post.like.length != 0 ? true : false,
        isRatedByUser: post.rating.length != 0 ? true : false,
      };
    });

    res.status(200).json({
      success: true,
      data: userPosts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};

export const removeRating = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const postId = req.params.postId as string;
    const removeRating = await postService.removeRating(id, postId);
    res.status(200).json({
      success: true,
      data: removeRating,
      message: "Rating has been removed",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "internal server error!" });
  }
};
