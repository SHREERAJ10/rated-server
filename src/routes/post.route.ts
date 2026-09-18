import express, { Router } from "express";
import {
  createPost,
  deleteLike,
  getComments,
  getNotification,
  getNotificationStatus,
  getPostLikers,
  getPostsCursor,
  getSinglePost,
  getUserPosts,
  registerComment,
  registerLike,
  registerScore,
  removeRating,
} from "../controllers/post.controller.js";

const router: Router = express.Router();

router.get("/notification", getNotification);
router.get('/notification/status', getNotificationStatus);
router.post("/:postId/like", registerLike);
router.delete("/:postId/unlike", deleteLike);
router.put("/:postId/rate", registerScore);
router.delete("/:postId/rate", removeRating);
router.post("/:postId/comment", registerComment);
router.get("/:postId/comment", getComments);
router.get("/:postId/like", getPostLikers);
router.get("/:postId", getSinglePost);
router.get("/:username", getUserPosts);
router.post("/", createPost);
router.get("/", getPostsCursor);

export default router;
