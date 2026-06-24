import type { Request, Response } from "express";
import { Post } from "../models/post.model.js";
import * as postService from "../services/post.service.js";

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
