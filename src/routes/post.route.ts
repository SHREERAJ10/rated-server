import express, { Router } from "express";
import {
  createPost,
  deleteLike,
  getComment,
  getPost,
  getPostLikers,
  getPosts,
  getPostsCursor,
  getUserPosts,
  registerComment,
  registerLike,
  registerScore,
  removeRating,
} from "../controllers/post.controller.js";

const router: Router = express.Router();

router.get("/:postId", getPost);
router.post("/:postId/like", registerLike);
router.delete("/:postId/unlike", deleteLike);
router.put("/:postId/rate", registerScore);
router.delete("/:postId/rate", removeRating);
router.post("/:postId/comment", registerComment);
router.get("/:postId/comment", getComment);
router.get("/:postId/like", getPostLikers);
router.get("/:username", getUserPosts);
router.post("/", createPost);
router.get("/", getPostsCursor);

export default router;
