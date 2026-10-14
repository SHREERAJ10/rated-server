import express, { Router } from "express";
import {
  createPost,
  deleteLike,
  getComments,
  getPostLikers,
  getPostsCursor,
  getSinglePost,
  registerComment,
  registerLike,
  registerScore,
  removeRating,
} from "../controllers/post.controller.js";

const router: Router = express.Router();

router.post("/:postId/like", registerLike);
router.delete("/:postId/unlike", deleteLike);
router.put("/:postId/rate", registerScore);
router.delete("/:postId/rate", removeRating);
router.post("/:postId/comment", registerComment);
router.get("/:postId/comment", getComments);
router.get("/:postId/like", getPostLikers);
router.get("/:postId", getSinglePost);
router.post("/", createPost);
router.get("/", getPostsCursor);

export default router;
