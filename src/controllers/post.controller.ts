import type { Request, Response } from "express";
import { Comment, Post, Score } from "../models/post.model.js";
import * as postService from "../services/post.service.js";
import { paginate } from "../utils/paginate.js";

export const createPost = async (req: Request, res: Response) => {
  try {
    const authorId = req.uid ?? "";
    const { caption, media } = Post.parse(req.body);
    const post = await postService.createPost(authorId, caption ?? "", media);

    res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (err) {
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
    const commentedByUser = await postService.getUserData(id);
    const response = {
      ...registeredComment,
      commentor: { ...commentedByUser },
    };
    res.status(200).json({
      success: true,
      message: "comment added successfully",
      data: response,
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
  };
  _count: {
    like: number;
    comment: number;
    rating: number;
  };
  like: [];
  rating: [];
}

export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const id = req.uid ?? "";
    const post = await postService.getPost(id, postId);
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

export const getPosts = async (req: Request, res: Response) => {
  try {
    const id = req.uid ?? "";
    const pageSize = 5;
    const modelName = "post";
    const page = Number(req.query.page ?? 1);
    const posts = await paginate(
      page,
      pageSize,
      modelName,
      {},
      {
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
          },
        },
        _count: {
          select: { like: true, comment: true, rating: true },
        },
      },
    );

    const postIds = posts.items.map((post: Post) => post.id);

    const postRating = await postService.getPostRating(postIds);

    posts.items = posts.items.map((post: Post) => {
      const filteredRating = postRating.filter((rating: Rating) => {
        return rating.postId == post.id;
      });

      const ratingScore =
        filteredRating.length != 0
          ? filteredRating.map((rating: Rating) => {
              return { score: Math.round(rating._avg.score) ?? 0, total: 10 };
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
        },
        isLikedByUser: post.like.length != 0 ? true : false,
        isRatedByUser: post.rating.length != 0 ? true : false,
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

export const getComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const comments = await postService.getComment(postId);
    const commentorIds: [string] = comments.items.map(
      (comment: Comment) => comment.commentedByUserId,
    );
    const commentors = await postService.getCommentors(commentorIds);

    comments.items = comments.items.map((comment: Comment) => {
      comment.commentor = commentors.filter((commentor: Commentor) => {
        return commentor.id == comment.commentedByUserId;
      })[0];
      return {
        ...comment,
        commentor: comment.commentor,
      };
    });

    res.status(200).json({
      success: true,
      data: comments,
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
    const pageSize = 10;
    const modelName = "post";
    const page = Number(req.query.page ?? 1);
    const userPosts = await paginate(
      page,
      pageSize,
      modelName,
      {
        author: {
          username: username,
        },
      },
      {
        postMedia: true,
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            pfpUrl: true,
          },
        },
        _count: {
          select: { like: true, comment: true },
        },
      },
    );

    const postIds = userPosts.items.map((post: Post) => post.id);

    const postsRating = await postService.getPostRating(postIds);

    userPosts.items = userPosts.items.map((post: Post) => {
      const postRating = postsRating.find(
        (rating: Rating) => rating.postId === post.id,
      );
      if (postRating) {
        post.rating = {
          score: Math.round(postRating._avg.score) ?? 0,
          total: 10,
        };
      } else {
        post.rating = {
          score: 0,
          total: 10,
        };
      }
      return {
        id: post.id,
        author: post.author,
        caption: post.caption,
        media: post.postMedia,
        createdAt: post.createdAt,
        rating: post.rating,
        like: { count: post._count.like },
        comment: { count: post._count.comment },
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
